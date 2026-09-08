(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var requested = params.get('redirect') || '';
  var toastTimer;
  var resendTimer;
  var pendingSignupEmail = '';

  function showToast(message, type) {
    var toast = document.getElementById('auth-toast');
    toast.textContent = message;
    toast.className = 'auth-toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.className = 'auth-toast'; }, 4200);
  }

  function selectTab(tab) {
    var visibleTab = tab === 'reset' ? 'login' : tab === 'verify' ? 'register' : tab;
    document.querySelectorAll('[data-auth-tab]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.authTab === visibleTab);
    });
    document.querySelectorAll('[data-auth-view]').forEach(function (view) {
      view.classList.toggle('active', view.dataset.authView === tab);
    });
    document.title = (tab === 'register' ? 'Đăng ký' : tab === 'verify' ? 'Xác nhận email' : tab === 'reset' ? 'Đặt mật khẩu mới' : 'Đăng nhập') + ' | NutriMart AI';
  }

  function setFormsEnabled(enabled) {
    document.querySelectorAll('#login-form input,#login-form button,#register-form input,#register-form button,#otp-form input,#otp-form button,#reset-form input,#reset-form button').forEach(function (element) {
      element.disabled = !enabled;
    });
  }

  function maskEmail(email) {
    var parts = String(email || '').split('@');
    if (parts.length !== 2) return email;
    var name = parts[0];
    var visible = name.length <= 2 ? name.charAt(0) : name.slice(0,2);
    return visible + '•••@' + parts[1];
  }

  function savePendingEmail(email) {
    pendingSignupEmail = String(email || '').trim().toLocaleLowerCase('vi');
    if (pendingSignupEmail) sessionStorage.setItem('nm_pending_signup_email',pendingSignupEmail);
    else sessionStorage.removeItem('nm_pending_signup_email');
  }

  function clearOtpInputs() {
    document.querySelectorAll('[data-otp-digit]').forEach(function (input) {
      input.value = '';
    });
  }

  function startResendTimer(seconds) {
    var button = document.getElementById('resend-otp');
    clearInterval(resendTimer);
    var remaining = Number(seconds || 0);
    button.disabled = remaining > 0;
    function render() {
      if (remaining <= 0) {
        clearInterval(resendTimer);
        button.disabled = false;
        button.textContent = 'Gửi lại mã';
        return;
      }
      button.textContent = 'Gửi lại sau ' + remaining + ' giây';
      remaining -= 1;
    }
    render();
    if (remaining > 0) resendTimer = setInterval(render,1000);
  }

  function showOtpView(email, allowImmediateResend) {
    savePendingEmail(email);
    document.getElementById('otp-email').textContent = maskEmail(pendingSignupEmail);
    document.getElementById('otp-error').textContent = '';
    clearOtpInputs();
    selectTab('verify');
    startResendTimer(allowImmediateResend ? 0 : 60);
    setTimeout(function () {
      var first = document.querySelector('[data-otp-digit]');
      if (first) first.focus();
    },80);
  }

  function go(user) {
    location.replace(NMAuth.destination(user,requested));
  }

  document.querySelectorAll('[data-auth-tab]').forEach(function (button) {
    button.addEventListener('click',function () { selectTab(button.dataset.authTab); });
  });

  document.querySelectorAll('.password-toggle').forEach(function (button) {
    button.addEventListener('click',function () {
      var input = button.parentElement.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      button.textContent = input.type === 'password' ? '◉' : '◌';
    });
  });

  document.getElementById('login-form').addEventListener('submit',async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var errorBox = document.getElementById('login-error');
    var button = form.querySelector('[type="submit"]');
    errorBox.textContent = '';
    button.disabled = true;
    button.querySelector('span').textContent = 'Đang đăng nhập...';
    try {
      var user = await NMAuth.login(form.elements.identifier.value,form.elements.password.value);
      showToast('Đăng nhập thành công.','success');
      setTimeout(function () { go(user); },250);
    } catch (error) {
      if (error.code === 'EMAIL_NOT_CONFIRMED') {
        showOtpView(form.elements.identifier.value,true);
        showToast('Email chưa xác nhận. Nhập mã trong email hoặc bấm gửi lại mã.','error');
      } else {
        errorBox.textContent = error.message;
      }
      button.disabled = false;
      button.querySelector('span').textContent = 'Đăng nhập';
    }
  });

  document.getElementById('register-form').addEventListener('submit',async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var errorBox = document.getElementById('register-error');
    var button = form.querySelector('[type="submit"]');
    errorBox.textContent = '';
    if (form.elements.password.value !== form.elements.confirmPassword.value) {
      errorBox.textContent = 'Hai mật khẩu chưa trùng nhau.';
      return;
    }
    if (!form.elements.terms.checked) {
      errorBox.textContent = 'Bạn cần xác nhận điều kiện sử dụng.';
      return;
    }
    button.disabled = true;
    button.querySelector('span').textContent = 'Đang tạo tài khoản...';
    try {
      var result = await NMAuth.register({
        name:form.elements.name.value, phone:form.elements.phone.value, email:form.elements.email.value,
        username:form.elements.username.value, password:form.elements.password.value
      });
      if (result.needsConfirmation) {
        var email = result.email;
        form.elements.password.value = '';
        form.elements.confirmPassword.value = '';
        showOtpView(email,false);
        showToast('Đã gửi mã xác nhận 6 số. Hãy kiểm tra hộp thư đến hoặc thư rác.','success');
      } else {
        showToast('Tạo tài khoản thành công.','success');
        setTimeout(function () { go(result); },300);
      }
    } catch (error) {
      errorBox.textContent = error.message;
    } finally {
      button.disabled = false;
      button.querySelector('span').textContent = 'Tạo tài khoản';
    }
  });

  var otpInputs = Array.prototype.slice.call(document.querySelectorAll('[data-otp-digit]'));
  otpInputs.forEach(function (input,index) {
    input.addEventListener('input',function () {
      input.value = input.value.replace(/\D/g,'').slice(-1);
      document.getElementById('otp-error').textContent = '';
      if (input.value && otpInputs[index + 1]) otpInputs[index + 1].focus();
    });
    input.addEventListener('keydown',function (event) {
      if (event.key === 'Backspace' && !input.value && otpInputs[index - 1]) otpInputs[index - 1].focus();
      if (event.key === 'ArrowLeft' && otpInputs[index - 1]) otpInputs[index - 1].focus();
      if (event.key === 'ArrowRight' && otpInputs[index + 1]) otpInputs[index + 1].focus();
    });
    input.addEventListener('paste',function (event) {
      var clipboard = event.clipboardData || window.clipboardData;
      var digits = clipboard.getData('text').replace(/\D/g,'').slice(0,6);
      if (!digits) return;
      event.preventDefault();
      otpInputs.forEach(function (field,position) {
        field.value = digits.charAt(position) || '';
      });
      otpInputs[Math.min(digits.length,6) - 1].focus();
    });
  });

  document.getElementById('otp-form').addEventListener('submit',async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var errorBox = document.getElementById('otp-error');
    var button = form.querySelector('[type="submit"]');
    var token = otpInputs.map(function (input) { return input.value; }).join('');
    errorBox.textContent = '';
    if (!pendingSignupEmail) {
      errorBox.textContent = 'Không tìm thấy email cần xác nhận. Hãy đăng ký lại.';
      return;
    }
    if (!/^\d{6}$/.test(token)) {
      errorBox.textContent = 'Hãy nhập đủ 6 chữ số trong email.';
      return;
    }
    button.disabled = true;
    button.querySelector('span').textContent = 'Đang xác nhận...';
    try {
      var user = await NMAuth.verifySignupOtp(pendingSignupEmail,token);
      savePendingEmail('');
      document.getElementById('register-form').reset();
      showToast('Xác nhận thành công. Tài khoản đã sẵn sàng sử dụng!','success');
      setTimeout(function () { go(user); },450);
    } catch (error) {
      errorBox.textContent = error.message;
      clearOtpInputs();
      otpInputs[0].focus();
    } finally {
      button.disabled = false;
      button.querySelector('span').textContent = 'Xác nhận tài khoản';
    }
  });

  document.getElementById('resend-otp').addEventListener('click',async function () {
    var button = this;
    var errorBox = document.getElementById('otp-error');
    if (!pendingSignupEmail) {
      errorBox.textContent = 'Không tìm thấy email cần xác nhận. Hãy đăng ký lại.';
      return;
    }
    button.disabled = true;
    button.textContent = 'Đang gửi...';
    errorBox.textContent = '';
    try {
      await NMAuth.resendSignupOtp(pendingSignupEmail);
      clearOtpInputs();
      startResendTimer(60);
      showToast('Đã gửi mã xác nhận mới tới email của bạn.','success');
    } catch (error) {
      errorBox.textContent = error.message;
      startResendTimer(30);
    }
  });

  document.getElementById('change-signup-email').addEventListener('click',function () {
    savePendingEmail('');
    clearInterval(resendTimer);
    selectTab('register');
    document.getElementById('register-form').elements.email.focus();
  });

  document.getElementById('reset-form').addEventListener('submit',async function (event) {
    event.preventDefault();
    var form = event.currentTarget;
    var errorBox = document.getElementById('reset-error');
    var button = form.querySelector('[type="submit"]');
    errorBox.textContent = '';
    if (form.elements.password.value !== form.elements.confirmPassword.value) {
      errorBox.textContent = 'Hai mật khẩu chưa trùng nhau.';
      return;
    }
    button.disabled = true;
    button.querySelector('span').textContent = 'Đang cập nhật...';
    try {
      await NMAuth.updatePassword(form.elements.password.value);
      await NMAuth.logout();
      history.replaceState(null,'',location.pathname);
      selectTab('login');
      showToast('Đổi mật khẩu thành công. Hãy đăng nhập lại.','success');
      form.reset();
    } catch (error) {
      errorBox.textContent = error.message;
    } finally {
      button.disabled = false;
      button.querySelector('span').textContent = 'Cập nhật mật khẩu';
    }
  });

  document.getElementById('forgot-password').addEventListener('click',async function () {
    var email = document.getElementById('login-form').elements.identifier.value;
    try {
      await NMAuth.resetPassword(email);
      showToast('Đã gửi hướng dẫn khôi phục mật khẩu tới email nếu tài khoản tồn tại.','success');
    } catch (error) {
      showToast(error.message,'error');
    }
  });

  document.getElementById('security-info').addEventListener('click',function () {
    showToast('Tài khoản được xác thực bởi Supabase; quyền truy cập được kiểm tra bằng Row Level Security.','success');
  });

  if (params.get('tab') === 'register') selectTab('register');
  if (params.get('reset') === '1') selectTab('reset');
  if (params.get('confirmed') === '1') {
    savePendingEmail('');
    showToast('Email đã được xác nhận. Bạn có thể đăng nhập.','success');
  } else if (params.get('reset') !== '1') {
    var storedPendingEmail = sessionStorage.getItem('nm_pending_signup_email');
    if (storedPendingEmail) showOtpView(storedPendingEmail,true);
  }
  if (params.get('reason') === 'forbidden') showToast('Tài khoản không có quyền truy cập khu vực đó.','error');

  if (!NMAuth.isConfigured()) {
    document.getElementById('connection-status').hidden = false;
    setFormsEnabled(false);
  } else {
    NMAuth.ready.then(function () {
      var user = NMAuth.current();
      if (user && requested) go(user);
    }).catch(function (error) {
      document.getElementById('connection-status').hidden = false;
      document.getElementById('connection-status').querySelector('span').textContent = error.message;
      setFormsEnabled(false);
    });
  }
}());
