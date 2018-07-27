module.exports = {
    clearDeadScreepsFromMemory: function () {
        let i;
        for (i in Memory.creeps) {
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    },
    capitalize: function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
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
    getRoomFlag: function (roomName) {
        return Game.flags[`${roomName}_RALLY`]
    },
    getClosestUnassignedContainerInRoom: function (creep, roomName, key) {
        const room = this.getRoom(roomName)
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
        return this.getClosestUnassignedContainerInRoom(creep, roomName, key)
    },

}
