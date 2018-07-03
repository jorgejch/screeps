import {getRoom, getGameObjectById} from 'generalUtils'
import {CreepIsFull, CreepResourceIsEmpty, CreepIsOnTarget} from 'doneCriterias';
import {UnregisterAndAddCurrentTaskToQueueTop, Foo} from 'conclusions';
import {
    HarvestEnergyFromSource,
    TransferAllResourceTypeToTarget,
    UpgradeRoomController,
    BuildRoomConstructionSite,
    RepairTargetStructure, GoToTarget, DropResourceAmount
} from "activities";

class Outcome {
    constructor(doneCriteria, conclusion) {
        this.doneCriteria = doneCriteria
        this.conclusion = conclusion
    }
}

function getCurrentTaskTicket(creep) {
    return creep.memory.currentTaskTicket
}

function executeTaskStep(creep, activity, outcome) {
    if (outcome.doneCriteria.test(creep)) {
        outcome.conclusion.conclude(creep)
        return
    }
    activity.perform(creep)
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
                conclusion = new Foo()
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
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const roomName = creep.pos.roomName
            let activity, doneCriteria, conclusion
            const source = creep.pos.findClosestByPath(getRoom(roomName).find(FIND_SOURCES_ACTIVE))

            if (!source) {
                console.log(`No source for ${creep.name}. Rallying.`)
                const flag = Game.flags[`${roomName}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new Foo()
            } else {
                activity = new HarvestEnergyFromSource(source)
                doneCriteria = new CreepIsFull()
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
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const room = getRoom(currentTaskTicket.taskParams.roomName)
            let activity, doneCriteria, conclusion
            const target = creep.pos.findClosestByPath(room.find(FIND_STRUCTURES, {
                    filter: function (struct) {
                        return (struct.structureType === STRUCTURE_EXTENSION
                            || struct.structureType === STRUCTURE_SPAWN)
                            && struct.energy < struct.energyCapacity
                    }
                })
            )

            // no target is job done
            if (!target) {
                console.log(`No target for ${creep.name}. Rallying around closest Spawn.`)
                const flag = Game.flags[`${room.name}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new Foo()
            }
            else {
                activity = new TransferAllResourceTypeToTarget(target, RESOURCE_ENERGY)
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
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const resourceType = currentTaskTicket.taskParams.resourceType
            const roomName = currentTaskTicket.taskParams.resourceType
            const cam = getGameObjectById(currentTaskTicket.taskParams.containerAssignmentManager)
            const target = cam.allocateClosetFreeContainerInRoomToCreep(creep, roomName)

            // rally if no target
            if (!target){
                const flag = Game.flags[roomName]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new Foo()
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
                    conclusion = new Foo()
                }
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_UPGRADE_ROOM_CONTROLLER: {
        name: "CYCLIC_UPGRADE_ROOM_CONTROLLER",
        /**
         *
         * @param creep
         *  roomName: Name of the room to upgrade controller.
         */
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const room = getRoom(currentTaskTicket.taskParams.roomName)
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
    },
    CYCLIC_BUILD_ROOM: {
        name: "CYCLIC_BUILD_ROOM",
        /**
         *
         * @param creep
         *  roomName: Name of the room to build all construction sites.
         */
        taskFunc: (creep) => {
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const room = getRoom(currentTaskTicket.taskParams.roomName)
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
                console.log(`No target for ${creep.name}. Rallying.`)
                const flag = Game.flags[`${room.name}_RALLY`] ? Game.flags[`${room.name}_RALLY`] : room.controller
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new Foo()
            }
            else {
                activity = new BuildRoomConstructionSite(target)
                doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_BUILD_ALL: {
        name: "CYCLIC_BUILD_ALL",
        taskFunc: (creep) => {
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

            // rally is no target
            if (!target) {
                console.log(`No target for ${creep.name}. Rallying.`)
                const flag = Game.flags[`${creep.memory.ownerRoomName}_RALLY`]
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new Foo()
            }
            else{
                activity = new BuildRoomConstructionSite(target)
                doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    },
    CYCLIC_REPAIR_ROOM_STRUCTURES: {
        name: "CYCLIC_REPAIR_ROOM_STRUCTURES",
        /**
         *
         * @param creep
         *  roomName: Name of the room to repair until all fixed.
         */
        taskFunc: (creep) => {
            let activity, doneCriteria, conclusion
            const currentTaskTicket = getCurrentTaskTicket(creep)
            const room = getRoom(currentTaskTicket.taskParams.roomName)
            const indexOrderedStructues = room
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
            const target = indexOrderedStructues[0]

            // rally if no target
            if (!target) {
                console.log(`No target for ${creep.name}. Rallying.`)
                const flag = Game.flags[`${room.name}_RALLY`] ? Game.flags[`${room.name}_RALLY`] : room.controller
                activity = new GoToTarget(flag)
                doneCriteria = new CreepIsOnTarget(flag)
                conclusion = new Foo()
            }
            else {
                activity = new RepairTargetStructure(target)
                doneCriteria = new CreepResourceIsEmpty(RESOURCE_ENERGY)
                conclusion = new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
            }
            executeTaskStep(creep, activity, new Outcome(doneCriteria, conclusion))
        }
    }
}

