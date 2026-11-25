
/* TANISHGG FIREBASE CONFIGURATION */

const firebaseConfig = {
  apiKey: "AIzaSyAhxcEJvdTTvKZMpYuPRgNBN5tM98NnUg",
  authDomain: "tanishgg-portfolio-cd3b0.firebaseapp.com",
  projectId: "tanishgg-portfolio-cd3b0",
  storageBucket: "tanishgg-portfolio-cd3b0.firebasestorage.app",
  messagingSenderId: "199255445890",
  appId: "1:199255445890:web:b0ca2896ac4ffd37613f9b"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.tanishDB = firebase.firestore();
window.tanishAuth = firebase.auth();
