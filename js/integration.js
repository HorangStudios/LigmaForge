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
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById("progress").innerText = "Signing in";
        loadGames(true);

        let hour = (new Date()).getHours();
        if (hour >= 5 && hour < 12) {
            document.getElementById('greetings').innerHTML = `<i class='fa-solid fa-sun'></i> Good morning, ${sanitizeHtml(firebase.auth().currentUser.displayName)}!`;
        } else if (hour >= 12 && hour < 18) {
            document.getElementById('greetings').innerHTML = `<i class='fa-regular fa-sun'></i> Good afternoon, ${sanitizeHtml(firebase.auth().currentUser.displayName)}!`;
        } else {
            document.getElementById('greetings').innerHTML = `<i class='fa-solid fa-sun'></i> Good evening, ${sanitizeHtml(firebase.auth().currentUser.displayName)}!`;
        }
    } else {
        document.getElementById("homepage").style.display = "block";

        document.getElementById("dashboard").style.display = "none";
        document.getElementById("publish").style.display = "none";

        document.getElementById("loginCheck").style.display = "none";
        document.getElementById("loginBox").style.display = "flex";
    }
});

//publish new game
function publishNew() {
    var title = document.getElementById('gameTitle');
    var desc = document.getElementById('gameDesc');

    if (title.value) {
        grecaptcha.execute().then(() => {
            if (!grecaptcha.getResponse()) {
                window.alert("Captcha error!");
                return;
            };

            const userid = firebase.auth().currentUser.uid;
            const storageRef = firebase.database().ref('storage').push({ file: sceneSchematics, uid: userid });
            const game = {
                title: title.value,
                desc: desc.value,
                thumbnail: 'https://horanghill.web.app/css/horanghillstartingplace.png',
                createdAt: formatDate(new Date()),
                hhls: storageRef.key,
                uid: userid
            };

            firebase.database().ref('games').push(game);
            document.getElementById("homepage").style.display = "none";
            window.alert("Game published!");
            title.value = '';
            desc.value = '';
        })
    }
}

//fetch from firebase
async function firebaseFetch(dir) {
    var ref = firebase.database().ref(dir);
    const snapshot = await ref.once('value');
    return snapshot.val();
}

//format date
function formatDate(today) {
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return mm + '/' + dd + '/' + yyyy
}

//load games made by user
async function loadGames(showDashboard = false) {
    let fetchGames = await firebaseFetch('games');
    let myGames = Object.keys(fetchGames).filter(item => fetchGames[item].uid == firebase.auth().currentUser.uid);
    let list = document.getElementById("mygames");
    let publishList = document.getElementById("selectPublish");

    if (showDashboard) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("loginCheck").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    }

    list.innerHTML = '';
    publishList.innerHTML = '';
    if (myGames.length == 0) {
        document.getElementById("spacing").style.display = "none";
        document.getElementById("devgreeting").style.display = "none";
        document.getElementById("mygames").style.display = "none";
    }

    myGames.forEach(async (key) => {
        let element = fetchGames[key];

        let button = document.createElement("div");
        button.className = "gamecard";
        button.style.backgroundImage = `url(${element.thumbnail})`;
        button.innerHTML = `<b>${element.title}</b><a target="_blank" href="https://horanghill.web.app/pages/details.html?id=${key}">Edit Metadata</a><br>${element.desc}`;
        list.appendChild(button);

        let publish = button.cloneNode(true);
        publishList.appendChild(publish);

        publish.onclick = async (e) => {
            if (e.target.tagName === 'A') return;
            const response = confirm("Do you want to proceed?");
            if (!response) return;

            grecaptcha.execute().then(() => {
                if (!grecaptcha.getResponse()) {
                    window.alert("Captcha error!");
                    return;
                };

                firebase.database().ref(`storage/${element.hhls}/file`).set(sceneSchematics);
                firebase.database().ref(`games/${key}`).update({ update: formatDate(new Date()) });
                document.getElementById("homepage").style.display = "none";
                window.alert("Game updated!");
            })
        };

        button.onclick = async (e) => {
            if (e.target.tagName === 'A') return;
            sceneSchematics = (await firebaseFetch(`storage/${element.hhls}`)).file;
            document.getElementById("homepage").style.display = "none";
            listSchematic();
        };
    });
}

//login button
function loginacc() {
    var email = document.getElementById('emailLogin').value;
    var password = document.getElementById('passwordLogin').value;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) { document.getElementById('error1').innerText = error.message; });
};