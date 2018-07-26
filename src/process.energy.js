const BaseProcess = require("process.base")
const processStates = require("os.processState")
const creeps = require("process.creeps")
const tasks = require("creep.tasks")
const energyCapacityLevels = require("util.energyCapacityLevels")
const processUtils = require("util.process")

module.exports = {
    SourceHarvestManager: class extends BaseProcess {
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        get ownerRoom() {
            return Game.rooms[this.ownerRoomName]
        }

        set sourceId(sourceId) {
            this.data.sourceId = sourceId
        }

        get sourceId() {
            return this.data.sourceId
        }

        get source() {
            return Game.getObjectById(this.sourceId)
        }

        set harvestersProcLabels(labelArray) {
            this.data.harvestersProcLabels = labelArray
        }

        get harvestersProcLabels() {
            if (!this.data.harvestersProcLabels) {
                this.data.harvestersProcLabels = []
            }
            return this.data.harvestersProcLabels
        }

        get harvesterCounter() {
            if (!this.data.harvesterCounter) {
                this.data.harvesterCounter = 0
            }
            return this.data.harvesterCounter
        }

        incrementHarvesterCounter() {
            this.data.harvesterCounter += 1
        }

        set freightersProcLabels(labelArray) {
            this.data.freightersProcLabels = labelArray
        }

        get freightersProcLabels() {
            if (!this.data.freightersProcLabels) {
                this.data.freightersProcLabels = []
            }
            return this.data.freightersProcLabels
        }

        get freighterCounter() {
            if (!this.data.freighterCounter) {
                this.data.freighterCounter = 0
            }
            return this.data.freighterCounter
        }

        incrementFreighterCounter() {
            this.data.freighterCounter += 1
        }

        get lastLevel(){
            if (!this.data.lastLevel){
                this.data.lastLevel = 0
            }
            return this.data.lastLevel
        }

        set lastLevel(level){
            this.data.lastLevel = level
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

                    if (this.lastLevel < currentLevel){
                        console.log(`Next harvester order placed by ${this.label} will be at new level ${currentLevel}.`)
                        // no old harvester shall be made, a new age has arrived
                        this.harvestersProcLabels.forEach(
                            procLabel => Kernel.getProcessByLabel(procLabel).dieAfterCreep()
                        )
                    }

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

                    if (this.lastLevel < currentLevel){
                        console.log(`Next harvester order for ${this.label} will be at new level ${currentLevel}.`)
                        // no old harvester shall be made, a new age has arrived
                        this.harvestersProcLabels.forEach(
                            procLabel => Kernel.getProcessByLabel(procLabel).dieAfterCreep()
                        )
                    }
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