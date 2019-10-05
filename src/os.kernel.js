'use strict'

const OSScheduler = require("./os.scheduler")
const ProcessState = require("./os.processState")
const init =  require("./process.init")

// process modules
const energy = require("./process.energy")
const empire = require("./process.empire")
const room = require("./process.room")
const events = require("./process.events")
const creeps = require("./process.creeps");
const construction = require("./process.activity.construct")
const upgrade = require("./process.activity.upgrade")
const load = require("./process.activity.load")


module.exports = class OSKernel {
    constructor() {
        this.scheduler = new OSScheduler()

        // raw processes table is written at the end of the kernel run and read at the beginning
        if (!Memory.rawProcessTable) {
            Memory.rawProcessTable = []
        }
        this.rawProcessTable = Memory.rawProcessTable

        // raw process table is read into
        this.processTable = {}

        // container of all processes memory
        if (!Memory.processesMemory) {
            Memory.processesMemory = {}
        }

        // for now all used process classes must be registered
        this.availableProcessClasses = {}
        this.availableProcessClasses.EmpireManager = empire.EmpireManager
        this.availableProcessClasses.FlagEventListener = events.FlagEventListener
        this.availableProcessClasses.SourceHarvestManager = energy.SourceHarvestManager
        this.availableProcessClasses.Init = init.Init
        this.availableProcessClasses.CreepManager = creeps.CreepManager
        this.availableProcessClasses.OwnedRoomManager = room.OwnedRoomManager
        this.availableProcessClasses.ControllerUpgradeManager = upgrade.ControllerUpgradeManager
        this.availableProcessClasses.ConstructionManager = construction.ConstructionManager
        this.availableProcessClasses.TowerManager = room.TowerManager
        this.availableProcessClasses.LoadEnergyManager = load.LoadEnergyManager
        this.availableProcessClasses.RoomReservationManager = energy.RoomReservationManager
        this.availableProcessClasses.GuardManager = room.GuardManager
        this.availableProcessClasses.RepairManager = room.RepairManager
        this.availableProcessClasses.ConquestManager = empire.ConquestManager
    }

    _loadProcessTableFromMemory() {
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
        this._loadProcessTableFromMemory()
        // able to add jobs after setting process table on scheduler
        this.scheduler.setProcessTable(this.processTable)

        // init should be the first process to run
        if (Object.keys(this.processTable).length === 0){
            this.scheduler.launchProcess(init.Init, "init", null, 0)
        }
    }

    run() {
        // order processes to run
        this.scheduler.init()

        let proc
        while (proc = this.scheduler.nextProcessToRun()) {
            try {
                // console.log(`DEBUG Running process ${proc.label}.`)
                proc.run()
            }
            catch (ex){
                console.log(`Failed to run process ${proc.label} due to: ${ex.stack}`)
            }
        }

        this._saveProcessTableToMemory()

    }
}