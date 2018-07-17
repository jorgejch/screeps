'use strict'
import processClassMap from "os.processClassMap"

export class OSScheduler {
    _getFreePid() {
        let lastPid = 0

        if (Object.keys(this.processTable).length > 0){
            lastPid = Object.keys(this.processTable).sort((a, b) => b - a)[0]
        }
        for (let candidate = 1; candidate <= lastPid + 1; candidate++) {
            if (!this.processTable[candidate]) {
                return candidate
            }
        }
    }

    static getProcessClass(className){
        return processClassMap[className]
    }

    setProcessTable(table) {
        this.processTable = table
    }

    init() {
        this.orderedPids = Object.keys(this.processTable).sort((a, b) => a.priority - b.priority)
    }

    nextProcessToRun() {
        const procPid =this.orderedPids.shift()
        return this.processTable[procPid]
    }

    launchProcess(processClass, parentPid, label) {
        const pid = this._getFreePid()
        this.processTable[pid] = new processClass(pid, parentPid, label)
    }

    getProcessByLabel(label) {
        return _.find(Object.keys(this.processTable), pid => this.processTable[pid].label === label)
    }
}