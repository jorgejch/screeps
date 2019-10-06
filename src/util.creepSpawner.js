'use strict'

const creepTypes = require("creep.types")

module.exports = {
    CreepOrder: class {
        constructor(type, name, taskTicketQueue, priority) {
            this.type = type
            this.name = name
            this.taskTicketQueue = taskTicketQueue
            this.priority = priority
        }
    },

    /**
     * add an order to the order book
     * @param {CreepOrder} order
     * @param {Object} orderBook
     */
    addOrderForCreepInOrderBook: function (order, orderBook) {
        orderBook.push(order)
    },

    executeOrder: function (order, spawn, orderBook) {
        const creepName = order.name
        console.log(`Executing order for ${order.name} in room ${spawn.room.name}'s ${spawn.name} spawn.`)
        const creepBody = creepTypes[order.type]
        const creepOpt = {
            memory: {
                taskTicketQueue: order.taskTicketQueue,
                type: order.type
            }
        }
        const res = spawn.spawnCreep(creepBody, creepName, creepOpt)

        switch (res) {
            case OK:
                console.log(
                    `New creep's params.`
                    + `\n  Name: ${creepName}`
                    + `\n  Body: ${creepBody}`
                    + `\n  Type: ${order.type}`
                    + `\n  Opts: ${JSON.stringify(creepOpt)}`
                )
                const index = orderBook.indexOf(order)
                console.log(`Deleting order for ${order.name} with index ${index}`)
                orderBook.splice(index, 1)
                break;
            default:
                console.log(`Spawn ${spawn.name} unable to spawn creep ${order.name} `
                    + `for room ${spawn.room.name} due to err # ${res}`)
        }
    }
}