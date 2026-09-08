(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var requested = params.get('redirect') || '';
  var toastTimer;

  function showToast(message, type) {
    var toast = document.getElementById('auth-toast');
    toast.textContent = message;
    toast.className = 'auth-toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.className = 'auth-toast'; }, 4200);
  }

  function selectTab(tab) {
    var visibleTab = tab === 'reset' ? 'login' : tab;
    document.querySelectorAll('[data-auth-tab]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.authTab === visibleTab);
    });
    document.querySelectorAll('[data-auth-view]').forEach(function (view) {
      view.classList.toggle('active', view.dataset.authView === tab);
    });
    document.title = (tab === 'register' ? 'Đăng ký' : tab === 'reset' ? 'Đặt mật khẩu mới' : 'Đăng nhập') + ' | NutriMart AI';
  }

  function setFormsEnabled(enabled) {
    document.querySelectorAll('#login-form input,#login-form button,#register-form input,#register-form button,#reset-form input,#reset-form button').forEach(function (element) {
      element.disabled = !enabled;
    });
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
      errorBox.textContent = error.message;
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
        form.reset();
        selectTab('login');
        showToast('Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.','success');
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
  if (params.get('confirmed') === '1') showToast('Email đã được xác nhận. Bạn có thể đăng nhập.','success');
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
