export function clearDeadScreepsFromMemory () {
    let i;
    for (i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}

export function printStats () {
    console.log("**Game Stats**");
    console.log(`Cpu bucket count: ${Game.cpu.bucket}`);
    // print creeps stats
    // print available rooms info
    Object.keys(Game.rooms).forEach(function (roomName) {
        const room = Game.rooms[roomName];
        console.log(`Room ${roomName}:
            - Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}  stored/capacity
            - Citizens: ${_.values(Game.creeps).filter((c) => c.memory.ownerRoomName === roomName).length}
            - Personnel: ${JSON.stringify(room.memory.creepsInventory)}`
        )
    });
}

