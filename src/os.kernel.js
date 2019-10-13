'use strict'

const OSScheduler = require("./os.scheduler")
const ProcessState = require("./os.processState")

// process modules
const room = require("./process.room")
const empire = require("./process.empire")
const creeps = require("./process.creep");
const load = require("./process.director.supply")
const defense = require("./process.director.defense")
const harvest = require("./process.director.harvest")
const conquest = require("./process.director.conquest")
const construct = require("./process.director.construction")
const maintenance = require("./process.director.maintenance")

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
        this.availableProcessClasses.FlagEventListener = empire.FlagEventListener
        this.availableProcessClasses.EmpireRuler = empire.EmpireRuler
        this.availableProcessClasses.CreepManager = creeps.CreepManager
        this.availableProcessClasses.OwnedRoomGovernor = room.OwnedRoomGovernor
        this.availableProcessClasses.TowerOperator = room.TowerOperator
        this.availableProcessClasses.ConquestDirector = conquest.ConquestDirector
        this.availableProcessClasses.HarvestDirector = harvest.HarvestDirector
        this.availableProcessClasses.ReserveRoomDirector = conquest.ReserveRoomDirector
        this.availableProcessClasses.ControllerUpgradeDirector = maintenance.ControllerUpgradeDirector
        this.availableProcessClasses.RepairDirector = maintenance.RepairDirector
        this.availableProcessClasses.ConstructionDirector = construct.ConstructionDirector
        this.availableProcessClasses.EnergySupplyDirector = load.EnergySupplyDirector
        this.availableProcessClasses.GuardDirector = defense.GuardDirector
        this.availableProcessClasses.ScoutDirector = defense.ScoutDirector
    }

    _loadProcessTableFromMemory() {
        this.rawProcessTable.forEach(rawProcess => {
            let processClass
            try {
                processClass = this.availableProcessClasses[rawProcess[2]]
                const pid = rawProcess[0]
                const parentPid = rawProcess[1]
                const label = rawProcess[3]
                const priority = rawProcess[4]
                const state = rawProcess[5]
                this.processTable[pid] = new processClass(pid, parentPid, label, priority, state)
            } catch (e) {
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
                    this.rawProcessTable.push([pid, parentPid, processClassName, label, priority, state])
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

        // the empire_ruler process should be the first process to run
        if (Object.keys(this.processTable).length === 0) {
            const EMPIRE_MANAGER_PROCESS_LABEL = "empire_ruler"
            if (!this.getProcessByLabel(EMPIRE_MANAGER_PROCESS_LABEL)) {
                console.log(`Creating process ${EMPIRE_MANAGER_PROCESS_LABEL}`)
                this.scheduler.launchProcess(
                    this.availableProcessClasses.EmpireRuler,
                    EMPIRE_MANAGER_PROCESS_LABEL,
                    null,
                    1
                )
            }
        }
    }

    run() {
        // order processes to run
        this.scheduler.init()

        let proc
        while (proc = this.scheduler.nextProcessToRun()) {
            try {
                proc.run()
            } catch (ex) {
                console.log(`Failed to run process ${proc.label} due to: ${ex.stack}`)
            }
        }

        this._saveProcessTableToMemory()
    }
}