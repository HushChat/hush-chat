// firebase-messaging-sw.js
/* eslint-disable */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.debug("[firebase-messaging-sw.js] Received background message ", payload);
  const { title, body, conversationId, messageId } = payload.data;
  const notificationOptions = {
    body: body,
    icon: "/icon.png",
    data: {
      conversationId: conversationId,
      messageId: messageId,
      url: conversationId ? `/conversations/${conversationId}` : "/",
    },
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const absoluteUrlToOpen = new URL(urlToOpen, self.location.origin).href;
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url == absoluteUrlToOpen && "focus" in client) {
          if ("navigate" in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
