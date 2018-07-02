class DoneCriteria {
    test(creep){
        throw "Must be implemented on child."
    }
}

export class CreepIsFull extends DoneCriteria{
    constructor(){
        super();
    }
    test(creep) {
        return _.sum(creep.carry) === creep.carryCapacity
    }
}

export class CreepResourceIsEmpty extends DoneCriteria{
    constructor(resourceType) {
        super();
        this.resourceType = resourceType
    }

    test(creep) {
        return creep.carry[this.resourceType] === 0
    }
}
