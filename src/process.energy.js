const BaseProcess = require("process.base")
const processStates = require("os.processState")
const creeps = require("process.creeps")
const tasks = require("creep.tasks")

module.exports = {
    SourceHarvestManager: class extends BaseProcess {
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
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

        isLocal() {
            return this.ownerRoomName === this.source.room.name
        }

        run() {
            if (this.isLocal()) {
                if (!this.source) {
                    throw `Invalid source id ${this.sourceId}`
                }

                if (this.source.room.controller.level === 1) {
                    // filter out dead processes
                    this.harvestersProcLabels = this.harvestersProcLabels
                        .filter(label => Kernel.getProcessByLabel(label))


                    // there should be 3 basic workers harvesting at this level
                    while (this.harvestersProcLabels.length < 3) {
                        const label = `creep_manager_${Game.time}_${this.harvestersProcLabels.length + 1}`

                        try {
                            const process = Kernel.scheduler.launchProcess(
                                Kernel.availableProcessClasses.CreepManager,
                                label,
                                this.pid
                            )
                            process.creepName = `BasicHarvester${Game.time}_${this.harvestersProcLabels.length + 1}`
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