import {BaseProcess} from "./process.base";
import ProcessState from "./os.processState";
import {CreepManager} from "./process.creeps";
import CreepTypes from "creep.types"
import tasks, {TaskTicket} from "./creep.tasks";

export class SourceHarvestManager extends BaseProcess {
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

    isLocal() {
        return this.ownerRoomName === this.source.room.name
    }

    run() {
        if (this.isLocal()) {
            if (this.source.room.controller.level === 1) {
                if (!this.data.harvestersProcsLabels) {
                    this.data.harvestersProcsLabels = []
                }

                this.data.harvestersProcsLabels = this.data.harvestersProcsLabels
                    .filter(label => Kernel.scheduler.getProcessByLabel(label))
                
                const ownerManagerLabel = `${this.ownerRoomName}_manager`
                const ownerManager = Kernel.scheduler.getProcessByLabel(ownerManagerLabel)

                if (!ownerManager){
                    throw `${ownerManagerLabel} process does not exist.`
                }
                
                // there should be 3 basic workers harvesting at this level
                while (this.data.harvestersProcsLabels.length < 3){
                    const label = `creep_manager_${Game.time}`
                    const process = Kernel.launchProcess(CreepManager, label, this.pid)
                    process.creepType = CreepTypes.BASIC_WORKER_1
                    process.taskTicketQueue = [
                        new TaskTicket(
                            tasks.CYCLIC_HARVEST_SOURCE.name, {sourceId: this.sourceId}
                        ),
                        new TaskTicket(
                            tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name, {roomName: this.ownerRoomName}
                        )
                    ]
                }

            }

        }

        this.state = ProcessState.WAIT
    }
}