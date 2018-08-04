function moveCreepTo(creep, destination) {
    creep.moveTo(destination, {visualizePathStyle: {}})
}


module.exports = {
    harvestEnergyFromSource: function (creep, source, inPlace = false) {
        const res = creep.harvest(source)

        switch (res) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, source)
                break;
            default:
                console.log(`Creep ${creep.name} unable to harvest source id ${source.id} due to err # ${res}`)
        }
    },
    withdrawResourceFromTarget: function (creep, target, resourceType = RESOURCE_ENERGY, amount = null) {
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
    },
    transferResourceTypeToTarget: function (creep, target, resourceType, amount = null) {
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
    },
    goToTarget: function (creep, target) {
        const res = creep.moveTo(target)

        switch (res) {
            case OK:
                break
            default:
                console.log(`Creep ${creep.name} is unable to go to target id ${JSON.stringify(target)} `
                    + `due to err # ${res}`)
        }
    },
    followPath: function (creep, path) {
        const res = creep.moveByPath(path)

        switch (res) {
            case OK:
                break
            default:
                console.log(`Creep ${creep.name} is unable to move by path due to err # ${res}`)
        }
    },
    dropResourceAmount: function (creep, resourceType, amount = null) {
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
    },
    upgradeRoomController: function (creep, controller) {
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
    },
    buildConstructionSite: function (creep, targetCSite) {
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
    },
    repairTargetStructure: function (creep, target) {
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
    },
    setAssignedTargetContainer: function (creep, containerId) {
        creep.memory.assignedTargetContainerId = containerId
    },
    setAssignedSourceContainer: function (creep, containerId) {
        creep.memory.assignedSourceContainerId = containerId
    },
    storeTargetId: function (creep, targetId) {
        creep.memory.storedTargetId = targetId
    },
    removeAnyStoredTarget: function (creep) {
        delete creep.memory.storedTargetId
    },
    reserveRoomController: function (creep, controller) {
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
    },
    pickupDroppedResource: function (creep, resource) {
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
    },
    attackTarget: function (creep, target) {
        const res = creep.attack(target)

        switch (res) {
            case OK:
                return true
            case ERR_NOT_IN_RANGE:
                moveCreepTo(creep, target)
                break
            default:
                console.log(`Creep ${creep.name} is unable to attack target due to err # ${res}`)
        }
    },
    placeRoadIfNeeded: function(creep)  {
        const roads = creep.pos.lookFor(LOOK_STRUCTURES).filter(struct => struct.structureType === STRUCTURE_ROAD)

        if (roads.length === 0) {
            const roadCSs = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).filter(cs => cs.structureType === STRUCTURE_ROAD)

            if (roadCSs.length === 0 && Object.keys(Game.constructionSites).length < 98) {
                const room = creep.room
                room.createConstructionSite(creep.pos, STRUCTURE_ROAD)
            }
        }
    }
}