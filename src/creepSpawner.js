import creepTypes from "creepTypes"

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
export function addCreepOrder(order, orderBook) {
    orderBook[order.role] = order
}

export function executeOrder(order, spawn, orderBook) {
    console.log(`Executing order for ${order.role} in room ${spawn.room.name}'s ${spawn.name} spawn.`)
    const owner = spawn.room
    order.creepParams["ownerRoomName"] = owner.name
    order.creepParams["type"] = order.type
    order.creepParams["role"] = order.role
    const creepName = `${order.role}_${Game.time}`
    const creepBody = creepTypes.getTypesBody(order.type)
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
            orderBook[order.role].quantity -= 1
            if (orderBook[order.role].quantity === 0) {
                console.log(`Deleting order for ${order.role}`)
                delete orderBook[order.role]
            }
            break;
        default:
            console.log(`Spawn ${spawn.name} unable to spawn creep with role ${order.role} ` +
                `for room ${owner.name} due to err # ${res}`)
    }
}
