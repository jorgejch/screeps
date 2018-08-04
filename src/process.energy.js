const BaseProcess = require("process.base")
const tasks = require("creep.tasks")
const energyCapacityLevels = require("util.energyCapacityLevels")
const mixins = require("process.mixins")
const generalUtils = require("util.general")
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
            else if (roomEnergyCapacity < energyCapacityLevels.LEVEL_3) {
                harvesterCurrentLevel = 2
                this.resolveLevelForRole(harvesterRole, harvesterCurrentLevel)
                // at this level creeps source from the resource pile or container
                reqNumOfFreighters = 0
                reqNumOfHarvesters = 1
                harvesterBodyType = "STATIONARY_WORKER_2"
                harvesterPriority = 2
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                ]
            }
            else if (processUtils.checkStorageExists(this.ownerRoom)) {
                harvesterCurrentLevel = 3
                this.resolveLevelForRole(freighterRole, harvesterCurrentLevel)
                this.resolveLevelForRole(harvesterRole, harvesterCurrentLevel)
                reqNumOfFreighters = this.isLocal() ? 1 : 3
                freighterBodyType = "FREIGHTER_3"
                freighterPriority = 3
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
                reqNumOfHarvesters = 1
                harvesterBodyType = "STATIONARY_WORKER_3"
                harvesterPriority = 2
                harvesterInitialTaskTicketQueue = [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                    ),
                ]
            }
            else{
                throw `Could not resolve source harvest.`
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
                harvesterCurrentLevel
            )
        }
    },
    RoomReservationManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
        set controllerPositionProps(pos){
            this.data.controllerPositionProps = pos
        }
        get controllerPosition(){
            const posProps = this.data.controllerPositionProps
            return new RoomPosition(posProps.x, posProps.y, posProps.roomName)
        }

        run(){
            const role = "reserver"
            const ownerRoomEnergyCapacity = this.ownerRoom.energyCapacityAvailable
            let currentLevel, bodyType

            this.cleanRoleDeadProcesses(role)
            if (ownerRoomEnergyCapacity < energyCapacityLevels.LEVEL_4){
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
                15,
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