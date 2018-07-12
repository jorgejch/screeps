class Activity {
    perform(creep) {
        throw "Must be implemented on child."
    }
}

function moveCreepTo(creep, destination) {
    creep.moveTo(destination, {visualizePathStyle: {}})
}

export class HarvestEnergyFromSource extends Activity {
    constructor(source, inPlace = false) {
        super();
        this.source = source
        this.inPlace = inPlace
    }

    perform(creep) {
        const res = creep.harvest(this.source)

        if (creep.role === "STATIONARY_HARVESTER"){
        }
        switch (res) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                if (!this.inPlace){
                    moveCreepTo(creep, this.source)
                }
                else{
                    console.log(`Source ${this.source.id}`)
                }
                break;
            default:
                console.log(`Creep ${creep.name} unable to harvest source id ${this.source.id} due to err # ${res}`)
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
                console.log(`Creep ${creep.name} unable to withdraw ${this.resourceType} ` +
                    `from ${this.target.structureType} id ${this.target.id} due to err # ${res}`)
        }
    }
}

export class TransferResourceTypeToTarget extends Activity {
    constructor(target, resourceType, amount = null) {
        super();
        this.target = target
        this.resourceType = resourceType
        this.amount = amount
    }

    perform(creep) {
        let res
        if (this.amount){
            res = creep.transfer(this.target, this.resourceType, this.amount)
        }
        else {
            res = creep.transfer(this.target, this.resourceType)
        }

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

export class FollowPath extends Activity {
    constructor(path) {
        super()
        this.path = path
    }

    perform(creep) {
        console.log(`${JSON.stringify(this.path)}`)
        const res = creep.moveByPath(this.path)

        switch (res) {
            case OK:
                break
            default:
                console.log(`Creep ${creep.name} is unable to move by path due to err # ${res}`)
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

export class BuildConstructionSite extends Activity {
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

export class SetAssignedTargetContainer extends Activity{
    constructor(containerId){
        super()
        this.containerId = containerId
    }

    perform(creep){
       creep.memory.assignedTargetContainerId = this.containerId
    }
}

export class SetAssignedSourceContainer extends Activity{
    constructor(containerId){
        super()
        this.containerId = containerId
    }

    perform(creep){
        creep.memory.assignedSourceContainerId = this.containerId
    }
}

export class StoreTargetId extends Activity{
    constructor(targetId){
        super();
        this.targetId = targetId
    }
    perform(creep){
        creep.memory.storedTargetId = this.targetId
    }
}

export class RemoveAnyStoredTarget extends Activity{
    constructor(){
        super();
    }
    perform(creep){
        delete creep.memory.storedTargetId
    }
}

export class ReserveRoomController extends Activity{
    constructor(controller){
        super()
        this.controller = controller
    }

    perform(creep){
        const res = creep.reserveController(this.controller)

        switch (res) {
            case OK:
                break
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, this.controller)
                break
            default:
                console.log(`Unable to  due to err # ${res}`)
        }
    }
}

export class FooActivity extends Activity{
    perform(creep){}
}
