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

export function isLoggedIn(thereIsToken = false) {
  const token = getAuth('token');
  const time = getAuth('time');

  if (thereIsToken && !token && !time) {
    return 'nodata';
  }

  if (!token || !time || Date.now() - time > AUTH_MAX_AGE) {
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
  if (!['name', 'userId', 'user', 'token', 'time'].includes(key)) return null;
  if (!isStorageExist()) return null;

  if (['name', 'userId', 'user'].includes(key)) {
    const raw = localStorage.getItem(LOCAL_KEY_USER);
    if (!raw) {
      return null;
    }
    if (key === 'user') {
      return JSON.parse(raw);
    }

    return JSON.parse(raw)[key];
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
