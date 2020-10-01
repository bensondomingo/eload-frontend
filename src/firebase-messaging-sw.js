// Firebase imports
// <!-- The core Firebase JS SDK is always required and must be listed first -->
importScripts('https://www.gstatic.com/firebasejs/7.21.1/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/7.21.1/firebase-messaging.js'
);

// App;s Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAJY2LylSEeZgLc_wJukpL2kxhzxDbcd1o',
  authDomain: 'loadninja-v0704.firebaseapp.com',
  databaseURL: 'https://loadninja-v0704.firebaseio.com',
  projectId: 'loadninja-v0704',
  storageBucket: 'loadninja-v0704.appspot.com',
  messagingSenderId: '771446163925',
  appId: '1:771446163925:web:9f2acd198f9c13b3c3155c'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

// Workbox Scripts (Copied from service-worker.js build file)
// workbox.core.setCacheNameDetails({ prefix: 'frontend' });

// self.addEventListener('message', event => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });

// /**
//  * The workboxSW.precacheAndRoute() method efficiently caches and responds to
//  * requests for URLs in the manifest.
//  * See https://goo.gl/S9QRab
//  */
// self.__precacheManifest = [].concat(self.__precacheManifest || []);
// workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
