class Activity {
    perform(creep) {
        throw "Must be implemented on child."
    }
}

export class HarvestEnergyFromSource extends Activity {
    constructor(source, justRally = false) {
        super();
        this.source = source
        this.justRally = justRally
    }

    perform(creep) {
        let res
        if (!this.justRally) {
            res = creep.harvest(this.source)
        }
        else{
            res = ERR_NOT_IN_RANGE
        }

        switch (res) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(this.source)
                break;
            default:
                console.log(`Unable to harvest source id ${this.source.id} due to err # ${res}`)
        }
    }
}

export class TransferAllResourceTypeToTarget extends Activity {
    constructor(target, resourceType, justRally) {
        super();
        this.target = target
        this.resourceType = resourceType
        this.justRally = justRally
    }

    perform(creep) {
        let res

        if(! this.justRally) {
            res = creep.transfer(this.target, this.resourceType)
        }
        else{
            res = ERR_NOT_IN_RANGE
        }

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                creep.moveTo(this.target)
                break
            default:
                console.log(`Unable to transfer ${this.resourceType} ` +
                    `to ${this.target.structureType} id ${this.target.id} due to err # ${res}`)
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
                creep.moveTo(this.controller)
                break
            default:
                console.log(`Unable to upgrade rooms ${this.controller.room.name} due to err # ${res}`)
        }
    }
}

export class BuildRoomConstructionSite extends Activity {
    constructor(targetCSite, justRally = false) {
        super();
        this.targetCSite = targetCSite
        this.justRally = justRally
    }

    perform(creep) {
        let res

        if (!this.justRally){
            res = creep.build(this.targetCSite)
        }
        else {
            res = ERR_NOT_IN_RANGE
        }

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                creep.moveTo(this.targetCSite)
                break
            default:
                console.log(`Unable to build construction site in room ${this.targetCSite.room.name} ` +
                    `due to err # ${res}`)
        }
    }
}

export class RepairTargetStructure extends Activity {
    constructor(target, justRally = false) {
        super();
        this.repairTarget = target
        this.justRally = justRally
    }

    perform(creep) {
        let res

        if (!this.justRally){
            res = creep.repair(this.repairTarget)
        }
        else {
            res = ERR_NOT_IN_RANGE
        }

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                creep.moveTo(this.repairTarget)
                break
            default:
                console.log(`Unable to repair structure id ${this.repairTarget.id}` +
                    `on room ${this.repairTarget.room.name} due to err # ${res}`)
        }
    }
}
