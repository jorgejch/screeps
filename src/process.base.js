const ProcessState = require("os.processState")

module.exports = class BaseProcess {
    constructor(pid, parentPid, label, priority, state) {
        this.pid = pid
        this.parentPid = parentPid
        this.label = label
        this.priority = priority
        this.state = state

        if (!Memory.processesMemory[this.label]){
            Memory.processesMemory[this.label]= {}
        }
        this.data = Memory.processesMemory[this.label]
    }

    die(){
        this.state = ProcessState.DEAD
        delete Memory.processesMemory[this.label]
    }

    run() {
        throw `Must be implemented downstream.`
    }
}
