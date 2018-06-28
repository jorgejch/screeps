const enforcementUtils = require("enforcementUtis")
const factoryUtils = require("factoryUtils")

module.exports = {
    configRoomCreepType: function (room, type, reqNumber, creepParams) {
        const rule =  new enforcementUtils.Rule()
        rule.name = `SHOULD_HAVE_${reqNumber}_${type}`
        rule.verifyFunc = function (room) {
            if (!"creepsInventory" in room.memory){
                throw "Room memory is missing the creeps obj"
            }

            if (type in room.memory.creepsInventory){
                return room.memory.creepsInventory[type] === reqNumber
            }
            else {
                return false
            }
        }
        rule.rectifyFunc = function (room) {
            const existingNum = room.memory.creepsInventory[type]
            if (existingNum < reqNumber){
                if (!"factory" in room.memory){
                    throw "Room memory is missing factory"
                }
                const factory = room.memory.factory

                // already being made, should not add another Order
                if (factory.checkOrderBookFor(type)){
                    return
                }
                const order = new factoryUtils.Order(type, reqNumber - existingNum, creepParams, priority)
                factory.addOrder(order)
            }
        }
    }
}