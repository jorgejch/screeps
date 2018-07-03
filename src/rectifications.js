import * as creepSpawner from "creepSpawner"

class Rectification {
    rectify(room) {
        throw "Needs to be implemented by child."
    }
}

/**
 * Add a creeps order to the room's creep factory for the amount necessary to satisfy the rooms requirements.
 * @param room A room game obj.
 */
export class AddOrderForNecessaryAmountOfCreeps extends Rectification {
    constructor(requiredNumber, type, creepsParams, priority) {
        super()
        this.reqNumber = requiredNumber
        this.type = type
        this.creepsParams = creepsParams
        this.priority = priority
    }

    rectify(room) {

        let existingNum = room.memory.creepsInventory[this.type]

        if (existingNum === undefined) {
            existingNum = 0
        }

        if (existingNum < this.reqNumber) {
            const orderBook = room.memory.orderBook

            // already being made, should not add another CreepOrder
            if (this.type in orderBook) {
                return
            }
            const order = new creepSpawner.CreepOrder(
                this.type,
                this.reqNumber - existingNum,
                this.creepsParams,
                this.priority
            )
            creepSpawner.addCreepOrder(order, orderBook)
        }
    }
}
