// ClientSprint Service Worker Neutralizer
self.addEventListener("install", () => {
    // Force the new, empty service worker to activate immediately
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    // Take control of all browser tabs immediately
    event.waitUntil(self.clients.claim());
    
    // Nuclear clear: Delete every single piece of old cached site data
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            console.log("[ClientSprint] Purging corrupt legacy cache:", cache);
            return caches.delete(cache);
          })
        );
      })
    );
    
    console.log("[ClientSprint] Core network pipeline fully cleared and restored.");
  });
  
  // Pass-through fetch handler: Stops the worker from stealing or changing packets
  self.addEventListener("fetch", (event) => {
    // Do absolutely nothing. Let the browser fetch directly from the internet/Supabase.
    return;
  });