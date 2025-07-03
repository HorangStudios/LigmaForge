function stringGen() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 12; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function spawnCodeEditor(code, name) {
    return new Promise((resolve, reject) => {
        //configure elements
        var section = document.documentElement;
        var window = document.createElement("div");
        var header = document.createElement("div");
        var content = document.createElement("div");
        var webview = document.createElement("textarea");
        var close = document.createElement("button");
        var appID = stringGen();

        //create window
        window.classList.add('window');
        window.id = name + appID;
        window.style.display = "block";
        window.onclick = function () {
            focusWindow(window);
        };

        //create header
        header.classList.add('header');
        header.style.width = '25vw';
        header.innerHTML = "<button class='headertext'>" + name + "</button>";

        //create close button
        close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        close.classList.add('closebutton');
        close.onclick = function () {
            window.remove();
            resolve(webview.value);
        };

        //create content div
        content.classList.add('content');

        //create webview
        webview.style.height = '25vh';
        webview.style.width = '25vw';
        webview.innerHTML = code;

        //append the elements
        section.appendChild(window);
        window.appendChild(header);
        header.appendChild(close);
        window.appendChild(content);
        content.appendChild(webview);

        //make the window draggable
        $(".window").draggable({
            handle: ".header",
            containment: document.documentElement
        });
    });
}

function focusWindow(windowElem) {
    const windows = document.querySelectorAll('.window');
    windows.forEach((elem) => elem.classList.remove('focused'));
    windowElem.classList.add('focused');
}

async function CreateEditorCodeWindow() {
    eval(await spawnCodeEditor('', 'Run Editor Script'));
}

//spawn baseplate
addElem.cube(0, -1, 0, 32, 1, 32, '#008000')