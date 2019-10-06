'use strict'

module.exports = {
    creepIsEmpty: function (creep) {
        return _.sum(creep.carry) === 0;
    },

    creepIsFull: function (creep) {
        return _.sum(creep.carry) === creep.carryCapacity
    },
    creepInRoom: function (creep, roomName) {
        return creep.pos.roomName === roomName
    },
    creepResourceIsNotEmpty: function (creep, resourceType) {
        return creep.carry[resourceType] > 0
    },
    creepResourceIsEmpty: function (creep, resourceType) {
        return creep.carry[resourceType] === 0
    },
    creepIsOnTarget: function (creep, target) {
        return creep.pos.isEqualTo(target.pos)
    },
    creepIsAtTarget: function (creep, target, range){
        return creep.pos.getRangeTo(target) === range
    },
    creepHasUnclaimedTargetContainerAssigned: function (creep) {
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
    },
    creepHasUnclaimedSourceContainerAssigned: function (creep) {
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
    },
    creepHasStoredTargetId: function (creep) {
        return creep.memory.storedTargetId
    },
    creepHasNoStoredTargetId: function (creep) {
        return !creep.memory.storedTargetId;
    },
    targetIsNotEmpty: function (creep, target, resourceType) {
        if (target.store) {
            return target.store[resourceType] > 0
        }
        else {
            return target.energy > 0
        }
    },
    targetIsFull: function (creep, target, resourceType) {
        if (target.store) {
            return target.store[resourceType] === target.storeCapacity
        }
        else {
            return target.energy === target.energyCapacity
        }
    },
    creepIsInRangeOfTarget: function(creep, target, range) {
        return creep.pos.getRangeTo(target) <= range
    }
}