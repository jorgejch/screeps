import creepTypes from "creepTypes"

export class CreepOrder {
    constructor(type, num, creepParams, priority) {
        this.type = type
        this.quantity = num
        this.creepParams = creepParams
        this.priority = priority
    }
}

/**
 * add an order to the order book
 * @param {CreepOrder} order
 * @param {Map} orderBook
 */
export function addCreepOrder(order, orderBook) {
    orderBook[order.type] = order
}

export function executeOrder(order, spawn) {
    console.log(`Executing order for ${order.type} in room ${spawn.room.name}'s ${spawn.name} spawn.`)
    const owner = spawn.room
    order.creepParams["ownerRoomName"] = owner.name
    order.creepParams["type"] = order.type
    const creepName = `${order.type}_${Game.time}`
    const creepBody = creepTypes.getTypesBody(order.type)
    const creepOpts = {memory: order.creepParams}
    const res = spawn.spawnCreep(creepBody, creepName, creepOpts)

    switch (res) {
        case OK:
            console.log(
                `New creep's params.`
                + `\n  Name: ${creepName}`
                + `\n  Body: ${creepBody}`
                + `\n  Type: ${order.type}`
                + `\n  Opts: ${JSON.stringify(creepOpts)}`
            )
            const orderBook = owner.memory.orderBook
            orderBook[order.type].quantity -= 1
            if (orderBook[order.type].quantity === 0) {
                console.log(`Deleting order for ${order.type}`)
                delete orderBook[order.type]
            }
            break;
        default:
            console.log(`Unable to spawn creep of type ${order.type} for room ${owner.name} due to err # ${res}`)
    }
}
