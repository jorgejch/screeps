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

                const roomEnergyCapacity = this.ownerRoom.energyCapacity
                let reqNumOfCreeps, bodyType, priority, initialTaskTicketQueue, currentLevel


                if (emergency || roomEnergyCapacity < energyCapacityLevels.LEVEL_2) {
                    currentLevel = 1  // to track when level goes up
                    // there should be 3 basic workers harvesting at this level
                    reqNumOfCreeps = 3
                    bodyType = "BASIC_WORKER_1"
                    priority = 0
                    initialTaskTicketQueue = [
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
                        // no old harvester shall be made, a new age has arrived
                        this.harvestersProcLabels.forEach(proc => proc.die())
                    }

                    reqNumOfCreeps = 1
                    bodyType = "STATIONARY_WORKER_2"
                    priority = 1
                    initialTaskTicketQueue = [
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
                        // no old harvester shall be made, a new age has arrived
                        this.harvestersProcLabels.forEach(proc => proc.die())
                    }
                    reqNumOfCreeps = 1
                    bodyType = "STATIONARY_WORKER_3"
                    priority = 1
                    initialTaskTicketQueue = [
                        new tasks.TaskTicket(
                            tasks.tasks.GO_TO_HARVESTING_POSITION.name, {sourceId: this.sourceId}
                        ),
                        new tasks.TaskTicket(
                            tasks.tasks.HARVEST_SOURCE.name, {sourceId: this.sourceId}
                        ),
                    ]
                }

                while (this.harvestersProcLabels.length < reqNumOfCreeps) {
                    const label = `harvester_creep_manager_${this.harvesterCounter}_of_${this.source.room.name}`
                        + `_from_${this.ownerRoomName}`
                    try {
                        const process = Kernel.scheduler.launchProcess(
                            Kernel.availableProcessClasses.CreepManager,
                            label,
                            this.pid
                        )
                        process.creepName = `Harvester${this.harvesterCounter}Of${this.source.room.name}`
                            + `From${this.ownerRoomName}`
                        process.creepType = bodyType
                        process.ownerRoomName = this.ownerRoomName
                        process.spawningPriority = priority
                        process.initialTaskTicketQueue = initialTaskTicketQueue
                        this.incrementHarvesterCounter()
                        this.harvestersProcLabels.push(process.label)
                        this.lastLevel = currentLevel
                    }
                    catch (e) {
                        console.log(`Failed to lunch harvester process due to: ${e.stack}`)
                    }
                }
            }
            this.state = processStates.WAIT
        }
    }
}