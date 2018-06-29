class Verification {
    verify(){
        throw "To be implemented by child."
    }
}
module.exports = {
    CreepTypeInInventory: class extends Verification {
        constructor(type, requiredNumber) {
            super()
            this.type = type
            this.reqNumber = requiredNumber
        }

        /**
         * @return {boolean}
         */
        verify(room) {
            if (this.type in room.memory.creepsInventory) {
                return room.memory.creepsInventory[this.type] === this.reqNumber
            }
            else {
                return false
            }
        }
    }
}