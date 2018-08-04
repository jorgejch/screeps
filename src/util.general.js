module.exports = {
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
    getRoomRallyFlag: function (roomName) {
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

    findHostiles: (room) => {
        return room.find(FIND_HOSTILE_CREEPS).filter(creep => {
            return creep.body.indexOf("attack") >= 0 || creep.body.indexOf("ranged_attack") >= 0;
        })
    },
    capitalize: (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}
