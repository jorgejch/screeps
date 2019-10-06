'use strict'

const generalUtils = require('util.general')
const conclusions = require('creep.conclusions')
const criterias = require('creep.criterias')
const activities = require('creep.action')

function getCurrentTaskTicket(creep) {
    return creep.memory.currentTaskTicket
}

module.exports = {
    TaskTicket: class {
        constructor(taskName, taskParams = null) {
            this.taskName = taskName
            this.taskParams = taskParams
        }
    },
    tasks: {
        CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM: {
            name: "CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM",
            /**
             *
             * @param creep Creep performing the task
             *  roomName: Name of the room to harvest the closest source to creep.
             */
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const roomName = currentTaskTicket.taskParams.roomName

                if (criterias.creepInRoom(creep, roomName)) {
                    const room = Game.rooms[roomName]
                    const source = creep.pos.findClosestByPath(room.find(FIND_SOURCES_ACTIVE))

                    // no source is job done
                    if (!source) {
                        console.log(`No source for ${creep.name}`)
                        return
                    }
                    activities.harvestEnergyFromSource(creep, source)
                    if (criterias.creepIsFull(creep)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                } else {
                    const flag = Game.flags[`${roomName}_RALLY`]
                    activities.goToTarget(creep, flag)
                }
            }
        },
        CYCLIC_HARVEST_SOURCE: {
            name: "CYCLIC_HARVEST_SOURCE",
            /**
             * @param creep Creep performing the task
             */
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const sourceId = currentTaskTicket.taskParams.sourceId
                const source = Game.getObjectById(sourceId)

                if (!source) {
                    throw `Creep ${creep.name} does not have visibility into target harvest `
                    + `room or invalid source id ${sourceId}.`
                } else {
                    activities.harvestEnergyFromSource(creep, source)
                    if (criterias.creepIsFull(creep)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
            }
        },
        HARVEST_SOURCE: {
            name: "HARVEST_SOURCE",
            /**
             * @param creep Creep performing the task
             */
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const source = Game.getObjectById(currentTaskTicket.taskParams.sourceId)

                if (!source) {
                    throw(`Invalid source id ${currentTaskTicket.taskParams.sourceId}`)
                }

                const containers = creep.pos
                    .lookFor(LOOK_STRUCTURES)
                    .filter(s => s.structureType === STRUCTURE_CONTAINER)

                // repair container under if below min hits threshold and creep able
                if (
                    containers.length === 1
                    && containers[0].hits < 100000 // 2000 ticks of decay
                    && creep.carry[RESOURCE_ENERGY] > 0
                ) {
                    activities.repairTargetStructure(creep, containers[0])
                    return
                }

                activities.harvestEnergyFromSource(creep, source)
            }
        },
        CYCLIC_LEECH_FROM_SOURCE_CONTAINER: {
            name: "CYCLIC_LEECH_FROM_SOURCE_CONTAINER",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const sourceId = currentTaskTicket.taskParams.sourceId
                const source = Game.getObjectById(sourceId)
                const container = source.pos.findInRange(FIND_STRUCTURES, 1)
                    .filter(struct => struct.structureType === STRUCTURE_CONTAINER)[0]

                if (!container || container.store[RESOURCE_ENERGY] === 0 || criterias.creepIsFull(creep)) {
                    console.log(`Creep ${creep.name} is full or no container containing energy `
                        + `close to source id ${sourceId}. Going to next task.`)
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    return
                }

                if (activities.withdrawResourceFromTarget(creep, container) === OK) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
            }
        },
        CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM: {
            name: "CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = currentTaskTicket.taskParams.resourceType
                const amount = currentTaskTicket.taskParams.amount
                const roomName = currentTaskTicket.taskParams.roomName
                const container = creep.pos.findClosestByPath(
                    Game.rooms[roomName]
                        .find(FIND_STRUCTURES)
                        .filter(s => s.structureType === STRUCTURE_CONTAINER
                            && s.store[resourceType] > 100
                        )
                )

                if (!container || criterias.creepIsFull(creep)) {
                    console.log(`Creep ${creep.name} is full or no container. Going to next task.`)
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    return
                }

                if (activities.withdrawResourceFromTarget(creep, container, resourceType, amount) === OK) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
            }
        },
        CYCLIC_LEECH_ENERGY_FROM_FULLEST_CONTAINER_IN_ROOM: {
            name: "CYCLIC_LEECH_ENERGY_FROM_FULLEST_CONTAINER_IN_ROOM",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = RESOURCE_ENERGY
                const amount = currentTaskTicket.taskParams.amount
                const roomName = currentTaskTicket.taskParams.roomName
                const container = Game.rooms[roomName]
                    .find(FIND_STRUCTURES)
                    .filter(s => s.structureType === STRUCTURE_CONTAINER)
                    .sort((a, b) => {
                        return _.sum(b.store) - _.sum(a.store)
                    })[0]

                if (!container || criterias.creepIsFull(creep)) {
                    console.log(`Creep ${creep.name} is full or no container. Going to next task.`)
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    return
                }

                if (activities.withdrawResourceFromTarget(creep, container, resourceType, amount) === OK) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
            }
        },
        CYCLIC_LEECH_FROM_ROOM_STORAGE: {
            name: "CYCLIC_LEECH_FROM_ROOM_STORAGE",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = currentTaskTicket.taskParams.resourceType
                const amount = currentTaskTicket.taskParams.amount
                const roomName = currentTaskTicket.taskParams.roomName
                const storage = generalUtils.getRoom(roomName)
                    .find(FIND_STRUCTURES)
                    .filter(s => s.structureType === STRUCTURE_STORAGE && s.store[resourceType] > 0)[0]

                if (!storage
                    || storage.store[resourceType] === 0
                    || criterias.creepIsFull(creep)
                    || criterias.creepResourceIsNotEmpty(creep, resourceType) /* should spend all before getting more */ )
                {
                    console.log(`Creep ${creep.name} is full or no storage with resource `
                        + `in room ${roomName}. Going to next task.`)
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
                else {
                    if (activities.withdrawResourceFromTarget(creep, storage, resourceType, amount) === OK) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
            }
        },
        CYCLIC_TRANSFER_ALL_RESOURCES_TO_ROOM_STORAGE: {
            name: "CYCLIC_TRANSFER_ALL_RESOURCES_TO_ROOM_STORAGE",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const room = generalUtils.getRoom(currentTaskTicket.taskParams.roomName)
                const storage = room.find(
                    FIND_STRUCTURES,
                    {
                        filter: s => s.structureType === STRUCTURE_STORAGE
                    }
                )[0]

                // no target is job done
                if (!storage || criterias.creepIsEmpty(creep)) {
                    console.log(`Creep ${creep.name} is empty or no storage. Going to next task.`)
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
                else {
                    Object.keys(creep.carry).forEach(resourceType => {
                        activities.transferResourceTypeToTarget(creep, storage, resourceType, null)
                    })
                    if (criterias.creepIsEmpty(creep)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
            }
        },
        CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS: {
            name: "CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS",
            /**
             *
             * @param creep Creep performing the task
             *  roomName: Name of the room with spawning structures to transfer energy to.
             */
            taskFunc:
                (creep) => {
                    const currentTaskTicket = getCurrentTaskTicket(creep)
                    const room = generalUtils.getRoom(currentTaskTicket.taskParams.roomName)
                    const target = creep.pos.findClosestByPath(room.find(
                        FIND_STRUCTURES, {
                            filter: function (struct) {
                                return (struct.structureType === STRUCTURE_EXTENSION
                                    || struct.structureType === STRUCTURE_SPAWN)
                                    && struct.energy < struct.energyCapacity
                            }
                        })
                    )

                    // no target is job done
                    if (!target || criterias.creepResourceIsEmpty(creep, RESOURCE_ENERGY)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                    else {
                        activities.transferResourceTypeToTarget(creep, target, RESOURCE_ENERGY)
                    }
                }
        },
        CYCLIC_UPGRADE_ROOM_CONTROLLER: {
            name: "CYCLIC_UPGRADE_ROOM_CONTROLLER",
            /**
             *
             * @param creep
             *  roomName: Name of the room to upgrade controller.
             */
            taskFunc:
                (creep) => {
                    const currentTaskTicket = getCurrentTaskTicket(creep)
                    const room = generalUtils.getRoom(currentTaskTicket.taskParams.roomName)
                    const target = room.controller

                    activities.upgradeRoomController(creep, target)
                    if (criterias.creepResourceIsEmpty(creep, RESOURCE_ENERGY)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
        },
        CYCLIC_BUILD_ROOM: {
            name: "CYCLIC_BUILD_ROOM",
            /**
             *
             * @param creep
             *  roomName: Name of the room to build all construction sites.
             */
            taskFunc:
                (creep) => {
                    const currentTaskTicket = getCurrentTaskTicket(creep)
                    const room = generalUtils.getRoom(currentTaskTicket.taskParams.roomName)
                    let target

                    const wallAndRampart = room.find(FIND_CONSTRUCTION_SITES, {
                        filter: cs => cs.structureType === STRUCTURE_WALL || cs.structureType === STRUCTURE_RAMPART
                    })

                    // wall and Ramparts get priority
                    if (wallAndRampart.length > 0) {
                        target = creep.pos.findClosestByPath(wallAndRampart)
                    } else {
                        target = creep.pos.findClosestByPath(room.find(FIND_CONSTRUCTION_SITES))
                    }

                    // rally is no target
                    if (!target) {
                        const flag = Game.flags[`${room.name}_RALLY`] ? Game.flags[`${room.name}_RALLY`] : room.controller
                        activities.goToTarget(creep, flag)
                    }
                    else {
                        activities.buildConstructionSite(creep, target)
                        if (criterias.creepResourceIsEmpty(creep, RESOURCE_ENERGY)) {
                            conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                        }
                    }
                }
        },
        CYCLIC_REPAIR_ROOM_STRUCTURES: {
            name: "CYCLIC_REPAIR_ROOM_STRUCTURES",
            /**
             *
             * @param creep
             *  roomName: Name of the room to repair until all fixed.
             */
            taskFunc:
                (creep) => {
                    const currentTaskTicket = getCurrentTaskTicket(creep)
                    const room = generalUtils.getRoom(currentTaskTicket.taskParams.roomName)
                    const indexOrderedStructures = room
                        .find(FIND_STRUCTURES)
                        .filter(struct => struct.hits < struct.hitsMax)
                        .sort(
                            function (a, b) {
                                return (
                                    a.hits * (2 + Math.pow(creep.pos.getRangeTo(a), 1 / 3) + 5 * (a.hits / a.hitsMax))
                                    - b.hits * (2 + Math.pow(creep.pos.getRangeTo(b), 1 / 3) + 5 * (b.hits / b.hitsMax))
                                )
                            }
                        )
                    const target = indexOrderedStructures[0]

                    // rally if no target
                    if (!target) {
                        const flag = generalUtils.getRoomRallyFlag(room.name)
                        activities.goToTarget(creep, flag)
                    }
                    else {
                        activities.repairTargetStructure(creep, target)
                        if (criterias.creepResourceIsEmpty(creep, RESOURCE_ENERGY)) {
                            conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                        }
                    }
                }
        },
        CYCLIC_FEED_EMPTIER_TOWER: {
            name: "CYCLIC_FEED_EMPTIER_TOWER",
            taskFunc:
                (creep) => {
                    const currentTaskTicket = getCurrentTaskTicket(creep)
                    const amount = currentTaskTicket.taskParams.amount
                    const room = Game.rooms[currentTaskTicket.taskParams.roomName]
                    const tower = room.find(
                        FIND_STRUCTURES,
                        {
                            filter: s => {
                                return s.structureType === STRUCTURE_TOWER
                                    && s.energy + 400 /* min demand */ < s.energyCapacity
                            }
                        }
                    ).sort((a, b) => a.energy - b.energy)[0]

                    if (!tower || criterias.creepResourceIsEmpty(creep, RESOURCE_ENERGY)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                    else {
                        activities.transferResourceTypeToTarget(creep, tower, RESOURCE_ENERGY, amount)
                        if (criterias.targetIsFull(creep, tower, RESOURCE_ENERGY) || criterias.creepIsEmpty(creep)) {
                            conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                        }
                    }
                }
        },
        GO_TO_HARVESTING_POSITION: {
            name: "GO_TO_HARVESTING_POSITION",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const source = Game.getObjectById(currentTaskTicket.taskParams.sourceId)

                const container = source.pos.findInRange(FIND_STRUCTURES, 1)
                    .filter(struct => struct.structureType === STRUCTURE_CONTAINER)[0]


                if (container) {
                    activities.goToTarget(creep, container)
                    if (criterias.creepIsOnTarget(creep, container)) {
                        conclusions.performNextTask(creep)
                    }
                }
                else {
                    activities.goToTarget(creep, source)
                    if (criterias.creepIsAtTarget(creep, source, 1)) {
                        conclusions.performNextTask(creep)
                    }
                }
            }
        },
        CYCLIC_GO_CLOSE_TO_TARGET: {
            name: "CYCLIC_GO_CLOSE_TO_TARGET",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                currentTaskTicket.taskName = "GO_CLOSE_TO_TARGET"
            }
        },
        GO_CLOSE_TO_TARGET: {
            name: "GO_CLOSE_TO_TARGET",
            taskFunc: (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const range = currentTaskTicket.taskParams.range
                const targetPosParams = currentTaskTicket.taskParams.targetPosParams
                const targetPos = new RoomPosition(targetPosParams.x, targetPosParams.y, targetPosParams.roomName)
                activities.goToTarget(creep, targetPos)
                if (criterias.creepIsInRangeOfTarget(creep, targetPos, range)) {
                    conclusions.performNextTask(creep)
                }
            }
        },
        RESERVE_ROOM_CONTROLLER: {
            name: "RESERVE_ROOM_CONTROLLER",
            taskFunc: (creep) => {
                const taskTicket = getCurrentTaskTicket(creep)
                const roomName = taskTicket.taskParams.roomName
                const room = Game.rooms[roomName]

                if (!room) {
                    const flag = generalUtils.getRoomRallyFlag(roomName)
                    activities.goToTarget(creep, flag)
                }
                else {
                    activities.reserveRoomController(creep, room.controller)
                }
            }
        },
        CLAIM_ROOM_CONTROLLER: {
            name: "CLAIM_ROOM_CONTROLLER",
            taskFunc: (creep) => {
                const taskTicket = getCurrentTaskTicket(creep)
                const roomName = taskTicket.taskParams.roomName
                const room = Game.rooms[roomName]

                if (!room) {
                    const flag = generalUtils.getRoomRallyFlag(roomName)
                    activities.goToTarget(creep, flag)
                }
                else {
                    activities.claimRoomController(creep, room.controller)
                }
            }
        },
        CYCLIC_PICKUP_DROPPED_RESOURCE_ON_ROOM: {
            name: "CYCLIC_PICKUP_DROPPED_RESOURCE_ON_ROOM",
            taskFunc: (creep) => {
                const taskTicket = getCurrentTaskTicket(creep)
                const roomName = taskTicket.taskParams.roomName
                const room = generalUtils.getRoom(roomName)

                if (!room){
                    console.log(`Creep ${creep.name} has no visibility in ${roomName}. Cycling.`)
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, taskTicket)
                    return
                }

                const droppedResourcesOfInterest = room.find(FIND_DROPPED_RESOURCES)
                    .filter(dr => {
                            /* this https://screeps.com/forum/topic/2211/document-pathfinding/4  hints roads are
                             * included in the default cost matrix */
                            const estimatedCostToResource = PathFinder.search(creep.pos, dr.pos).cost
                            // adopting three times the estimated tick cost plus estimated decay as penalty
                            const ammountWithPenalty = dr.amount - estimatedCostToResource
                                * (3 + Math.ceil(dr.amount / 1000))
                            return ammountWithPenalty > 0
                                // balanced creep can hopefully pickup the resource and come back
                                && creep.ticksToLive > 2 * estimatedCostToResource
                                // creep is able to pickup at least 3 times the estimated cost to the resource
                                && creep.carryCapacity - _.sum(creep.carry) >= 3 * estimatedCostToResource
                        }
                    )
                    .sort((a, b) => (creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b)))

                if (droppedResourcesOfInterest.length === 0 || criterias.creepIsFull(creep)) {
                    // done, next.
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, taskTicket)
                    return;
                }
                activities.pickupDroppedResource(creep, droppedResourcesOfInterest[0])
            }
        },
        GUARD_ROOM: {
            name: "GUARD_ROOM",
            taskFunc: (creep) => {
                const taskTicket = getCurrentTaskTicket(creep)
                const roomName = taskTicket.taskParams.roomName
                const room = Game.rooms[roomName]

                if (!room) {
                    const rallyFlag = generalUtils.getRoomRallyFlag(roomName)
                    activities.goToTarget(rallyFlag)
                    return
                }

                const hostiles = generalUtils.findHostiles(room)

                if (hostiles.length > 0) {
                    activities.attackTarget(creep, hostiles[0])
                }
            }
        }
    }
}


