import * as creepConfig from 'creepsConfig'
import * as creepSpawner from "creepSpawner"
import roomsConfig from 'roomsConfig'
import tasks from "tasks"
import rules from 'rules'
import * as generalUtils from "generalUtils"

function processTasks(creep) {
    if (!creep.memory.currentTaskTicket) {
        if (creep.memory.taskTicketQueue.length > 0) {
            console.log(`Picking up next task ticket for creep ${creep.name}`)
            creep.memory.currentTaskTicket = creep.memory.taskTicketQueue.shift()
        }
        else {
            return
        }
    }
    const taskTicket = creep.memory.currentTaskTicket
    const taskFunc = tasks[taskTicket.taskName].taskFunc
    taskFunc(creep, taskTicket)
}

export function loop() {
    generalUtils.clearDeadScreepsFromMemory()
    roomsConfig.bootstrapRoomsConfig()
    roomsConfig.roomsReset()
    roomsConfig.creepsRequirementConfig()

    console.log("Processing creeps...")
    Object.values(Game.creeps).forEach(
        function (creep) {
            // update owner room's inventory
            creepConfig.updateOwnerRoomInventory(creep, )

            // process tasks
            processTasks(creep)
        }
    )

    console.log("Processing rooms' rules...")
    Object.values(Game.rooms).forEach(
        function (room) {
            // verify rules compliance and rectify when verification fails
            room.memory.ruleTickets
                .forEach(function (ruleTicket) {
                    const ruleFunc = rules[ruleTicket.ruleName].ruleFunc
                    ruleFunc(room, ruleTicket)
                })
        }
    );

    console.log("Processing spawns...")
    Object.values(Game.spawns).forEach(function (spawn) {
        if (spawn.spawning === null) {
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
    generalUtils.printStats()
}