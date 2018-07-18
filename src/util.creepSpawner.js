import creepTypes from "src/creep.types"

export class CreepOrder {
    constructor(type, role, num, creepParams, priority) {
        this.type = type
        this.role = role
        this.quantity = num
        this.creepParams = creepParams
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
    console.log(`Executing order for ${order.role} in room ${spawn.room.name}'s ${spawn.name} spawn.`)
    const ownerRoomName = spawn.room.name
    order.creepParams["ownerRoomName"] = ownerRoomName
    order.creepParams["type"] = order.type
    order.creepParams["role"] = order.role
    const creepName = `${order.role}_${Game.time}`
    const creepBody = creepTypes.getTypeBody(order.type)
    const creepOpts = {memory: order.creepParams}
    const res = spawn.spawnCreep(creepBody, creepName, creepOpts)

    switch (res) {
        case OK:
            console.log(
                `New creep's params.`
                + `\n  Name: ${creepName}`
                + `\n  Body: ${creepBody}`
                + `\n  Role: ${order.role}`
                + `\n  Type: ${order.type}`
                + `\n  Opts: ${JSON.stringify(creepOpts)}`
            )
            order.quantity -= 1
            if (order.quantity === 0) {
                console.log(`Deleting order for ${order.role}`)
                orderBook.splice(orderBook.indexOf(order), 1)
            }
            break;
        default:
            console.log(`Spawn ${spawn.name} unable to spawn creep with role ${order.role} ` +
                `for room ${ownerRoomName} due to err # ${res}`)
    }
}
