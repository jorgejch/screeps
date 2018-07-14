import * as creepSpawner from "creepSpawner"
import tasks, {TaskTicket} from "tasks"
import * as generalUtils from "generalUtils"
import E47S16 from './E47S16'

function processTasks(creep) {
    if (!creep.memory.currentTaskTicket) {
        if (creep.memory.taskTicketQueue.length > 0) {
            creep.memory.currentTaskTicket = creep.memory.taskTicketQueue.shift()
            console.log(`Picking up next task ticket for creep ${creep.name}:\n`
                + `${JSON.stringify(creep.memory.currentTaskTicket)}`)
        }
        else {
            console.log(`No tasks for ${creep.name}. Creep  Idle.`)
            return
        }
    }
    const taskFunc = tasks[creep.memory.currentTaskTicket.taskName].taskFunc
    taskFunc(creep)
}

export function loop() {
    generalUtils.clearDeadScreepsFromMemory()

    console.log("Configuring rooms...")
    console.log(`${JSON.stringify(Game.rooms)}`)
    const roomsConfigs = {"E47S16": new E47S16()}
    Object.values(roomsConfigs).forEach(roomConfig => {
        try {
            roomConfig.configure()
        }
        catch (e) {
            console.log(`Failed to configure room ${roomConfig.room.name} due to ${e.stack}.`)
        }
    })

    // console.log("Processing common rooms routine...")
    // Object.values(Game.rooms).forEach(room => {
    //     // process dropped resources
    // })


    console.log("Processing creeps...")
    Object.values(Game.creeps).forEach(
        function (creep) {
            // update owner room's inventory
            try {
                generalUtils.updateRoomCreepInventory(
                    creep.memory.role,
                    roomsConfigs[creep.memory.ownerRoomName].creepsInventory
                )
            } catch (e) {
                console.log(`Unable to update room ${creep.memory.ownerRoomName}'s `
                    + `inventory with creep ${creep.name}'s due to ${e.stack}`)
            }

            try {
                processTasks(creep)
            }
            catch (e) {
                console.log(`Creep ${creep.name} failed task processing due to: ${e.stack}`)
            }
        }
    )

    console.log("Processing rooms configs...")
    Object.values(roomsConfigs).forEach(roomConfig => {
        roomConfig.rules.forEach(rule => {
            try {
                rule.process(roomConfig)
            }
            catch (e) {
                console.log(`Failed to process rule ${JSON.stringify(rule)}`)
            }
        })

        roomConfig.towers.forEach(tower => {
            try {
                tower.execute()
            } catch (e) {
                console.log(`Failed to execute tower ${tower.id} on room ${tower.pos.roomName} due to: ${e.stack}`)
            }
        })

        try {
            roomConfig.printStats()
        }
        catch (e) {
            console.log(`Failed to print room ${roomConfig.room.name}'s stats due to: ${e.stack}`)
        }
    });

    console.log("Processing spawns...")
    Object.values(Game.spawns).forEach(spawn => {
        if (spawn.spawning === null) {
            const orderBook = roomsConfigs[spawn.room.name].orderBook
            // execute the first item of the room's ordered OrderBook
            if (Object.keys(orderBook).length > 0) {
                const orders = Object.values(orderBook).sort((a, b) => {
                    return a.priority - b.priority
                })
                console.log(`Order book for room's ${spawn.room.name}: ${JSON.stringify(orderBook)}`)
                const highestPriorityOrder = orders[0]
                try {
                    creepSpawner.executeOrder(highestPriorityOrder, spawn, orderBook)
                }
                catch (e) {
                    console.log(`Failed to execute order ${JSON.stringify(highestPriorityOrder)} `
                        + `on spawn ${spawn.name} due to ${e.stack}.`)
                }
            }
        }
    })
}