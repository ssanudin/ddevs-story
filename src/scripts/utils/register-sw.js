export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.warning('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    // console.log('Service Worker registered, scope:', registration.scope);

    registration.addEventListener('updatefound', () => {
      const newSW = registration.installing;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && registration.waiting) {
          // do the user interaction about the update is better
          window.location.reload();
        }
      });
    });
  } catch (error) {
    console.warn('Failed to install service worker:', error);
  }
}
