# API Functions
In order to simplify and improve developer experience, functions have been added to allow manipulation of the game world by developers.

## Basics
API functions are divided into three, each differ in their usage.

`node`: used to manipulate objects (e.g. mass)

`game`: used to manipulate the game world (e.g. play sounds)

`mesh`: used to get properties of objects

Functions of each type needs to have its prefix in accordance to the type. For example: `node.setColor`

API functions tend to require uuids of the target objects to run, which can be found on the properties window on the right side of the screen.

## Node Functions
Functions used to manipulate individual objects.

### setColor
Used to manipulate object color.

Invocation syntax:

`node.setColor(uuid: String, color: String)`

example:

`node.setColor("ZYG06", "#F54927")`

### setPosition
Used to manipulate object position.

Invocation syntax:

`node.setPosition(uuid: String, xpos: Number, ypos: Number, zpos: Number)`

example:

`node.setPosition("ZYG06", 0, 2, 0)`

### setSize
Used to manipulate object size.

Invocation syntax:

`node.setSize(uuid: String, xsize: Number, ysize: Number, zsize: Number)`

example:

`node.setSize("ZYG06", 2, 2, 2)`

### setRotation
Used to manipulate object rotation.

Invocation syntax:

`node.setRotation(uuid: String, x: Number, y: Number, z: Number)`

example:

`node.setRotation("ZYG06", 0, 3.14, 0)`

### setMass
Used to manipulate object mass.

Invocation syntax:

`node.setMass(uuid: String, mass: Number`

example:

`node.setMass("ZYG06", 1)`

## Game Functions
Functions used to manipulate the game environment in general.

### setMenu
Used to add a menu element to the game menu.

Invocation syntax:

`game.setMenu(id: String, text: String)`

id in this case is a made up identification element that the user can decide.

example:

`game.setMenu("points", "Your Points: ")`

### sendLocalMessage
Used to send a local message (only applies to client).

Invocation syntax:

`game.sendLocalMessage(text: String)`

example:

`game.sendLocalMessage("3.14 is a funny number")`

### playAudio
Used to play an audio track.

Invocation syntax:

`game.playAudio(url: String)`

example:

`game.playAudio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=")`

### spawnMesh
Spawn an object and returns its ID.

Invocation syntax:

`game.spawnMesh(type: String, sizeX: Number, sizeY: Number, sizeZ: Number, x: Number, y: Number, z: Number, mass: Number)`

example:

`game.spawnMesh("cube", 1, 1, 1, 0, 2, 0, 0)`

### deleteMesh
Delete an object.

Invocation syntax:

`game.deleteMesh(uuid: String)`

example:

`game.deleteMesh("ZYG06")`