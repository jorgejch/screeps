const _ = require('lodash')
module.exports = {
    CreepIsFull: class {
        check(creep){
            return _.sum(creep.carry) === creep.carryCapacity
        }
    },
    CreepResourceIsEmpty: class {
        constructor(resourceType){
            this.resourceType = resourceType
        }
        check(creep){
            return creep.carry[this.resourceType] === 0
        }
    }
}