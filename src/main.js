import {cam} from 'StructuresManagement'
import * as creepSpawner from "creepSpawner"
import tasks from "tasks"
import * as generalUtils from "generalUtils"
import E47S16 from './E47S16'

function processTasks(creep) {
    if (!creep.memory.currentTaskTicket) {
        if (creep.memory.taskTicketQueue.length > 0) {
            console.log(`Picking up next task ticket for creep ${creep.name}`)
            creep.memory.currentTaskTicket = creep.memory.taskTicketQueue.shift()
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

    console.log("Initializing Managers...")
    cam.init()

    console.log("Configuring rooms...")
    const roomsConfigs = {"E47S16": new E47S16()}
    Object.values(roomsConfigs).forEach(roomConfigClass => {
        roomConfigClass.configure()
    })

    console.log("Processing creeps...")
    Object.values(Game.creeps).forEach(
        function (creep) {
            // update owner room's inventory
            generalUtils.updateRoomCreepInventory(creep.memory.type, roomsConfigs[creep.memory.ownerRoomName].creepsInventory)

            try{
                processTasks(creep)
            }
            catch (e) {
                console.log(`Creep ${creep.name} failed task processing.`)
            }
        }
    )

    console.log("Processing rooms' rules...")
    Object.values(roomsConfigs).forEach(roomConfig => {
        roomConfig.rules.forEach(rule => {
            try{
                rule.process(roomConfig)
            }
            catch (e) {
                console.log(`Failed to process rule ${JSON.stringify(rule)}`)
            }
        })
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
                const highestPriorityOrder = orders[0]
                creepSpawner.executeOrder(highestPriorityOrder, spawn, orderBook)
            }
        }
    })
    generalUtils.printStats(roomsConfigs)
}