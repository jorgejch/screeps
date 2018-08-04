module.exports = {
    clearDeadScreepsFromMemory: function () {
        let i;
        for (i in Memory.creeps) {
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
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
    findHostiles: (room) => {
        return room.find(FIND_HOSTILE_CREEPS).filter(creep => {
            return creep.body.indexOf("attack") >= 0 || creep.body.indexOf("ranged_attack") >= 0;
        })
    },
    capitalize: (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}
