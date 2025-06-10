import Swal from 'sweetalert2';

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function escapeHtml(text) {
  if (text == null) return '';
  return text
    .replace(/&/g, '&amp;') // Must do & first!
    .replace(/</g, '&lt;') // Then <
    .replace(/>/g, '&gt;') // Then >
    .replace(/"/g, '&quot;') // Double quote
    .replace(/'/g, '&#039;'); // Single quote
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export const notifCommon = Swal.mixin({
  showConfirmButton: false,
  showCloseButton: true,
  didOpen: () => {
    Swal.hideLoading();
  },
  showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
  },
});

export const notifAutoClose = Swal.mixin({
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
  timerProgressBar: true,
  didOpen: () => {
    Swal.hideLoading();
  },
  showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
  },
});

export const actionLoading = Swal.mixin({
  allowOutsideClick: false,
  allowEscapeKey: false,
  didOpen: () => {
    Swal.showLoading();
  },
  showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
  },
});
