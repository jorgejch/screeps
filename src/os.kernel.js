'use strict'

import {OSScheduler} from "os.scheduler"
import ProcessState from "os.processState"
import {Init} from "process.init";

export class OSKernel {
    constructor() {
        this.scheduler = new OSScheduler()
        this.processTable = {}

        // init raw process tables
        if (!Memory.rawProcessTable) {
            Memory.rawProcessTable = []
        }
        this.rawProcessTable = Memory.rawProcessTable

        // init processes memory
        if (!Memory.processesMemory) {
            Memory.processesMemory = {}
        }
    }

    getProcessData(process){
        // not static so it can be accessed only of procs mem init.
        return Memory.processesMemory[process.label]
    }

    _loadProcessTableFromMemory() {
        console.log(`DEBUG1: Loading processes from memory`)
        this.rawProcessTable.forEach(rawProcess => {
            const processClass = OSScheduler.getProcessClass(rawProcess[2])
            const pid = rawProcess[0]
            const parentPid = rawProcess[1]
            const label = rawProcess[3]
            const priority = rawProcess[4]
            const state = rawProcess[5]
            this.processTable[pid] = new processClass(pid, parentPid, label, priority, state)
            console.log(`DEBUG2: Loaded process with pid ${pid} from memory: \n`
                + ` ${JSON.stringify({
                    parentPid: parentPid,
                    processLabel: label,
                    processClass: processClass
                })} to process table`)
        })
    }

    _saveProcessTableToMemory() {
        console.log(`DEBUG Saving processes from memory`)
        this.rawProcessTable.length = 0  // reset
        Object.keys(this.processTable).forEach(pid => {
                const process = this.processTable[pid]
                if (process.state !== ProcessState.DEAD) {

                    const processClassName = process.constructor.name
                    const parentPid = process.parentPid
                    const label = process.label
                    const priority = process.priority
                    const state = process.state
                    this.rawProcessTable.push([pid, parentPid , processClassName , label, priority, state])
                    console.log(`DEBUG: Saved process with pid ${pid} to memory: \n`
                        + ` ${JSON.stringify({
                            parentPid: parentPid,
                            processLabel: label,
                            processClassName: processClassName
                        })} to process table`)
                }
            }
        )
    }

    init() {
        // console.log(`DEBUG1 Initializing kernel`)
        this._loadProcessTableFromMemory()
        // able to add jobs after setting process table on scheduler
        this.scheduler.setProcessTable(this.processTable)

        // init should be the first process to run
        if (Object.keys(this.processTable).length === 0){
            this.scheduler.launchProcess(Init, "init", null, 0)
        }
    }

    run() {
        console.log(`DEBUG at beggining  kernel run`)
        // order processes to run
        this.scheduler.init()

        let proc
        while (proc = this.scheduler.nextProcessToRun()) {
            try {
                console.log(`DEBUG Running process ${proc.label}.`)
                proc.run()
            }
            catch (ex){
                console.log(`Failed to run process ${proc.label} due to: ${ex.stack}`)
            }
        }

        this._saveProcessTableToMemory()

        console.log(`DEBUG at end of kernel run`)
    }

}