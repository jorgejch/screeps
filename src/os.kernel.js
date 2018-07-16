'use strict'

import {OSScheduler} from "os.scheduler"
import ProcessState from "os.processState"

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

    _loadProcessTableFromMemory() {
        console.log(`DEBUG 2: Loading process table from memory.`)
        this.rawProcessTable.forEach(rawProcess => {
            const processClass = require(rawProcess[2])
            const pid = rawProcess[0]
            const parentPid = rawProcess[1]
            const label = rawProcess[3]
            this.processTable[pid] = evalnew processClass(pid, parentPid, label)
            console.log(`DEBUG 3: Loaded process with pid ${pid} from memory: \n`
                + ` ${JSON.stringify({
                    parentPid: parentPid,
                    processLabel: label,
                    processClass: processClass
                })} to process table`)
        })
    }

    _saveProcessTableToMemory() {
        console.log(`DEBUG 4: Saving processes table to memory. Process table: ${JSON.stringify(this.processTable)}`)
        Object.keys(this.processTable).forEach(pid => {
                const process = this.processTable[pid]
                if (process.state !== ProcessState.DEAD) {

                    console.log(`DEBUG X1: ${process.constructor.name}`)
                    const processClassName = process.constructor.name
                    const parentPid = process.parentPid
                    const label = process.label
                    this.rawProcessTable.push([pid, parentPid , processClassName , label])
                    console.log(`DEBUG 5: Saved process with pid ${pid} to memory: \n`
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
        console.log(`DEBUG 1: Initializing kernel.`)
        this._loadProcessTableFromMemory()
        this.scheduler.setProcessTable(this.processTable)
        this.scheduler.init()
    }

    run() {
        let proc
        while (proc = this.scheduler.nextProcessToRun()) {
            try {
                proc.run()
            }
            catch (ex){
                throw `Failed to run process ${proc.label} due to: ${ex.stack}`
            }
        }

        this._saveProcessTableToMemory()
    }

}