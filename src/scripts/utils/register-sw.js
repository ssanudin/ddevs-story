export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.warning('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { type: 'module' });
    console.log('Service Worker registered, scope:', registration.scope);

    // Optionally listen for new worker state changes:
    registration.addEventListener('updatefound', () => {
      const newSW = registration.installing;
      newSW?.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New SW installed - reloading');
          window.location.reload();
        }
      });
    });
  } catch (error) {
    console.warn('Failed to install service worker:', error);
  }
}
