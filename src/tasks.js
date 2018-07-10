import * as generalUtils from 'generalUtils'
import {FooConclusion, UnregisterAndAddCurrentTaskToQueueTop, UnregisterCurrentTask} from 'conclusions';
import {
    CreepHasUnclaimedTargetContainerAssigned,
    CreepHasUnclaimedSourceContainerAssigned,
    CreepIsFull,
    CreepResourceIsNotEmpty,
    CreepIsOnTarget,
    CreepResourceIsEmpty,
    CreepHasStoredTargetId,
    CreepHasNoStoredTargetId,
    TargetIsNotEmpty,
    FooFalseCriteria,
    FooTrueCriteria
} from 'doneCriterias';
import {
    BuildConstructionSite,
    DropResourceAmount,
    FollowPath,
    GoToTarget,
    HarvestEnergyFromSource,
    RepairTargetStructure,
    SetAssignedTargetContainer,
    TransferResourceTypeToTarget,
    UpgradeRoomController,
    WithdrawResourceFromTarget,
    RemoveAnyStoredTarget,
    ReserveRoomController,
    SetAssignedSourceContainer,
    StoreTargetId,
    FooActivity
} from "activities";
import {getGameObjectById} from "generalUtils";
import {getRoomFlag} from "generalUtils";

export class TaskTicket {
    constructor(taskName, taskParams = null) {
        this.taskName = taskName
        this.taskParams = taskParams
    }
}

class Outcome {
    constructor(doneCriteria, conclusion) {
        this.doneCriteria = doneCriteria
        this.conclusion = conclusion
    }
}

function findCheapestPath(origin, possibleDestinations) {
    return PathFinder.search(origin, possibleDestinations)
}

function getCurrentTaskTicket(creep) {
    return creep.memory.currentTaskTicket
}

