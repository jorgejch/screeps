import {BaseProcess} from "./process.base";
import ProcessState from "./os.processState";

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

                this.data.harvestersProcesses = this.data.harvestersProcesses
                    .filter(label => Kernel.scheduler.getProcessByLabel(label))

                const ownerManager = Kernel.scheduler.getProcessByLabel(`${ownerRoom}_manager`)
            }

        }

        this.state = ProcessState.WAIT
    }
}