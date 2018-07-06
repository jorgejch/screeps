class DoneCriteria {
    test(creep) {
        throw "Must be implemented on child."
    }
}

export class CreepIsFull extends DoneCriteria {
    constructor() {
        super();
    }

    test(creep) {
        return _.sum(creep.carry) === creep.carryCapacity
    }
}

export class CreepResourceIsEmpty extends DoneCriteria {
    constructor(resourceType) {
        super();
        this.resourceType = resourceType
    }

    test(creep) {
        return creep.carry[this.resourceType] === 0
    }
}

export class CreepIsOnTarget extends DoneCriteria {
    constructor(target) {
        super()
        this.target = target
    }

    test(creep) {
        return creep.pos.isEqualTo(this.target.pos)
    }
}

export class CreepHasUnclaimedTargetContainerAssigned extends DoneCriteria {
    test(creep) {
        if (!creep.memory.assignedTargetContainerId) {
            return false
        }

        Object.values(Game.creeps).forEach(otherCreep => {
            if (otherCreep.memory.assignedTargetContainerId
                && otherCreep.memory.assignedTargetContainerId === creep.memory.assignedTargetContainerId) {
                return false
            }
        })
        return true
    }
}

export class CreepHasUnclaimedSourceContainerAssigned extends DoneCriteria {
    test(creep) {
        if (!creep.memory.assignedSourceContainerId) {
            return false
        }

        Object.values(Game.creeps).forEach(otherCreep => {
            if (otherCreep.memory.assignedSourceContainerId
                && otherCreep.memory.assignedSourceContainerId === creep.memory.assignedSourceContainerId) {
                return false
            }
        })
        return true
    }
}

export class CreepHasStoredTargetId extends DoneCriteria {
    test(creep){
        return creep.memory.storedTargetId
    }
}

export class CreepHasNoStoredTargetId extends DoneCriteria{
    test(creep){
        return !creep.memory.storedTargetId;
    }
}

export class TargetIsNotEmpty extends DoneCriteria{
    constructor(target, resourceType = null){
        super();
        this.target = target
        this.resourceType = resourceType
    }
    test(creep){
        if (this.target.store) {
            return this.target.store[this.resourceType] > 0
        }
        else {
            return this.target.energy > 0
        }
    }
}

export class FooFalseCriteria {
    test(creep){
        return false
    }
}

export class FooTrueCriteria {
    test(creep){
        return true
    }
}
