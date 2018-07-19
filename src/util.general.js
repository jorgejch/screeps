module.exports = {
    suffleArray: function (array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    clearDeadScreepsFromMemory: function () {
        let i;
        for (i in Memory.creeps) {
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    },

    getGameObjectById: function (id) {
        return Game.getObjectById(id)
    },


    getRoom: function (roomName) {
        return Game.rooms[roomName]
    },

    getRandomArrayElement: function (array) {
        const size = array.length
        return array[Math.floor(Math.random() * size)]
    },

    updateRoomCreepInventory: function (type, inventory) {
        if (type in inventory) {
            inventory[type] += 1
        }
        else {
            inventory[type] = 1
        }
    },

    getRoomFlag: function (roomName) {
        return Game.flags[`${roomName}_RALLY`]
    },

    getClosestUnassignedContainerInRoom: function (creep, roomName, key) {
        const room = getRoom(roomName)
        return creep.pos.findClosestByRange(
            room.find(
                FIND_STRUCTURES,
                {
                    filter: s => s.structureType === STRUCTURE_CONTAINER &&
                        Object.values(Game.creeps).filter(
                            otherCreep => key in otherCreep.memory && otherCreep.memory[key] === s.id
                        ).length === 0
                }
            )
        )
    },

    getClosestUnassignedTargetContainerInRoom: function (creep, roomName) {
        const key = "assignedTargetContainerId"
        return getClosestUnassignedContainerInRoom(creep, roomName, key)
    },

    getClosestUnassignedSourceContainerInRoomu: function (creep, roomName) {
        const key = "assignedSourceContainerId"
        return getClosestUnassignedContainerInRoom(creep, roomName, key)
    },

    checkDroppedResourceUnassigned: function (droppedResource) {
        return Object.values(Game.creeps).find(creep => creep.memory)
    }
}
