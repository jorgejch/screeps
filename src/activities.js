class Activity {
    perform(creep) {
        throw "Must be implemented on child."
    }
}

function moveCreepTo(creep, destination) {
    creep.moveTo(destination, {visualizePathStyle: {}})
}

export class HarvestEnergyFromSource extends Activity {
    constructor(source) {
        super();
        this.source = source
    }

    perform(creep) {
        const res = creep.harvest(this.source)

        switch (res) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.source)
                break;
            default:
                console.log(`Unable to harvest source id ${this.source.id} due to err # ${res}`)
        }
    }
}

export class WithdrawResourceFromTarget extends Activity {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = null) {
        super();
        this.target = target
        this.resourceType = resourceType
        this.amount =  amount
    }

    perform(creep) {
        let res
        if (this.amount === null){
            res = creep.withdraw(this.target, this.resourceType)
        }
        else{
            res = creep.withdraw(this.target, this.resourceType, this.amount)
        }

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.target)
                break
            default:
                console.log(`Unable to withdraw ${this.resourceType} ` +
                    `from ${this.target.structureType} id ${this.target.id} due to err # ${res}`)
        }
    }
}

export class TransferAllResourceTypeToTarget extends Activity {
    constructor(target, resourceType) {
        super();
        this.target = target
        this.resourceType = resourceType
    }

    perform(creep) {
        const res = creep.transfer(this.target, this.resourceType)

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.target)
                break
            default:
                console.log(`Unable to transfer ${this.resourceType} ` +
                    `to ${this.target.structureType} id ${this.target.id} due to err # ${res}`)
        }
    }
}

export class GoToTarget extends Activity {
    constructor(target) {
        super()
        this.target = target
    }

    perform(creep) {
        const res = creep.moveTo(this.target)

        switch (res) {
            case OK:
                break
            default:
                console.log(`Creep ${creep.name} is unable to go to target id ${JSON.stringify(this.target)} `
                    + `at position ${JSON.stringify(this.target.pos)}`
                    + ` on room ${this.target.pos.roomName} due to err # ${res}`)
        }
    }
}

export class DropResourceAmount extends Activity {
    constructor(resourceType, amount = null) {
        super()
        this.resourceType = resourceType
        this.amount = amount
    }

    perform(creep) {

        let res
        if (this.amount !== null) {
            res = creep.drop(this.resourceType, this.amount)
        }
        else {
            res = creep.drop(this.resourceType)
        }

        switch (res) {

            case OK:
                break
            default:
                console.log(`Unable to drop ${this.resourceType} due to err # ${res}`)

        }
    }
}

export class UpgradeRoomController extends Activity {
    constructor(controller) {
        super();
        this.controller = controller
    }

    perform(creep) {
        const res = creep.upgradeController(this.controller)

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.controller)
                break
            default:
                console.log(`Unable to upgrade rooms ${this.controller.room.name} due to err # ${res}`)
        }
    }
}

export class BuildRoomConstructionSite extends Activity {
    constructor(targetCSite) {
        super();
        this.targetCSite = targetCSite
    }

    perform(creep) {
        const res = creep.build(this.targetCSite)

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.targetCSite)
                break
            default:
                console.log(`Unable to build construction site in room ${this.targetCSite.room.name} ` +
                    `due to err # ${res}`)
        }
    }
}

export class RepairTargetStructure extends Activity {
    constructor(target) {
        super();
        this.repairTarget = target
    }

    perform(creep) {
        const res = creep.repair(this.repairTarget)

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.repairTarget)
                break
            default:
                console.log(`Unable to repair structure id ${this.repairTarget.id}` +
                    `on room ${this.repairTarget.room.name} due to err # ${res}`)
        }
    }
}
