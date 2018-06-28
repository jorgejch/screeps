const creepTypes = require("dist/creepTypes")
const roomUtils = require("dist/roomUtils")
const factory = require("dist/factory")

function basicSetup() {
    Object.values(Game.rooms).filter(function (room) {
        return "preped" in room.memory
    }).forEach(
        function (room) {

            room.memory.factory = factory
        }
    )

}

module.exports = {
    setupRooms: function () {

        basicSetup()


        roomUtils.configRoomCreepType()


    }
}