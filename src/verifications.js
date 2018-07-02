class Verification {
    verify(room) {
        throw "To be implemented by child."
    }
}

export class CreepTypeInInventory extends Verification {
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
