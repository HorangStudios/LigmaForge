# API Functions
In order to simplify and improve developer experience, functions have been added to allow manipulation of the game world by developers.

## Basics
API functions are divided into three, each differ in their usage.

`node`: used to manipulate objects (e.g. mass)\
`game`: used to manipulate the game world (e.g. play sounds)\
`mesh`: Returns properties of the parent mesh

API functions tend to require uuids of the target objects to run, which can be found on the properties window on the right side of the screen.

## The `node` Object

### `node.setColor(uuid: String, color: String)`
&ensp;&ensp; Used to manipulate object color.\
&ensp;&ensp; Example: `node.setColor("ZYG06", "#F54927")`

### `node.setPosition(uuid: String, xpos: Number, ypos: Number, zpos: Number)`
&ensp;&ensp; Used to manipulate object position.\
&ensp;&ensp; Example: `node.setPosition("ZYG06", 0, 2, 0)`

### `node.setSize(uuid: String, xsize: Number, ysize: Number, zsize: Number)`
&ensp;&ensp; Used to manipulate object size.\
&ensp;&ensp; Example: `node.setSize("ZYG06", 2, 2, 2)`

### `node.setRotation(uuid: String, x: Number, y: Number, z: Number)`
&ensp;&ensp; Used to manipulate object rotation.\
&ensp;&ensp; Example: `node.setRotation("ZYG06", 0, 3.14, 0)`

### `node.setMass(uuid: String, mass: Number)`
&ensp;&ensp; Used to manipulate object mass.\
&ensp;&ensp; Example: `node.setMass("ZYG06", 1)`

## The `game` Object

### `game.setMenu(id: String, text: String)`
&ensp;&ensp; Used to add a text element to the game menu. \
&ensp;&ensp; id -  unique identification key for accessing the element.\
&ensp;&ensp; Example: ``game.setMenu("points", `Your Points: ${x}`)``

### `game.sendLocalMessage(text: String)`
&ensp;&ensp; Used to send a local message (only applies to client).\
&ensp;&ensp; Example: `game.sendLocalMessage("3.14 is a funny number")`

### `game.playAudio(url: String)`
&ensp;&ensp; Used to play an audio track.\
&ensp;&ensp; Example: `game.playAudio("https://example.com/audio.mp3")`

### `game.spawnMesh(type: String, sizeX: Number, sizeY: Number, sizeZ: Number, x: Number, y: Number, z: Number, mass: Number)`
&ensp;&ensp; Spawns an object and returns its ID.\
&ensp;&ensp; type - Type of mesh (refer to elemTypes in addShapes.js for mesh types)\
&ensp;&ensp; Example: `game.spawnMesh("cube", 1, 1, 1, 0, 2, 0, 0)`

### `game.deleteMesh(uuid: String)`
&ensp;&ensp; Deletes an object.\
&ensp;&ensp; Example: `game.deleteMesh("ZYG06")`

### `game.createListener(uuid: String, type: String, callback: Function)`
&ensp;&ensp; Listens to a mesh for an event. Only runs callback once.\
&ensp;&ensp; type - Only `click` for now\
&ensp;&ensp; Example: `game.createListener("ZYG06", "click", () => { console.log("boom"); })`

## The `mesh` Object

### `mesh.getUUID()`
&ensp;&ensp; Returns the parent mesh UUID

### `mesh.getPosition()`
&ensp;&ensp; Returns the parent mesh position

### `mesh.getMass()`
&ensp;&ensp; Returns the parent mesh mass

### `mesh.getColor()`
&ensp;&ensp; Returns the parent mesh color

### `mesh.getSize()`
&ensp;&ensp; Returns the parent mesh size

### `mesh.getRotation()`
&ensp;&ensp; Returns the parent mesh rotation