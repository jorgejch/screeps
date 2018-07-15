export class BaseProcess {
    constructor(pid, parentPid) {
        this.pid = pid
        this.parentPid = parentPid
        this.state = "DEAD"
        this.priority = 99
    }

    run() {
        throw `Must be implemented downstream.`
    }

    loadProcessMemory() {
        throw `Must be implemented downstream.`
    }
}
