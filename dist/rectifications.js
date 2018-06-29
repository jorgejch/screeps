const creepSpawner = require("creepSpawner")

class Rectification {
    rectify() {
        throw "Needs to be implemented by child."
    }
}

module.exports = {
    /**
     * Add a creeps order to the room's creep factory for the amount necessary to satisfy the rooms requirements.
     * @param room A room game obj.
     */
    AddOrderForNecessaryAmountOfCreeps: class extends Rectification {
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
}