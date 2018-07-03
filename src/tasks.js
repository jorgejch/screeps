import {CreepIsFull, CreepResourceIsEmpty} from 'doneCriterias';
import {UnregisterAndAddCurrentTaskToQueueTop} from 'conclusions';
import {
    HarvestEnergyFromSource,
    TransferAllResourceTypeToTarget,
    UpgradeRoomController,
    BuildRoomConstructionSite,
    RepairTargetStructure
} from "activities";

class Outcome {
    constructor(doneCriteria, conclusion) {
        this.doneCriteria = doneCriteria
        this.conclusion = conclusion
    }
}

function getRoom(roomName) {
    return Game.rooms[roomName]
}

function executeTask(creep, activity, outcomes) {

    for (const outcomeIndex in outcomes) {
        const outcome = outcomes[outcomeIndex]
        if (outcome.doneCriteria.test(creep)) {
            outcome.conclusion.conclude(creep)
            return
        }
    }
    activity.perform(creep)
}


export default {
    CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM: {
        name: "CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM",
        /**
         *
         * @param creep Creep performing the task
         * @param currentTaskTicket TaskTicket with the following in taskParams:
         *  roomName: Name of the room to harvest the closest source to creep.
         */
        taskFunc: (creep, currentTaskTicket) => {
            const roomName = currentTaskTicket.taskParams.roomName
            let justRally = false
            let source

            if (creep.pos.roomName === roomName) {
                const room = Game.rooms[roomName]
                source = creep.pos.findClosestByPath(room.find(FIND_SOURCES_ACTIVE))
            } else {
                const flagName = `${roomName}_RALLY`
                source = Game.flags[flagName]
                justRally = true
            }

            // no source is job done
            if (!source) {
                console.log(`No source for ${creep.name}`)
                return
            }

            executeTask(
                creep,
                new HarvestEnergyFromSource(source, justRally),
                [
                    new Outcome(
                        new CreepIsFull(),
                        new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    )
                ],
            )
        }
    },
    CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS: {
        name: "CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS",
        /**
         *
         * @param creep Creep performing the task
         * @param currentTaskTicket TaskTicket with the following in taskParams:
         *  roomName: Name of the room with spawning structures to transfer energy to.
         */
        taskFunc: (creep, currentTaskTicket) => {
            const room = getRoom(currentTaskTicket.taskParams.roomName)
            let justRally = false
            let target = creep.pos.findClosestByPath(room.find(FIND_STRUCTURES, {
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
                target = Game.flags[`${room.name}_RALLY`]
                justRally = true
            }

            executeTask(
                creep,
                new TransferAllResourceTypeToTarget(target, RESOURCE_ENERGY, justRally),
                [
                    new Outcome(
                        new CreepResourceIsEmpty(RESOURCE_ENERGY),
                        new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    )
                ]
            )
        }
    },
    CYCLIC_UPGRADE_ROOM_CONTROLLER: {
        name: "CYCLIC_UPGRADE_ROOM_CONTROLLER",
        /**
         *
         * @param creep
         * @param currentTaskTicket TaskTicket with the following in taskParams:
         *  roomName: Name of the room to upgrade controller.
         */
        taskFunc: (creep, currentTaskTicket) => {
            const room = getRoom(currentTaskTicket.taskParams.roomName)
            const target = room.controller

            executeTask(
                creep,
                new UpgradeRoomController(target),
                [
                    new Outcome(
                        new CreepResourceIsEmpty(RESOURCE_ENERGY),
                        new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    )
                ]
            )
        }
    },
    CYCLIC_BUILD_ROOM: {
        name: "CYCLIC_BUILD_ROOM",
        /**
         *
         * @param creep
         * @param currentTaskTicket TaskTicket with the following in taskParams:
         *  roomName: Name of the room to build all construction sites.
         */
        taskFunc: (creep, currentTaskTicket) => {
            const room = getRoom(currentTaskTicket.taskParams.roomName)
            let target
            let justRally = false

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
                target = Game.flags[`${room.name}_RALLY`] ? Game.flags[`${room.name}_RALLY`] : room.controller
                justRally = true
            }

            executeTask(
                creep,
                new BuildRoomConstructionSite(target, justRally),
                [
                    new Outcome(
                        new CreepResourceIsEmpty(RESOURCE_ENERGY),
                        new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    )
                ]
            )
        }
    },
    CYCLIC_REPAIR_ROOM_STRUCTURES: {
        name: "CYCLIC_REPAIR_ROOM_STRUCTURES",
        /**
         *
         * @param creep
         * @param currentTaskTicket TaskTicket with the following in taskParams:
         *  roomName: Name of the room to repair until all fixed.
         */
        taskFunc: (creep, currentTaskTicket) => {
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
            console.log(`DEBUG: my structures ordered my repairability index, 
            first is more repairable:\n${JSON.stringify(indexOrderedStructues)}`)
            let target = indexOrderedStructues[0]
            let justRally = false

            // rally is no target
            if (!target) {
                console.log(`No target for ${creep.name}. Rallying.`)
                target = Game.flags[`${room.name}_RALLY`] ? Game.flags[`${room.name}_RALLY`] : room.controller
                justRally = true
            }

            executeTask(
                creep,
                new RepairTargetStructure(target, justRally),
                [
                    new Outcome(
                        new CreepResourceIsEmpty(RESOURCE_ENERGY),
                        new UnregisterAndAddCurrentTaskToQueueTop(currentTaskTicket)
                    )
                ]
            )
        }
    }
}
