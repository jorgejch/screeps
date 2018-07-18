export function creepIsEmpty(creep) {
    return _.sum(creep.carry) === 0;
}

export function creepIsFull(creep) {
    return _.sum(creep.carry) === creep.carryCapacity
}
export function creepInRoom(creep, roomName){
    return creep.pos.roomName === roomName
}
export function creepResourceIsNotEmpty(creep, resourceType) {
    return creep.carry[resourceType] > 0
}
export function creepResourceIsEmpty(creep, resourceType) {
    return creep.carry[resourceType] === 0
}
export function creepIsOnTarget(creep, target) {
    return creep.pos.isEqualTo(target.pos)
}
export function creepHasUnclaimedTargetContainerAssigned(creep) {
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
export function creepHasUnclaimedSourceContainerAssigned(creep) {
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
export function creepHasStoredTargetId(creep) {
    return creep.memory.storedTargetId
}
export function creepHasNoStoredTargetId(creep) {
    return !creep.memory.storedTargetId;
}
export function targetIsNotEmpty(creep, target, resourceType) {
    if (target.store) {
        return target.store[resourceType] > 0
    }
    else {
        return target.energy > 0
    }
}
