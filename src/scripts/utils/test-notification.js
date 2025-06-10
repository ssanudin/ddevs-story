export async function testPushNotification() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser.');
    return;
  }

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Notification permission denied.');
      return;
    }
  }

  const registration = await navigator.serviceWorker.getRegistration('scripts/');
  if (!registration) {
    console.error('No active service worker registration found.');
    return;
  }

  const title = 'Test Notification';
  const options = {
    body: 'This is a test push notification.',
  };

  registration.showNotification(title, options);
  console.log('Test notification triggered.');
}
