import ProcessStatus from "os.processState"

export class BaseProcess {
    constructor(pid, parentPid, label) {
        this.pid = pid
        this.parentPid = parentPid
        this.state = ProcessStatus.WAIT
        this.priority = 99
        this.label = label

        if (!pid in Memory.processesMemory){
            Memory.processesMemory[pid]= {}
        }
        this.data = Memory.processesMemory[pid]
    }

    run() {
        throw `Must be implemented downstream.`
    }
}
