const updateText = document.getElementById("updateText");
const updater = document.getElementById("updater");
const splash = document.getElementById("splash");
window.interface.onReceive((message) => {
    if (message == "no_update_available") {
        setTimeout(async () => {     
            updater.style.display = "none";
            splash.style.display = "block";
            document.getElementsByClassName('splashleft')[0].innerHTML = `
                <div>
                    <img src="resources/css/HorangHill.png" style="width: 50%; border-radius: 5px;"><br><br>
                    <span>HorangHill Desktop</span><br>
                    <span>Version ${await getVersion('package.json')}</span>
                </div>`;
        }, 1000);
    } else if (message == "update_available") {
        updateText.innerText = "Downloading update...";
    }
});

function openEditor() {
    interface.openEditor();
    window.close();
}

function openHorangHill() {
    interface.redirect("https://horanghill.web.app");
    window.close();
}