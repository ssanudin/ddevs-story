import { convertBase64ToUint8Array, notifAutoClose } from '.';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }
  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();
  if (status === 'denied') {
    notifAutoClose.fire({
      icon: 'error',
      title: 'Subscribe Failed',
      text: 'Notification permission denied.',
    });
    return false;
  }
  if (status === 'default') {
    notifAutoClose.fire({
      icon: 'error',
      title: 'Subscribe Failed',
      text: 'Notification permission dismissed or ignored.',
    });
    return false;
  }

  return true;
}

export async function getRegistration() {
  return await navigator.serviceWorker.getRegistration('');
}

export async function getPushSubscription() {
  const registration = await getRegistration();
  return await registration?.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe(token) {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    notifAutoClose.fire({
      icon: 'success',
      title: 'Subscribed',
      text: 'Already subscribed to push notifications.',
    });
    return;
  }

  let pushSubscription;
  try {
    const registration = await getRegistration();
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    const { endpoint, keys } = pushSubscription.toJSON();

    const response = await subscribePushNotification({
      subscribeStatus: true,
      token,
      params: { endpoint, keys },
    });

    notifAutoClose.fire({
      icon: 'success',
      title: 'Subscribed',
      text: 'Push notification subscription successfully activated.',
    });
  } catch (error) {
    const errorMsg =
      error.name === 'HTTPError'
        ? (await error.response.json()).message
        : typeof error === 'string'
          ? error
          : 'Terjadi kesalahan';
    console.error('subscribe: error:', errorMsg);

    await pushSubscription.unsubscribe();

    notifAutoClose.fire({
      icon: 'error',
      title: 'Subscribe Failed',
      text: errorMsg || 'Push notification subscription activation failed.',
    });
  }
}

export async function unsubscribe(token) {
  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      notifAutoClose.fire({
        icon: 'warning',
        title: 'Not Subscribed',
        text: 'Please subscribe to push notifications first.',
      });
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({
      subscribeStatus: false,
      token,
      params: { endpoint },
    });

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      await subscribePushNotification({ subscribeStatus: true, token, params: { endpoint, keys } });
      throw new Error('Langganan push notification gagal dinonaktifkan.');
    }

    notifAutoClose.fire({
      icon: 'success',
      title: 'Unsubscribed',
      text: 'Push notification subscription successfully deactivated.',
    });
  } catch (error) {
    const errorMsg =
      error.name === 'HTTPError'
        ? (await error.response.json()).message
        : typeof error === 'string'
          ? error
          : error.message || 'Terjadi kesalahan';
    console.error('unsubscribe: error:', errorMsg);

    notifAutoClose.fire({
      icon: 'error',
      title: 'Unsubscribe Failed',
      text: errorMsg || 'Push notification subscription deactivation failed.',
    });
  }
}
