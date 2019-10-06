# screeps

# Processes

The game is played through processes. Different process categories have different hierarchies.

## High order processes
### Empire Ruler process
Highest hierarchy process. First process to be launched. It launches the flag event listener and the room governors.

### Flag Event Listener process
Events in the game are produced by placing non-white flags. This process looks for flags placed and calls the
corresponding event.

### Room Governor processes
Created by the Empire Ruler process. These take care of:

* Printing stats.
* Maintains a creep order book and spawns creeps.
* Initializing the needed directors/operators of a functioning owned room.
    * Energy Supply Director
    * Tower Operator
    * Construction Director
    * Repair Director

## Lower order processes

### Directors
Directors supervise creep manager processes. Director classes extend the DirectorProcess class.

### Managers

### Operators

# Events
Events are triggered by placing flags. An event launches a process.