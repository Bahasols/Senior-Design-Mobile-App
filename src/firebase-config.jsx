import firebase from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyA2R7SAEUH7W5phdLS9ebrvjREcITzGh4Y",
    authDomain: "mobileattendanceapp-5f6d1.firebaseapp.com",
    projectId: "mobileattendanceapp-5f6d1",
    storageBucket: "mobileattendanceapp-5f6d1.appspot.com",
    messagingSenderId: "1093712067613",
    appId: "1:1093712067613:web:a6558ce58822e52f651af4",
    measurementId: "G-3TSM8ZG5VX",
    databaseURL: "https://console.firebase.google.com/project/mobileattendanceapp-5f6d1/firestore/data/~2Fusers~2FjFaijsHIPLMt9793a08krRFecb02"
  };
  
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  export default firebaseConfig;