import * as generalUtils from 'src/util.general'
import * as conclusions from 'src/creep.conclusions';
import * as criterias from 'src/creep.criterias';
import * as activities from "src/creep.activities";

export class TaskTicket {
    constructor(taskName, taskParams = null) {
        this.taskName = taskName
        this.taskParams = taskParams
    }
}

function findCheapestPath(origin, possibleDestinations) {
    return PathFinder.search(origin, possibleDestinations)
}

function getCurrentTaskTicket(creep) {
    return creep.memory.currentTaskTicket
}

export default {
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
    CYCLIC_HARVEST_CLOSEST_SOURCE: {
        name: "CYCLIC_HARVEST_CLOSEST_SOURCE",
        /**
         *
         * @param creep Creep performing the task
         */
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const roomName = creep.pos.roomName
            const source = creep.pos.findClosestByPath(generalUtils.getRoom(roomName).find(FIND_SOURCES_ACTIVE))

            if (!source) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activities.goToTarget(creep, flag)
            } else {
                activities.harvestEnergyFromSource(creep, source)
                if (criterias.creepIsFull(creep)) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
            }
        }
    },
    CYCLIC_HARVEST_CLOSEST_SOURCE_IN_PLACE: {
        name: "CYCLIC_HARVEST_CLOSEST_SOURCE_IN_PLACE",
        /**
         * @param creep Creep performing the task
         */
        taskFunc: (creep) => {
            const source = creep.pos.findClosestByRange(FIND_SOURCES)

            if (!source) {
                throw(`Creep ${creep.name} can't find source for in place harvest.`)
            }
            activities.harvestEnergyFromSource(creep, source)
        }
    },
    CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM: {
        name: "CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM",
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const resourceType = currentTaskTicket.taskParams.resourceType
            const amount = currentTaskTicket.taskParams.amount
            const roomName = currentTaskTicket.taskParams.roomName
            const container = creep.pos.findClosestByPath(generalUtils.getRoom(roomName)
                .find(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                        && s.store[resourceType] > 100
                })
            )

            if (!container) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activities.goToTarget(creep, flag)
            } else {
                activities.withdrawResourceFromTarget(creep, container, resourceType, amount)
                if (criterias.creepResourceIsNotEmpty(creep, resourceType)) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
            }
        }
    },
    CYCLIC_LEECH_ALL_FROM_FULLEST_CONTAINER_IN_ROOM: {
        name: "CYCLIC_LEECH_ALL_FROM_FULLEST_CONTAINER_IN_ROOM",
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const amount = currentTaskTicket.taskParams.amount
            const roomName = currentTaskTicket.taskParams.roomName
            const container = generalUtils.getRoom(roomName)
                .find(FIND_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER
                    }
                ).sort((a, b) => {
                    return _.sum(b.store) - _.sum(a.store)
                })[0]

            if (!container) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activities.goToTarget(creep, flag)
            } else {
                for (const storedResource in container.store) {
                    if (_.sum(creep.carry) === creep.carryCapacity) {
                        break
                    }
                    activities.withdrawResourceFromTarget(creep, container, storedResource, amount)
                }
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
            const container = generalUtils.getRoom(roomName)
                .find(FIND_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER
                    }
                ).sort((a, b) => {
                    return _.sum(b.store) - _.sum(a.store)
                })[0]

            if (!container) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activities.goToTarget(creep, flag)
            } else {
                activities.withdrawResourceFromTarget(creep, container, resourceType, amount)
                if (criterias.creepResourceIsNotEmpty(creep, resourceType)) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
            }
        }
    },
    CYCLIC_LEECH_FROM_ASSIGNED_CONTAINER_IN_ROOM: {
        name: "CYCLIC_LEECH_FROM_ASSIGNED_CONTAINER_IN_ROOM",
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const resourceType = currentTaskTicket.taskParams.resourceType
            const amount = currentTaskTicket.taskParams.amount
            const roomName = currentTaskTicket.taskParams.roomName
            const container = generalUtils.getGameObjectById(creep.memory.assignedSourceContainerId)

            if (!container) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activities.goToTarget(flag)
            } else {
                activities.withdrawResourceFromTarget(creep, container, resourceType, amount)
                if (criterias.creepResourceIsNotEmpty(creep, resourceType)) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
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
                .find(
                    FIND_STRUCTURES,
                    {
                        filter: s => s.structureType === STRUCTURE_STORAGE
                            && s.store[resourceType] > 0
                    }
                )[0]

            if (!storage && creep.energy === 0) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activities.goToTarget(creep, flag)
            }
            else if (!storage) {
                conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
            }
            else {
                activities.withdrawResourceFromTarget(creep, storage, resourceType, amount)
                if (criterias.creepResourceIsNotEmpty(creep, resourceType)) {
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
            if (!storage) {
                const flag = Game.flags[`${room.name}_RALLY`]
                activities.goToTarget(creep, flag)
            }
            else {
                Object.keys(creep.carry).forEach(resourceType => {
                    activities.transferResourceTypeToTarget(creep, storage, resourceType, null)
                })
                if (criterias.creepIsEmpty(creep)){
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
    CYCLIC_DROP_RESOURCE_ON_TOP_ASSIGNED_CONTAINER: {
        name: "CYCLIC_DROP_RESOURCE_ON_TOP_ASSIGNED_CONTAINER",
        /**
         *
         * @param creep Creep performing the task
         *  container: The container to drop on top of
         *
         */
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = currentTaskTicket.taskParams.resourceType
                const roomName = currentTaskTicket.taskParams.roomName
                const target = generalUtils.getGameObjectById(creep.memory.assignedTargetContainerId)

                // rally if no target
                if (!target) {
                    const flag = generalUtils.getRoomFlag(roomName)
                    activities.goToTarget(creep, flag)
                }
                else {
                    if (creep.pos.isEqualTo(target.pos)) {
                        if ("amount" in currentTaskTicket.taskParams) {
                            const amount = currentTaskTicket.taskParams.amount
                            activities.dropResourceAmount(creep, resourceType, amount)
                        }
                        else {
                            activities.dropResourceAmount(creep, resourceType)
                        }
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                    else {
                        activities.goToTarget(creep, target)
                    }
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
    CYCLIC_BUILD_ALL: {
        name: "CYCLIC_BUILD_ALL",
        taskFunc:
            (creep) => {
                let target
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const constructionSites = Object.values(Game.constructionSites)
                const wallAndRampartCs = constructionSites
                    .filter(cs => cs.structureType === STRUCTURE_WALL || cs.structureType === STRUCTURE_RAMPART)

                // wall and Ramparts get priority
                if (wallAndRampartCs.length > 0) {
                    target = creep.pos.findClosestByPath(wallAndRampartCs)
                } else {
                    target = creep.pos.findClosestByPath(constructionSites)
                }

                // rally if no target
                if (!target && constructionSites.length > 0) {
                    const pathObj = findCheapestPath(creep.pos, constructionSites)
                    activities.followPath(creep, pathObj.path)
                }
                else if (!target) {
                    const flag = Game.flags[`${creep.memory.ownerRoomName}_RALLY`]
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
                    const flag = Game.flags[`${room.name}_RALLY`] ? Game.flags[`${room.name}_RALLY`] : room.controller
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
    ALLOCATE_FREE_TARGET_CONTAINER_IN_ROOM: {
        name: "ALLOCATE_FREE_TARGET_CONTAINER_IN_ROOM",
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const roomName = currentTaskTicket.taskParams.roomName
                let target = generalUtils.getClosestUnassignedTargetContainerInRoom(creep, roomName)

                if (!target && !("assignedTargetContainerId" in creep.memory)) {
                    console.log(`No available container on room ${roomName} for creep ${creep.name}.`)
                    return
                } else if ("assignedTargetContainerId" in creep.memory) {
                    target = generalUtils.getGameObjectById(creep.memory.assignedTargetContainerId)
                }
                activities.setAssignedTargetContainer(creep, target.id)
                conclusions.performNextTask(creep)
            }
    },
    ALLOCATE_SPECIFIC_TARGET_CONTAINER_IN_ROOM: {
        name: "ALLOCATE_SPECIFIC_TARGET_CONTAINER_IN_ROOM",
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const containerId = currentTaskTicket.taskParams.containerId

                if (!containerId) {
                    throw(`Invalid containerId ${JSON.stringify(containerId)} for creep ${creep.name}.`)
                } else {
                    activities.setAssignedTargetContainer(creep, containerId)
                    conclusions.performNextTask(creep)
                }
            }
    },
    ALLOCATE_FREE_SOURCE_CONTAINER_IN_ROOM: {
        name: "ALLOCATE_FREE_SOURCE_CONTAINER_IN_ROOM",
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const roomName = currentTaskTicket.taskParams.roomName
                let target = generalUtils.getClosestUnassignedSourceContainerInRoom(creep, roomName)

                if (!target && !creep.memory.assignedSourceContainerId) {
                    console.log(`No available container on room ${roomName} for creep ${creep.name}.`)
                    return
                } else if (!target) {
                    target = generalUtils.getGameObjectById(creep.memory.assignedSourceContainerId)
                }

                activities.setAssignedSourceContainer(creep, target.id)
                conclusions.performNextTask(creep)
            }
    },
    CYCLIC_STORE_TOWER_TO_LOAD: {
        name: "CYCLIC_STORE_TOWER_TO_LOAD",
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const room = generalUtils.getRoom(currentTaskTicket.taskParams.roomName)
                const struct = room.find(
                    FIND_STRUCTURES,
                    {
                        filter: s => {
                            return s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity - 100
                        }
                    }
                ).sort((a, b) => a.energy - b.energy)[0]
                if (!struct) {
                    // job done
                    activities.storeTargetId(creep, null)
                    if (criterias.creepHasNoStoredTargetId(creep)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
                else {
                    activities.storeTargetId(creep, struct.id)
                    if (criterias.creepHasStoredTargetId(creep)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
            }
    },
    CYCLIC_TRANSFER_RESOURCE_TO_STORED_TARGET_STRUCTURE: {
        name: "CYCLIC_TRANSFER_RESOURCE_TO_STORED_TARGET_STRUCTURE",
        /**
         *
         * @param creep Creep performing the task
         */
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = currentTaskTicket.taskParams.resourceType
                const amount = currentTaskTicket.taskParams.amount
                const targetId = creep.memory.storedTargetId
                let target
                if (targetId) {
                    target = generalUtils.getGameObjectById(targetId)
                }

                if (!target) {
                    // job done
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                }
                else {
                    activities.transferResourceTypeToTarget(creep, target, resourceType, amount)
                    if (criterias.targetIsNotEmpty(creep, target, resourceType)) {
                        conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, currentTaskTicket)
                    }
                }
            }
    },
    GOTO_ASSIGNED_TARGET_CONTAINER: {
        name: "GOTO_ASSIGNED_TARGET_CONTAINER",
        taskFunc: (creep) => {
            const container = generalUtils.getGameObjectById(creep.memory.assignedTargetContainerId)

            // rally if no target
            if (!container) {
                console.log(`Unable to acquire target container for creep ${creep.name} `
                    + `to go to. Got ${JSON.stringify(container)}. `)
            }
            else {
                activities.goToTarget(creep, container)
                if (criterias.creepIsOnTarget(creep, container)) {
                    conclusions.performNextTask(creep)
                }
            }
        }
    },
    RESERVE_STORED_ROOM_CONTROLLER: {
        name: "RESERVE_STORED_ROOM_CONTROLLER",
        taskFunc: (creep) => {
            const taskTicket = getCurrentTaskTicket(creep)
            const roomName = taskTicket.taskParams.roomName
            const room = Game.rooms[roomName]

            if (!room) {
                const flag = generalUtils.getRoomFlag(roomName)
                activities.goToTarget(creep, flag)
            }
            else {
                const controller = Game.rooms[roomName].controller
                activities.reserveRoomController(creep, controller)
            }
        }
    },
    CYCLIC_PICKUP_DROPPED_RESOURCE: {
        name: "CYCLIC_PICKUP_DROPPED_RESOURCE",
        taskFunc: (creep) => {
            const taskTicket = getCurrentTaskTicket(creep)
            const room = generalUtils.getRoom(creep.pos.roomName)

            const droppedResource = creep.pos.findClosestByPath(
                room.find(
                    FIND_DROPPED_RESOURCES,
                    {
                        filter: dr => {
                            /* this https://screeps.com/forum/topic/2211/document-pathfinding/4  hints roads are
                             * included in the default cost matrix */
                            const estimatedCostToResource = PathFinder.search(creep.pos, dr.pos).cost // back and forth
                            // adopting twice the estimated tick cost plus estimated decay as penalty
                            const ammountWithPenalty = dr.amount - estimatedCostToResource
                                * (2 + Math.ceil(dr.amount / 1000))
                            return ammountWithPenalty > 0
                                && creep.ticksToLive > 2 * estimatedCostToResource  // assuming creep balanced amt of M
                                // an arbitrary value
                                && creep.carryCapacity - _.sum(creep.carry) >= 2 * estimatedCostToResource
                        }
                    }))
            if (!droppedResource || _.sum(creep.carry) === creep.carryCapacity) {
                conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, taskTicket)
            }
            else {
                if (activities.pickupDroppedResource(creep, droppedResource)) {
                    conclusions.addCurrentTaskToTopOfQueueAndPerformNextTask(creep, taskTicket)
                }
            }
        }
    }
}


