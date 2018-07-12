class Verification {
    verify(room) {
        throw "To be implemented by child."
    }
}

export class CreepRoleInInventory extends Verification {
    constructor(role, requiredNumber) {
        super()
        this.role = role
        this.reqNumber = requiredNumber
    }

    /**
     * @return {boolean}
     */
    verify(roomConfig) {
        if (this.role in roomConfig.creepsInventory) {
            return roomConfig.creepsInventory[this.role] === this.reqNumber
        }
        else {
            return false
        }
    }
}
