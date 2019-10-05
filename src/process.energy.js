const BaseProcess = require("src/process.baseProcess")
const tasks = require("creep.tasks")
const energyCapacityLevels = require("util.energyCapacityLevels")
const mixins = require("src/process.activityDirectorProcess")
const processUtils = require("util.process")

module.exports = {
    SourceHarvestManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
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
            const emergency = this.ownerRoom.find(FIND_MY_CREEPS).length === 0
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

            if (emergency || roomEnergyCapacity < energyCapacityLevels.LEVEL_2) {
                harvesterCurrentLevel = 1  // to track when level goes up
                // basic harvesters feed
                reqNumOfFreighters = 0
                // there should be 3 basic workers harvesting at this level
                reqNumOfHarvesters = 3
                harvesterBodyType = "BASIC_WORKER_1"
                harvesterPriority = 0
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name,
                        {roomName: this.ownerRoomName}
                    )]
            }
            else if (!processUtils.getRoomStorage(this.ownerRoom)) {
                harvesterCurrentLevel = 2
                this.resolveLevelForRole(harvesterRole, harvesterCurrentLevel)
                // at this level creeps source from the resource pile or container
                reqNumOfFreighters = 0
                reqNumOfHarvesters = 1
                harvesterBodyType = "STATIONARY_WORKER_2"
                harvesterPriority = 4
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                ]
            }
            else  {
                harvesterCurrentLevel = 3
                this.resolveLevelForRole(harvesterRole, harvesterCurrentLevel)
                reqNumOfHarvesters = 1
                harvesterBodyType = "STATIONARY_WORKER_3"
                harvesterPriority = 4
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                ]

                if (roomEnergyCapacity < energyCapacityLevels.LEVEL_4 || this.isLocal()){
                    freighterCurrentLevel = 3
                    freighterBodyType = "FREIGHTER_3"
                    reqNumOfFreighters = this.isLocal() ? 1 : 4
                }
                else if(roomEnergyCapacity < energyCapacityLevels.LEVEL_5 ){
                    freighterCurrentLevel = 4
                    freighterBodyType = "FREIGHTER_4"
                    reqNumOfFreighters = 3

                }
                else {
                    freighterCurrentLevel = 5
                    freighterBodyType = "FREIGHTER_5"
                    reqNumOfFreighters = 2
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
                harvesterCurrentLevel
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
    RoomReservationManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
        set controllerPositionProps(pos) {
            this.data.controllerPositionProps = pos
        }

        get controllerPosition() {
            const posProps = this.data.controllerPositionProps
            return new RoomPosition(posProps.x, posProps.y, posProps.roomName)
        }

        run() {
            const role = "reserver"
            const ownerRoomEnergyCapacity = this.ownerRoom.energyCapacityAvailable
            let currentLevel, bodyType

            this.cleanRoleDeadProcesses(role)
            if (ownerRoomEnergyCapacity < energyCapacityLevels.LEVEL_4) {
                currentLevel = 1
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "CLAIMER_3"
            }
            else {
                currentLevel = 2
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "CLAIMER_4"
            }

            this.resolveRoleProcessesQuantity(
                role,
                1,
                bodyType,
                25,
                [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_CLOSE_TO_TARGET.name,
                        {range: 1, targetPosParams: this.controllerPosition}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.RESERVE_ROOM_CONTROLLER.name,
                        {roomName: this.controllerPosition.roomName}
                    )
                ],
                this.controllerPosition.roomName,
                currentLevel
            )
        }
    }
}