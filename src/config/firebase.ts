import firebase, { getApps, initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const firebaseConfig = {
  // Firebase Console'dan alınan config bilgileri buraya gelecek
  apiKey: "AIzaSyAsyGv6B6FHSkbllCt5OpVXA_Dc9ZnFFHw",
  authDomain: "be4yougo.firebaseapp.com",
  projectId: "be4yougo",
  storageBucket: "be4yougo.firebasestorage.app",
  messagingSenderId: "971128462559",
  appId: "1:971128462559:android:e8e37bb1c6571f2b929d6a"
};

console.log("firebase.apps.length before" + firebase.apps.length);  
// Firebase'i başlat (eğer başlatılmamışsa)
// Firebase başlatma
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps();
}

console.log("firebase.apps.length after" + firebase.apps.length);  
// Google Sign-In yapılandırması
GoogleSignin.configure({
  webClientId: '971128462559-nc3bs33h5vs6i22m45nm6vo6sjehbefv.apps.googleusercontent.com',
});

export { auth, GoogleSignin }; 