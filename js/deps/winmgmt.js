// HorangHill LigmaForge Editor Engine - Code editor window
// make randomized uuid
function stringGen() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 12; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// code editor window
function spawnCodeEditor(code, name) {
    return new Promise((resolve, reject) => {
        //configure elements
        var section = document.documentElement;
        var window = document.createElement("div");
        var header = document.createElement("div");
        var content = document.createElement("div");
        var editor = document.createElement("textarea");
        var close = document.createElement("button");
        var windowID = stringGen();

        //create window
        window.classList.add('window');
        window.id = name + windowID;
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
            resolve(editor.value);
        };

        //create content div
        content.classList.add('content');

        //create editor
        editor.style.height = '25vh';
        editor.style.width = '25vw';
        editor.style.overflow = "auto";
        editor.innerHTML = code;

        //append the elements
        section.appendChild(window);
        window.appendChild(header);
        header.appendChild(close);
        window.appendChild(content);
        content.appendChild(editor);

        //make the window draggable
        $(".window").draggable({
            handle: ".header",
            containment: document.documentElement
        });
    });
}

// focus on a window (put focused on top from .focused css)
function focusWindow(windowElem) {
    const windows = document.querySelectorAll('.window');
    windows.forEach((elem) => elem.classList.remove('focused'));
    windowElem.classList.add('focused');
}

// immediately run code after editor window closed (for run script window)
async function CreateEditorCodeWindow() {
    eval(await spawnCodeEditor('', 'Run Editor Script'));
}