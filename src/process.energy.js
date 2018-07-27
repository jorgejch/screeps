const BaseProcess = require("process.base")
const processStates = require("os.processState")
const creeps = require("process.creeps")
const tasks = require("creep.tasks")
const energyCapacityLevels = require("util.energyCapacityLevels")
const processUtils = require("util.process")
const mixins = require("process.mixins")

module.exports = {
    SourceHarvestManager: class extends mixins.ActivityDirector(BaseProcess) {
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
            if (this.isLocal()) {
                if (!this.source) {
                    throw `Invalid source id ${this.sourceId}`
                }

                // TODO: no harvester + no Feeder + incomplete spawns and exts === emergency
                const emergency = this.ownerRoom.find(FIND_MY_CREEPS).length === 0
                    && this.ownerRoom.energyAvailable < this.ownerRoom.energyCapacityAvailable

                // filter out dead processes
                this.harvestersProcLabels = this.harvestersProcLabels
                    .filter(label => Kernel.getProcessByLabel(label))

                const roomEnergyCapacity = this.ownerRoom.energyCapacityAvailable
                let currentLevel,
                    reqNumOfHarvesters,
                    harvesterBodyType,
                    harvesterPriority,
                    reqNumOfFreighters,
                    harvesterInitialTaskTicketQueue,
                    freighterBodyType,
                    freighterPriority,
                    freighterInitialTaskTicketQueue

                if (emergency || roomEnergyCapacity < energyCapacityLevels.LEVEL_2) {
                    currentLevel = 1  // to track when level goes up
                    // basic harvesters feed
                    reqNumOfFreighters = 0
                    // there should be 3 basic workers harvesting at this level
                    reqNumOfHarvesters =3
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
                    currentLevel = 2
                    this.resolveLevelForRole("freighter", currentLevel)
                    this.resolveLevelForRole("harvester", currentLevel)
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
                else  {
                    currentLevel = 3

                    this.resolveLevelForRole("freighter", currentLevel)
                    this.resolveLevelForRole("harvester", currentLevel)
                    reqNumOfFreighters = 1
                    freighterBodyType = "FREIGHTER_3"
                    freighterPriority = 3
                    freighterInitialTaskTicketQueue = [
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_PICKUP_DROPPED_RESOURCE.name, {}
                        ),
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_LEECH_FROM_SOURCE_CONTAINER.name, {sourceId: this.sourceId}
                        ),
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_TRANSFER_ALL_RESOURCES_TO_ROOM_STORAGE.name,
                            {roomName: this.room.name}
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

                while (this.harvestersProcLabels.length < reqNumOfHarvesters) {
                    const label = `harvester_creep_manager_${this.harvesterCounter}_of_${this.sourceId}`
                        + `_from_${this.ownerRoomName}`
                    try {
                        const process = Kernel.scheduler.launchProcess(
                            Kernel.availableProcessClasses.CreepManager,
                            label,
                            this.pid
                        )
                        process.creepName = `Harvester${this.harvesterCounter}Of${this.sourceId}`
                            + `From${this.ownerRoomName}`
                        process.creepType = harvesterBodyType
                        process.ownerRoomName = this.ownerRoomName
                        process.spawningPriority = harvesterPriority
                        process.initialTaskTicketQueue = harvesterInitialTaskTicketQueue
                        this.incrementHarvesterCounter()
                        this.harvestersProcLabels.push(process.label)
                        this.lastLevel = currentLevel
                    }
                    catch (e) {
                        console.log(`Failed to lunch harvester process due to: ${e.stack}`)
                    }
                }

                while (this.freightersProcLabels.length < reqNumOfFreighters) {
                    const label = `freighter_creep_manager_${this.freighterCounter}_of_${this.sourceId}`
                        + `_from_${this.ownerRoomName}`
                    try {
                        const process = Kernel.scheduler.launchProcess(
                            Kernel.availableProcessClasses.CreepManager,
                            label,
                            this.pid
                        )
                        process.creepName = `Freighter${this.freighterCounter}Of${this.sourceId}`
                            + `From${this.ownerRoomName}`
                        process.creepType = freighterBodyType
                        process.ownerRoomName = this.ownerRoomName
                        process.spawningPriority = freighterPriority
                        process.initialTaskTicketQueue = freighterInitialTaskTicketQueue
                        this.incrementFreighterCounter()
                        this.freightersProcLabels.push(process.label)
                        this.lastLevel = currentLevel
                    }
                    catch (e) {
                        console.log(`Failed to lunch harvester process due to: ${e.stack}`)
                    }
                }
            }
        }
    }
}