function executeTaskStep(creep, activity, outcome) {
    activity.perform(creep)

    if (outcome.doneCriteria.test(creep)) {
        outcome.conclusion.conclude(creep)
    }
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
            let activity, doneCriteria, conclusion

            if (creep.pos.roomName === roomName) {
                const room = Game.rooms[roomName]
                const source = creep.pos.findClosestByPath(room.find(FIND_SOURCES_ACTIVE))

                // no source is job done
                if (!source) {
                    console.log(`No source for ${creep.name}`)
                    return
                }
                activity = new HarvestEnergyFromSource(source)
                doneCriteria = new CreepIsFull()
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)

            } else {
                const flag = Game.flags[`${roomName}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new FooConclusion()
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_HARVEST_CLOSEST_SOURCE: {
        name: "CYCLIC_HARVEST_CLOSEST_SOURCE",
        /**
         *
         * @param creep Creep performing the task
         */
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const roomName = creep.pos.roomName
            const source = creep.pos.findClosestByPath(generalUtils.getRoom(roomName).find(FIND_SOURCES_ACTIVE))

            if (!source) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new FooConclusion()
            } else {
                activity = new HarvestEnergyFromSource(source)
                doneCriteria = new CreepIsFull()
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_HARVEST_IN_PLACE: {
        name: "CYCLIC_HARVEST_IN_PLACE",
        /**
         * @param creep Creep performing the task
         */
        taskFunc: (creep) => {
            const source = creep.pos.findClosestByRange(FIND_SOURCES)

            if (!source) {
                console.log(`Creep ${creep.name} can't find source for in place harvest.`)
                return
            }
            const activity = new HarvestEnergyFromSource(source)
            const doneCriteria = new FooFalseCriteria()
            const conclusion = new FooConclusion()
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM: {
        name: "CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM",
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
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

            console.log(`DEBUG ${JSON.stringify(container)}`)
            if (!container) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new FooConclusion()
            } else {
                activity = new WithdrawResourceFromTarget(container, resourceType, amount)
                doneCriteria = new CreepResourceIsNotEmpty(resourceType)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_LEECH_FROM_ASSIGNED_CONTAINER_IN_ROOM: {
        name: "CYCLIC_LEECH_FROM_ASSIGNED_CONTAINER_IN_ROOM",
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const resourceType = currentTaskTicket.taskParams.resourceType
            const amount = currentTaskTicket.taskParams.amount
            const roomName = currentTaskTicket.taskParams.roomName
            const container = getGameObjectById(creep.memory.assignedSourceContainerId)

            if (!container) {
                const flag = Game.flags[`${roomName}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new FooConclusion()
            } else {
                activity = new WithdrawResourceFromTarget(container, resourceType, amount)
                doneCriteria = new CreepResourceIsNotEmpty(resourceType)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_LEECH_FROM_ROOM_STORAGE: {
        name: "CYCLIC_LEECH_FROM_ROOM_STORAGE",
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
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
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new FooConclusion()
            }
            else if (!storage) {
                activity = new FooActivity()
                doneCriteria = new CreepResourceIsNotEmpty(resourceType)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            else {
                activity = new WithdrawResourceFromTarget(storage, resourceType, amount)
                doneCriteria = new CreepResourceIsNotEmpty(resourceType)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_TRANSFER_RESOURCE_TO_ROOM_STORAGE: {
        name: "CYCLIC_TRANSFER_RESOURCE_TO_ROOM_STORAGE",
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const resourceType = currentTaskTicket.taskParams.resourceType
            const amount = currentTaskTicket.taskParams.amount
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
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new FooConclusion()
            }
            else {
                activity = new TransferResourceTypeToTarget(storage, resourceType, amount)
                doneCriteria = new CreepResourceIsEmpty(resourceType)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
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
                let activity, doneCriteria, conclusion
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
                if (!target) {
                    const flag = Game.flags[`${room.name}_RALLY`]
                    activity = new GoToTarget(flag)
                    doneCriteria = new CreepIsOnTarget(flag)
                    conclusion = new FooConclusion()
                }
                else {
                    activity = new TransferResourceTypeToTarget(target, RESOURCE_ENERGY)
                    doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
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
                let activity, doneCriteria, conclusion
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = currentTaskTicket.taskParams.resourceType
                const roomName = currentTaskTicket.taskParams.roomName
                const target = generalUtils.getGameObjectById(creep.memory.assignedTargetContainerId)

                // rally if no target
                if (!target) {
                    const flag = generalUtils.getRoomFlag(roomName)
                    activity = new GoToTarget(flag)
                    doneCriteria = new CreepIsOnTarget(flag)
                    conclusion = new FooConclusion()
                }
                else {
                    if (creep.pos.isEqualTo(target.pos)) {
                        if ("amount" in currentTaskTicket.taskParams) {
                            const amount = currentTaskTicket.taskParams.amount
                            activity = new DropResourceAmount(resourceType, amount)
                        }
                        else {
                            activity = new DropResourceAmount(resourceType)
                        }
                        doneCriteria = new CreepResourceIsEmpty(resourceType)
                        conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    }
                    else {
                        activity = new GoToTarget(target)
                        doneCriteria = new CreepIsOnTarget(target)
                        conclusion = new FooConclusion()
                    }
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    }
    ,
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

                executeTaskStep(
                    creep,
                    new UpgradeRoomController(target),
                    new Outcome(
                        new CreepResourceIsEmpty(RESOURCE_ENERGY),
                        new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    )
                )
            }
    }
    ,
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
                let target, activity, doneCriteria, conclusion

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
                    activity = new GoToTarget(flag)
                    doneCriteria = new CreepIsOnTarget(flag)
                    conclusion = new FooConclusion()
                }
                else {
                    activity = new BuildConstructionSite(target)
                    doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    }
    ,
    CYCLIC_BUILD_ALL: {
        name: "CYCLIC_BUILD_ALL",
        taskFunc:
            (creep) => {
                let target, activity, doneCriteria, conclusion
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
                    activity = new FollowPath(pathObj.path)
                    doneCriteria = new FooTrueCriteria()
                    conclusion = new FooConclusion()

                }
                else if (!target) {
                    const flag = Game.flags[`${creep.memory.ownerRoomName}_RALLY`]
                    activity = new GoToTarget(flag)
                    doneCriteria = new CreepIsOnTarget(flag)
                    conclusion = new FooConclusion()
                }
                else {
                    activity = new BuildConstructionSite(target)
                    doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    }
    ,
    CYCLIC_REPAIR_ROOM_STRUCTURES: {
        name: "CYCLIC_REPAIR_ROOM_STRUCTURES",
        /**
         *
         * @param creep
         *  roomName: Name of the room to repair until all fixed.
         */
        taskFunc:
            (creep) => {
                let activity, doneCriteria, conclusion
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
                    activity = new GoToTarget(flag)
                    doneCriteria = new CreepIsOnTarget(flag)
                    conclusion = new FooConclusion()
                }
                else {
                    activity = new RepairTargetStructure(target)
                    doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    }
    ,
    ALLOCATE_TARGET_CONTAINER_IN_ROOM: {
        name: "ALLOCATE_TARGET_CONTAINER_IN_ROOM",
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
                const activity = new SetAssignedTargetContainer(target.id)
                const doneCriteria = new CreepHasUnclaimedTargetContainerAssigned()
                const conclusion = new UnregisterCurrentTask()
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    },
    ALLOCATE_SOURCE_CONTAINER_IN_ROOM: {
        name: "ALLOCATE_SOURCE_CONTAINER_IN_ROOM",
        taskFunc:
            (creep) => {
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const roomName = currentTaskTicket.taskParams.roomName
                let target = generalUtils.getClosestUnassignedSourceContainerInRoom(creep, roomName)

                console.log(`DEBUG 1`)
                if (!target && !creep.memory.assignedSourceContainerId) {
                    console.log(`No available container on room ${roomName} for creep ${creep.name}.`)
                    return
                } else if (!target) {
                    target = generalUtils.getGameObjectById(creep.memory.assignedSourceContainerId)
                }
                console.log(`DEBUG 2`)

                const activity = new SetAssignedSourceContainer(target.id)
                const doneCriteria = new CreepHasUnclaimedSourceContainerAssigned()
                const conclusion = new UnregisterCurrentTask()
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    },
    CYCLIC_STORE_STRUCTURE_TO_LOAD: {
        name: "CYCLIC_STORE_STRUCTURE_TO_LOAD",
        taskFunc:
            (creep) => {
                let activity, doneCriteria, conclusion
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const structureType = currentTaskTicket.taskParams.structureType
                const notFullFunc = (struct) => {
                    if (struct.store) {
                        return _.sum(struct.store) < struct.storeCapacity - 100
                    }
                    else {
                        return struct.energy < struct.energyCapacity - 100
                    }
                }
                const struct = creep.pos.findClosestByPath(
                    FIND_STRUCTURES,
                    {
                        filter: s => {
                            return s.structureType === structureType && notFullFunc(s)
                        }
                    }
                )
                console.log(`DEBUG 2${JSON.stringify(struct)}`)
                if (!struct) {
                    // job done
                    console.log(`Creep ${creep.name} has no structure to store.`)
                    return
                }
                else {
                    activity = new StoreTargetId(struct.id)
                    doneCriteria = new CreepHasStoredTargetId()
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
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
                let activity, doneCriteria, conclusion
                const currentTaskTicket = getCurrentTaskTicket(creep)
                const resourceType = currentTaskTicket.taskParams.resourceType
                const amount = currentTaskTicket.taskParams.amount
                const targetId = creep.memory.storedTargetId
                let target
                if (targetId) {
                    target = getGameObjectById(targetId)
                }

                if (!target) {
                    // job done
                    activity = new FooActivity()
                    doneCriteria = new FooTrueCriteria()
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                else {
                    activity = new TransferResourceTypeToTarget(target, resourceType, amount)
                    doneCriteria = new TargetIsNotEmpty(target, resourceType)
                    conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                }
                executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
            }
    },
    GOTO_ASSIGNED_TARGET_CONTAINER: {
        name: "GOTO_ASSIGNED_TARGET_CONTAINER",
        taskFunc: (creep) => {

            let activity, doneCriteria, conclusion
            const container = generalUtils.getGameObjectById(creep.memory.assignedTargetContainerId)

            // rally if no target
            if (!container) {
                console.log(`Unable to acquire target container for creep ${creep.name} `
                    + `to go to. Got ${JSON.stringify(container)}. `)
            }
            else {
                activity = new GoToTarget(container)
                doneCriteria = new CreepIsOnTarget(container)
                conclusion = new UnregisterCurrentTask()
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    RESERVE_STORED_ROOM_CONTROLLER: {
        name: "RESERVE_STORED_ROOM_CONTROLLER",
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
            const taskTicket = getCurrentTaskTicket(creep)
            const roomName = taskTicket.taskParams.roomName
            const controller = getGameObjectById(Game.rooms[roomName].controller)

            if (!controller) {
                const flag = getRoomFlag(roomName)
                activity = new GoToTarget(flag)
                doneCriteria = new FooTrueCriteria()
                conclusion = new FooConclusion()
            }
            else {
                activity = new ReserveRoomController(controller)
                doneCriteria = new FooTrueCriteria()
                conclusion = new FooConclusion()
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    }
}


