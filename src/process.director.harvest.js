'use strict'

const tasks = require("./creep.tasks")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const DirectorProcess = require("./process.director.directorProcess")
const processUtils = require("./util.process")

module.exports = {
    HarvestDirector: class extends DirectorProcess {
        set sourceId(sourceId) {
            this.data.sourceId = sourceId
        }

        get sourceId() {
            return this.data.sourceId
        }

        get source() {
            return Game.getObjectById(this.sourceId)
        }

        isLocal() {
            return this.ownerRoomName === this.source.room.name
        }

        run() {
            const harvesterRole = "harvester"
            const freighterRole = "freighter"

            this.cleanRoleDeadProcesses(harvesterRole)
            this.cleanRoleDeadProcesses(freighterRole)

            if (!this.source) {
                throw `Invalid source id ${this.sourceId}`
            }

            // TODO: no harvester + no Feeder + incomplete spawns and exts === emergency
            const emergency = this.isLocal()
                && this.ownerRoom.find(FIND_MY_CREEPS).length === 0
                && this.ownerRoom.energyAvailable < this.ownerRoom.energyCapacityAvailable
            const roomEnergyCapacity = this.ownerRoom.energyCapacityAvailable
            let harvesterCurrentLevel = 0,
                freighterCurrentLevel = 0,
                reqNumOfHarvesters,
                harvesterBodyType,
                harvesterPriority,
                reqNumOfFreighters,
                harvesterInitialTaskTicketQueue,
                freighterBodyType,
                freighterPriority,
                freighterInitialTaskTicketQueue

            if (
                emergency
                || roomEnergyCapacity < energyCapacityLevels.LEVEL_2
                || this.ownerRoom.controller.level === 1
            ) {
                // to track when level goes up
                harvesterCurrentLevel = 1
                // basic harvesters feed
                reqNumOfFreighters = 0
                // there should be 3 basic workers harvesting at this level
                reqNumOfHarvesters = 2
                harvesterBodyType = `BASIC_WORKER_${harvesterCurrentLevel}`
                harvesterPriority = this.isLocal() ? 0 : 1
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name,
                        {roomName: this.ownerRoomName}
                    )]
            } else if (
                roomEnergyCapacity >= energyCapacityLevels.LEVEL_2
                && this.ownerRoom.controller.level >= 2
                && !processUtils.getRoomStorage(this.ownerRoom)
            ) {
                harvesterCurrentLevel =
                    roomEnergyCapacity >= energyCapacityLevels.LEVEL_3
                    && this.ownerRoom.controller.level >= 3
                        ? 3
                        : 2

                this.resolveLevelForRole(harvesterRole, harvesterCurrentLevel)
                // at this level creeps source from the resource pile or container
                reqNumOfFreighters = 0
                reqNumOfHarvesters = 1
                harvesterBodyType = `STATIONARY_WORKER_${harvesterCurrentLevel}`
                harvesterPriority = 1
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                ]
            } else {
                harvesterCurrentLevel = 3
                this.resolveLevelForRole(harvesterRole, harvesterCurrentLevel)
                reqNumOfHarvesters = 1
                harvesterBodyType = `STATIONARY_WORKER_${harvesterCurrentLevel}`
                harvesterPriority = 2
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                ]

                if (roomEnergyCapacity < energyCapacityLevels.LEVEL_4 || this.isLocal()) {
                    freighterCurrentLevel = 3
                    freighterBodyType = "FREIGHTER_3"
                    reqNumOfFreighters = this.isLocal() ? 2 : 4
                } else {
                    freighterCurrentLevel = 4
                    freighterBodyType = "FREIGHTER_4"
                    reqNumOfFreighters = this.isLocal() ? 1 : 3
                }

                this.resolveLevelForRole(freighterRole, freighterCurrentLevel)
                freighterPriority = 10
                freighterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_PICKUP_DROPPED_RESOURCE_ON_ROOM.name, {roomName: this.targetRoomName}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_LEECH_FROM_SOURCE_CONTAINER.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_TRANSFER_ALL_RESOURCES_TO_ROOM_STORAGE.name,
                        {roomName: this.ownerRoomName}
                    )]
            }

            this.resolveRoleProcessesQuantity(
                harvesterRole,
                reqNumOfHarvesters,
                harvesterBodyType,
                harvesterPriority,
                harvesterInitialTaskTicketQueue,
                this.sourceId,
                harvesterCurrentLevel,
                100
            )

            this.resolveRoleProcessesQuantity(
                freighterRole,
                reqNumOfFreighters,
                freighterBodyType,
                freighterPriority,
                freighterInitialTaskTicketQueue,
                this.sourceId,
                freighterCurrentLevel
            )
        }
    },
}