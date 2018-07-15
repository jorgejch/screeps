'use strict'


export class Kernel {
    constructor(){
        this.processTable = {}

        if (!Memory.rawProcessTable){
           Memory.rawProcessTable = []
        }
        this.rawProcessTable = Memory.rawProcessTable
    }

    _loadProcessTableFromMemory() {
        this.rawProcessTable.forEach(rawProcess => {
            const processClass = rawProcess[2]
            const pid = rawProcess[0]
            const parentPid = rawProcess[1]
            this.processTable[pid] = new processClass(pid, parentPid)
        })
    }

    _saveProcessTableToMemory() {
        Object.keys(this.processTable).forEach(pid => {
                const process = this.processTable[pid]
                if (process.state !== "DEAD") {
                    this.rawProcessTable.push([pid, process.parentPid, process.constructor.name])
                }
            }
        )
    }

    _getFreePid(){
        const lastPid = Math.max(...Object.keys(this.processTable))
        let candidate
        for (candidate = 0; candidate <= lastPid + 1; candidate++){
            if (!this.processTable[candidate]){
                return candidate
            }
        }
    }

    run(){
        this._loadProcessTableFromMemory()
        const scheduler = new Scheduler(this.processTable)

        let proc
        while(proc = scheduler.nextProcessToRun()){
            proc.run()
        }

        this._saveProcessTableToMemory()
    }

    addProcess(process){
        const pid = this._getFreePid()
        this.processTable[pid] = process
    }
}