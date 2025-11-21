self.addEventListener("install", () => {
  console.log("Service Worker installed.");
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated.");
});
