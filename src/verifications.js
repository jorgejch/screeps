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
    verify(roomConfig) {
        if (this.type in roomConfig.creepsInventory) {
            return roomConfig.creepsInventory[this.type] === this.reqNumber
        }
        else {
            return false
        }
    }
}
