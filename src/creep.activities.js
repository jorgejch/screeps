function moveCreepTo(creep, destination) {
    creep.moveTo(destination, {visualizePathStyle: {}})
}
export function harvestEnergyFromSource(creep, source, inPlace = false) {
    const res = creep.harvest(source)

    switch (res) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            if (!inPlace) {
                moveCreepTo(creep, source)
            }
            else {
                console.log(`Source ${source.id}`)
            }
            break;
        default:
            console.log(`Creep ${creep.name} unable to harvest source id ${source.id} due to err # ${res}`)
    }
}
export function withdrawResourceFromTarget(creep,target, resourceType = RESOURCE_ENERGY, amount = null) {
    let res
    if (amount === null) {
        res = creep.withdraw(target, resourceType)
    }
    else {
        res = creep.withdraw(target, resourceType, amount)
    }

    switch (res) {
        case OK:
            break
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, target)
            break
        default:
            console.log(`Creep ${creep.name} unable to withdraw ${resourceType} ` +
                `from ${target.structureType} id ${target.id} due to err # ${res}`)
    }
}
export function transferResourceTypeToTarget(creep, target, resourceType, amount = null) {
    let res
    if (amount) {
        res = creep.transfer(target, resourceType, amount)
    }
    else {
        res = creep.transfer(target, resourceType)
    }

    switch (res) {
        case OK:
            break
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, target)
            break
        default:
            console.log(`Unable to transfer ${resourceType} ` +
                `to ${target.structureType} id ${target.id} due to err # ${res}`)
    }
}
export function goToTarget(creep, target) {
    const res = creep.moveTo(target)

    switch (res) {
        case OK:
            break
        default:
            console.log(`Creep ${creep.name} is unable to go to target id ${JSON.stringify(target)} `
                + `at position ${JSON.stringify(target.pos)}`
                + ` on room ${target.pos.roomName} due to err # ${res}`)
    }
}
export function followPath(creep, path) {
    const res = creep.moveByPath(path)

    switch (res) {
        case OK:
            break
        default:
            console.log(`Creep ${creep.name} is unable to move by path due to err # ${res}`)
    }
}
export function dropResourceAmount(creep, resourceType, amount = null) {
    let res
    if (amount !== null) {
        res = creep.drop(resourceType, amount)
    }
    else {
        res = creep.drop(resourceType)
    }

    switch (res) {

        case OK:
            break
        default:
            console.log(`Unable to drop ${resourceType} due to err # ${res}`)

    }
}
export function upgradeRoomController(creep, controller) {
    const res = creep.upgradeController(controller)

    switch (res) {
        case OK:
            break
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, controller)
            break
        default:
            console.log(`Unable to upgrade rooms ${controller.room.name} due to err # ${res}`)
    }
}
export function buildConstructionSite(creep, targetCSite) {
    const res = creep.build(targetCSite)

    switch (res) {
        case OK:
            break
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, targetCSite)
            break
        default:
            console.log(`Unable to build construction site in room ${targetCSite.room.name} ` +
                `due to err # ${res}`)
    }
}
export function repairTargetStructure(creep, target) {
    const res = creep.repair(target)

    switch (res) {
        case OK:
            break
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, target)
            break
        default:
            console.log(`Unable to repair structure id ${target.id}` +
                `on room ${target.room.name} due to err # ${res}`)
    }
}
export function setAssignedTargetContainer(creep, containerId) {
    creep.memory.assignedTargetContainerId = containerId
}
export function setAssignedSourceContainer(creep, containerId) {
    creep.memory.assignedSourceContainerId = containerId
}
export function storeTargetId(creep, targetId) {
    creep.memory.storedTargetId = targetId
}
export function removeAnyStoredTarget(creep) {
    delete creep.memory.storedTargetId
}
export function reserveRoomController(creep, controller) {
    const res = creep.reserveController(controller)

    switch (res) {
        case OK:
            break
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, controller)
            break
        default:
            console.log(`Unable to reserve room controller on ${controller.room.name} due to err # ${res}`)
    }
}
export function pickupDroppedResource(creep, resource) {
    const res = creep.pickup(resource)

    switch (res) {
        case OK:
            return true
        case ERR_NOT_IN_RANGE:
            moveCreepTo(creep, resource)
            break
        default:
            console.log(`Unable to pickup resource id ${resource.id} due to err # ${res}`)

    }
    return false
}
