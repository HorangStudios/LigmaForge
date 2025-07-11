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
        var editorDiv = document.createElement("div");
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
            var aceEditor = ace.edit(editorDiv.id);
            window.remove();
            resolve(aceEditor.getValue());
        };

        //create content div
        content.classList.add('content');

        //create editor div for Ace
        editorDiv.style.height = '25vh';
        editorDiv.style.width = '25vw';
        editorDiv.id = "ace-editor-" + windowID;

        //append the elements
        section.appendChild(window);
        window.appendChild(header);
        header.appendChild(close);
        window.appendChild(content);
        content.appendChild(editorDiv);

        //initialize editor
        var aceEditor = ace.edit(editorDiv.id);
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode("ace/mode/javascript");

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