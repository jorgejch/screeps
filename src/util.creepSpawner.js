import creepTypes from "creep.types"

export class CreepOrder {
    constructor(type, name, taskTicketQueue, priority) {
        this.type = type
        this.name= name
        this.taskTicketQueue = taskTicketQueue
        this.priority = priority
    }
}

/**
 * add an order to the order book
 * @param {CreepOrder} order
 * @param {Object} orderBook
 */
export function addOrderForCreepInOrderBook(order, orderBook) {
    orderBook.push(order)
}

export function executeOrder(order, spawn, orderBook) {
    const creepName =  order.name
    console.log(`Executing order for ${order.name} in room ${spawn.room.name}'s ${spawn.name} spawn.`)
    const creepBody = creepTypes[order.type]
    const creepTaskTicketQueue = this.taskTicketQueue
    const res = spawn.spawnCreep(creepBody, creepName, {memory: {taskTicketQueue : creepTaskTicketQueue}})

    switch (res) {
        case OK:
            console.log(
                `New creep's params.`
                + `\n  Name: ${creepName}`
                + `\n  Body: ${creepBody}`
                + `\n  Type: ${order.type}`
                + `\n  Opts: ${JSON.stringify(creepTaskTicketQueue)}`
            )
            console.log(`Deleting order for ${order.name}`)
            orderBook.splice(orderBook.indexOf(order), 1)
            break;
        default:
            console.log(`Spawn ${spawn.name} unable to spawn creep ${order.name} `
                + `for room ${spawn.room.name} due to err # ${res}`)
    }
}
