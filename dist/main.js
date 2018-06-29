const roomsConfig = require("roomsConfig")
const creepConfig = require("creepsConfig")
const creepSpawner = require("creepSpawner")
const tasksUtils = require('tasksUtils')


module.exports.loop = function () {
    roomsConfig.bootstrapRoomsConfig()
    roomsConfig.roomsReset()
    roomsConfig.creepsRequirementConfig()


    console.log("Processing creeps...")
    Object.values(Game.creeps).forEach(
        function (creep) {
            // update owner room's inventory
            console.log(`Creep ${creep.name} reporting for service.`)
            creepConfig.updateOwnerRoomInventory(creep)

            // execute task
            tasksUtils.crunchCreepTask(creep)
        }
    )

    console.log("Processing rooms...")
    Object.values(Game.rooms).forEach(
        function (room) {
            console.log(`On room ${room.name}.`)
            // verify rules compliance and rectify when verification fails
            Object.values(room.memory.rules).forEach(function (rule) {
                if (!rule.verify(room)) {
                    rule.rectify(room)
                }
            })

        }
    );

    console.log("Processing spawns...")
    Object.values(Game.spawns).forEach(function (spawn) {
        if (spawn.spawning === null) {
            console.log(`Spawn ${spawn.name} is available on room ${spawn.room.name}.`)
            const orderBook = spawn.room.memory.orderBook
            // execute the first item of the room's ordered OrderBook
            if (Object.keys(orderBook).length > 0) {
                const highestPriorityOrder = Object.values(orderBook).sort(function (a, b) {
                    return a.priority - b.priority
                })[0]
                creepSpawner.executeOrder(highestPriorityOrder, spawn)
            }
        }
    })


}