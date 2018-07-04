export function clearDeadScreepsFromMemory () {
    let i;
    for (i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}

export function printStats (roomsConfig) {
    console.log("**Game Stats**");
    console.log(`Cpu bucket count: ${Game.cpu.bucket}`);
    // print creeps stats
    // print available rooms info
    Object.keys(Game.rooms).forEach(function (roomName) {
        const room = Game.rooms[roomName];
        console.log(`Room ${roomName}:
            - Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}  stored/capacity
            - Citizens: ${_.values(Game.creeps).filter((c) => c.memory.ownerRoomName === roomName).length}
            - Personnel: ${JSON.stringify(roomsConfig[roomName].creepsInventory)}`
        )
    });
}

export function getGameObjectById(id) {
    return Game.getObjectById(id)
}


export function getRoom(roomName) {
    return Game.rooms[roomName]
}

export function getRandomArrayElement(array) {
    const size = array.length
    return array[Math.floor(Math.random() *  size)]
}

export function updateRoomCreepInventory(type, inventory) {
    if (type in inventory) {
        inventory[type] += 1
    }
    else {
        inventory[type] = 1
    }
}
