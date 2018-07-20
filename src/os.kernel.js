'use strict'

const OSScheduler = require("os.scheduler")
const ProcessState = require("os.processState")
const init =  require("process.init")

// process modules
const energy = require("process.energy")
const empire = require("process.empire")
const rooms = require("process.rooms")
const events = require("process.events")
const creeps = require("process.creeps");


module.exports = class OSKernel {
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

        this.availableProcessClasses = {}
        this.availableProcessClasses.EmpireManager = empire.EmpireManager
        this.availableProcessClasses.FlagEventListener = events.FlagEventListener
        this.availableProcessClasses.SourceHarvestManager = energy.SourceHarvestManager
        this.availableProcessClasses.Init = init.Init
        this.availableProcessClasses.CreepManager = creeps.CreepManager
        this.availableProcessClasses.OwnedRoomManager = rooms.OwnedRoomManager
        this.availableProcessClasses.ControllerUpgradeManager = rooms.ControllerUpgradeManager
    }

    _loadProcessTableFromMemory() {
        // console.log(`DEBUG Loading processes from memory`)
        this.rawProcessTable.forEach(rawProcess => {
            let processClass
            try{
                processClass = this.availableProcessClasses[rawProcess[2]]
                const pid = rawProcess[0]
                const parentPid = rawProcess[1]
                const label = rawProcess[3]
                const priority = rawProcess[4]
                const state = rawProcess[5]
                this.processTable[pid] = new processClass(pid, parentPid, label, priority, state)
            }
            catch (e) {
                console.log(`Failed to load process ${JSON.stringify(rawProcess)} due to ${e.stack}.`)
            }
        })
    }

    _saveProcessTableToMemory() {
        // console.log(`DEBUG Saving processes from memory`)
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
                    // console.log(`DEBUG Saved process with pid ${pid} to memory: \n`
                    //     + ` ${JSON.stringify({
                    //         parentPid: parentPid,
                    //         processLabel: label,
                    //         processClassName: processClassName
                    //     })} to process table`)
                }
            }
        )
    }

    getProcessByLabel(label) {
        return _.find(Object.values(this.processTable), proc => proc.label === label)
    }

    init() {
        // console.log(`DEBUG Initializing kernel`)
        this._loadProcessTableFromMemory()
        // able to add jobs after setting process table on scheduler
        this.scheduler.setProcessTable(this.processTable)

        // init should be the first process to run
        if (Object.keys(this.processTable).length === 0){
            this.scheduler.launchProcess(init.Init, "init", null, 0)
        }
    }

    run() {
        console.log(`DEBUG at beginning of kernel run`)
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