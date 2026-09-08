(function () {
  'use strict';

  var client = null;
  var cachedUser = null;
  var cachedProfiles = [];
  var config = window.NM_SUPABASE || {};

  function configured() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(String(config.url || '')) &&
      /^(sb_publishable_|eyJ)/.test(String(config.publishableKey || ''));
  }

  function configError() {
    var error = new Error('Supabase chưa được kết nối. Hãy thêm Project URL và Publishable key.');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    return error;
  }

  async function loadSdk() {
    if (!configured()) throw configError();
    if (window.supabase && window.supabase.createClient) return window.supabase;
    await new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-supabase-sdk]');
      if (existing) {
        existing.addEventListener('load', resolve, {once:true});
        existing.addEventListener('error', reject, {once:true});
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.dataset.supabaseSdk = 'true';
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Không tải được thư viện đăng nhập Supabase.')); };
      document.head.appendChild(script);
    });
    return window.supabase;
  }

  function cleanProfile(profile, authUser) {
    if (!profile) return null;
    return {
      id: profile.id,
      name: profile.name || (authUser && authUser.user_metadata && authUser.user_metadata.name) || 'Người dùng',
      username: profile.username || '',
      email: profile.email || (authUser && authUser.email) || '',
      phone: profile.phone || '',
      address: profile.address || '',
      role: profile.role || 'customer',
      active: profile.active !== false,
      createdAt: profile.created_at || ''
    };
  }

  async function fetchCurrentProfile() {
    var response = await client.auth.getUser();
    if (response.error || !response.data.user) {
      cachedUser = null;
      return null;
    }
    var authUser = response.data.user;
    var profileResponse = await client.from('profiles').select('*').eq('id', authUser.id).single();
    if (profileResponse.error) throw new Error('Không tải được hồ sơ tài khoản: ' + profileResponse.error.message);
    cachedUser = cleanProfile(profileResponse.data, authUser);
    if (!cachedUser.active) {
      await client.auth.signOut();
      cachedUser = null;
      throw new Error('Tài khoản này đã bị khóa.');
    }
    return cachedUser;
  }

  async function initialize() {
    var sdk = await loadSdk();
    client = sdk.createClient(config.url, config.publishableKey, {
      auth: {persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
    });
    try {
      await fetchCurrentProfile();
    } catch (error) {
      if (error.message.indexOf('Không tải được hồ sơ') !== -1) throw error;
      cachedUser = null;
    }
    client.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_OUT') cachedUser = null;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setTimeout(function () { fetchCurrentProfile().catch(function () {}); }, 0);
      }
    });
    return cachedUser;
  }

  var ready = initialize();

  async function login(email, password) {
    await ready;
    var result = await client.auth.signInWithPassword({email:String(email || '').trim(), password:String(password || '')});
    if (result.error) throw new Error('Email hoặc mật khẩu chưa đúng.');
    return fetchCurrentProfile();
  }

  async function register(input) {
    await ready;
    var email = String(input.email || '').trim().toLocaleLowerCase('vi');
    var username = String(input.username || '').trim().toLocaleLowerCase('vi').replace(/\s+/g, '');
    if (String(input.name || '').trim().length < 2) throw new Error('Vui lòng nhập họ và tên.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email chưa đúng định dạng.');
    if (!/^[a-z0-9._-]{4,24}$/.test(username)) throw new Error('Tên đăng nhập cần 4–24 ký tự không dấu.');
    if (String(input.password || '').length < 8) throw new Error('Mật khẩu cần ít nhất 8 ký tự.');
    var redirectTo = rootUrl('auth.html?confirmed=1');
    var result = await client.auth.signUp({
      email:email,
      password:String(input.password),
      options:{
        emailRedirectTo:redirectTo,
        data:{name:String(input.name).trim(),username:username,phone:String(input.phone || '').trim()}
      }
    });
    if (result.error) throw new Error(result.error.message || 'Không thể tạo tài khoản.');
    if (!result.data.session) return {needsConfirmation:true,email:email};
    return fetchCurrentProfile();
  }

  async function resetPassword(email) {
    await ready;
    var value = String(email || '').trim();
    if (!value) throw new Error('Hãy nhập email tài khoản trước.');
    var result = await client.auth.resetPasswordForEmail(value, {redirectTo:rootUrl('auth.html?reset=1')});
    if (result.error) throw new Error(result.error.message || 'Không gửi được email khôi phục.');
    return true;
  }

  async function updatePassword(password) {
    await ready;
    var value = String(password || '');
    if (value.length < 8) throw new Error('Mật khẩu mới cần ít nhất 8 ký tự.');
    var session = await client.auth.getSession();
    if (session.error || !session.data.session) throw new Error('Liên kết khôi phục đã hết hạn hoặc không hợp lệ.');
    var result = await client.auth.updateUser({password:value});
    if (result.error) throw new Error(result.error.message || 'Không thể đổi mật khẩu.');
    return true;
  }

  async function logout() {
    if (!client) return;
    await client.auth.signOut();
    cachedUser = null;
  }

  async function getUsers() {
    await ready;
    if (!cachedUser || cachedUser.role !== 'admin') throw new Error('Chỉ quản trị viên được xem tài khoản.');
    var response = await client.from('profiles').select('*').order('created_at',{ascending:false});
    if (response.error) throw new Error(response.error.message);
    cachedProfiles = (response.data || []).map(function (profile) { return cleanProfile(profile); });
    return cachedProfiles.slice();
  }

  async function updateAccount(id, values) {
    await ready;
    if (!cachedUser || cachedUser.role !== 'admin') throw new Error('Bạn không có quyền cập nhật tài khoản.');
    var currentProfile = cachedProfiles.find(function (item) { return item.id === id; });
    var payload = {
      target_id:id,
      target_role:values.role || (currentProfile && currentProfile.role) || 'customer',
      target_active:typeof values.active === 'boolean' ? values.active : !currentProfile || currentProfile.active
    };
    var response = await client.rpc('admin_update_profile',payload);
    if (response.error) throw new Error(response.error.message);
    await getUsers();
    return cachedProfiles.find(function (item) { return item.id === id; }) || null;
  }

  async function updateProfile(values) {
    await ready;
    if (!cachedUser) throw new Error('Bạn chưa đăng nhập.');
    var update = {
      name:String(values.name || cachedUser.name).trim(),
      phone:String(values.phone || '').trim(),
      address:String(values.address || '').trim(),
      updated_at:new Date().toISOString()
    };
    var response = await client.from('profiles').update(update).eq('id',cachedUser.id).select('*').single();
    if (response.error) throw new Error(response.error.message);
    cachedUser = cleanProfile(response.data);
    return cachedUser;
  }

  function rootUrl(path) {
    var currentPath = location.pathname;
    var marker = '/nutrimart-ai/';
    var basePath = currentPath.includes(marker) ? currentPath.slice(0,currentPath.indexOf(marker) + marker.length) : currentPath.replace(/[^/]*$/, '');
    return location.origin + basePath + String(path || '').replace(/^\//,'');
  }

  function loginUrl(redirect, reason) {
    var query = new URLSearchParams();
    query.set('redirect',redirect || 'store');
    if (reason) query.set('reason',reason);
    return rootUrl('auth.html?' + query.toString());
  }

  function destination(user, requested) {
    var key = String(requested || '').toLowerCase();
    if (key === 'man' && user.role === 'admin') return rootUrl('man/?v=7.2#/DashBoard');
    if (key === 'sale' && (user.role === 'admin' || user.role === 'staff')) return rootUrl('sale/?v=7.2#/');
    if (key === 'account' || key === 'checkout') return rootUrl(key === 'checkout' ? 'index.html?resumeCheckout=1#products' : 'account.html');
    if (user.role === 'admin') return rootUrl('man/?v=7.2#/DashBoard');
    if (user.role === 'staff') return rootUrl('sale/?v=7.2#/');
    return rootUrl('account.html');
  }

  async function requireRole(roles, redirectKey) {
    try {
      await ready;
      var user = await fetchCurrentProfile();
      if (!user) {
        window.top.location.replace(loginUrl(redirectKey));
        return null;
      }
      if (roles.indexOf(user.role) === -1) {
        window.top.location.replace(loginUrl(redirectKey,'forbidden'));
        return null;
      }
      document.documentElement.classList.remove('auth-checking');
      return user;
    } catch (error) {
      var reason = error.code === 'SUPABASE_NOT_CONFIGURED' ? 'config' : 'auth';
      try { window.top.location.replace(loginUrl(redirectKey,reason)); } catch (redirectError) { location.replace(loginUrl(redirectKey,reason)); }
      return null;
    }
  }

  window.NMAuth = {
    ready:ready,
    isConfigured:configured,
    login:login,
    register:register,
    resetPassword:resetPassword,
    updatePassword:updatePassword,
    logout:logout,
    current:function () { return cachedUser; },
    getUsers:getUsers,
    updateAccount:updateAccount,
    updateProfile:updateProfile,
    requireRole:requireRole,
    loginUrl:loginUrl,
    destination:destination,
    rootUrl:rootUrl,
    roleLabel:function (role) { return {admin:'Quản trị viên',staff:'Nhân viên bán hàng',customer:'Khách hàng'}[role] || role; }
  };
}());
