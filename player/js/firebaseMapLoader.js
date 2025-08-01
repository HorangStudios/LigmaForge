const isFirebaseEnv = new URLSearchParams(window.location.search).get('online');
const id = new URLSearchParams(window.location.search).get('id');

function loadFirebaseGame() {
  document.getElementById("gameload").style.display = "flex"
  var ref = firebase.database().ref(`games/${id}`);

  ref.once('value', snapshot => {
    const item = snapshot.val();
    document.getElementById('gamename').innerHTML = item.title + "<br>By " + item.createdBy
    document.getElementById('pagetitle').innerText = item.title
    document.getElementById('gameloader').innerText = item.title
    document.getElementById('clientversion').innerText = "By " + item.createdBy
    setTimeout(() => { loadScene(item.hhls, true, false) }, 1500);
  });
}

function loginacc() {
  event.preventDefault();

  var email = document.getElementById('emailLogin').value;
  var password = document.getElementById('passwordLogin').value;

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) { document.getElementById('error1').innerText = error.message; });
};

async function firebaseFetch(dir) {
  var ref = firebase.database().ref(dir);
  const snapshot = await ref.once('value');
  return snapshot.val();
}

if (isFirebaseEnv == 'true') {
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

  loadScene([])
  document.getElementById('quitbtn').onclick = function () {
    window.location.href = 'https://horanghill.web.app/'
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      playerUniqueID = firebase.auth().currentUser.uid
      loadFirebaseGame()
      document.getElementById("loginDialog").style.display = "none"
    } else {
      document.getElementById("loginCheck").style.display = "none"
      document.getElementById("signinbox").style.display = "block"
    }
  });
} else {
  document.getElementById("gameload").style.display = "flex"
  document.getElementById("loginDialog").style.display = "none"
}