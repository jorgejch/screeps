const BaseProcess = require("process.base")
const processStates = require("os.processState")
const creeps = require("process.creeps")
const tasks = require("creep.tasks")
const energyCapacityLevels = require("util.energyCapacityLevels")

module.exports = {
    SourceHarvestManager: class extends BaseProcess {
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        get ownerRoom(){
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

                if (emergency || this.ownerRoom.energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                    // filter out dead processes
                    this.harvestersProcLabels = this.harvestersProcLabels
                        .filter(label => Kernel.getProcessByLabel(label))


                    // there should be 3 basic workers harvesting at this level
                    while (this.harvestersProcLabels.length < 3) {
                        const label = `harvester_creep_manager_${this.harvesterCounter}_of_${this.source.room.name}`
                            +`_from_${this.ownerRoomName}`

                        try {
                            const process = Kernel.scheduler.launchProcess(
                                Kernel.availableProcessClasses.CreepManager,
                                label,
                                this.pid
                            )
                            process.creepName = `BasicHarvester${this.harvesterCounter}Of${this.source.room.name}` + ``
                            process.creepType = "BASIC_WORKER_1"
                            process.ownerRoomName = this.ownerRoomName
                            process.spawningPriority = 0
                            process.initialTaskTicketQueue = [
                                new tasks.TaskTicket(
                                    tasks.tasks.CYCLIC_HARVEST_SOURCE.name, {sourceId: this.sourceId}
                                ),
                                new tasks.TaskTicket(
                                    tasks.tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name,
                                    {roomName: this.ownerRoomName}
                                )
                            ]
                            this.incrementHarvesterCounter()
                            this.harvestersProcLabels.push(process.label)
                        }
                        catch (e) {
                            console.log(`Failed to lunch harvester process due to: ${e.stack}`)
                        }
                    }
                }
            }
            this.state = processStates.WAIT
        }
    }
}