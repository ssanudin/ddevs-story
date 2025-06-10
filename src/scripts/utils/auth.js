const LOCAL_KEY_TOKEN = 'auth_token';
const LOCAL_KEY_USER = 'auth_user';
const LOCAL_KEY_TIME = 'auth_time';
const AUTH_MAX_AGE = 1000 * 60 * 60 * 24;

function isStorageExist() {
  if (typeof Storage === 'undefined') {
    return false;
  }
  return true;
}

export function isLoggedIn() {
  const token = getAuth('token');
  const time = getAuth('time');

  if (!token || !time) return false;

  if (Date.now() - time > AUTH_MAX_AGE) {
    logout();
    return false;
  }

  return true;
}

export function setAuth({ name, userId, token }) {
  if (isStorageExist()) {
    const now = Date.now();
    localStorage.setItem(LOCAL_KEY_TOKEN, token);
    localStorage.setItem(LOCAL_KEY_USER, JSON.stringify({ name, userId }));
    localStorage.setItem(LOCAL_KEY_TIME, now.toString());
  }
}

export function getAuth(key) {
  if (!['name', 'userId', 'token', 'time'].includes(key)) return null;
  if (!isStorageExist()) return null;

  if (['name', 'userId'].includes(key)) {
    const raw = localStorage.getItem(LOCAL_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } else if (key === 'token') {
    return localStorage.getItem(LOCAL_KEY_TOKEN) || null;
  } else if (key === 'time') {
    return parseInt(localStorage.getItem(LOCAL_KEY_TIME) || '0', 10);
  }

  return null;
}

export function logout() {
  if (isStorageExist()) {
    localStorage.removeItem(LOCAL_KEY_TOKEN);
    localStorage.removeItem(LOCAL_KEY_USER);
    localStorage.removeItem(LOCAL_KEY_TIME);
  }

  window.location.href = '#/login';
}
