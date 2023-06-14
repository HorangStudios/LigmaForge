const isFirebaseEnv = new URLSearchParams(window.location.search).get('online');

if (isFirebaseEnv == 'true') {
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDE-mQcJoquJxLrHAcS1kZbpjUbHYQmzsE",
    authDomain: "horanghill.firebaseapp.com",
    databaseURL: "https://horanghill-default-rtdb.firebaseio.com",
    projectId: "horanghill",
    storageBucket: "horanghill.appspot.com",
    messagingSenderId: "710235265347",
    appId: "1:710235265347:web:37fb53fe0bb9c4ecdab7f6",
    measurementId: "G-S1JMDFPGL0"
  };
  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();
  const id = new URLSearchParams(window.location.search).get('id');
  const ref = firebase.database().ref(`games/${id}`);

  ref.once('value', snapshot => {
    const item = snapshot.val();
    document.getElementById('gamename').innerHTML = item.title + "<br>" + item.createdBy
    document.getElementById('pagetitle').innerText = item.title
    loadMap(item.hhls)
  });
}