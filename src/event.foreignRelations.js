'use strict'

const tasks = require("./creep.tasks");
const processUtils = require("./util.process");
module.exports = {
    sendScoutToFlagPosition: (flag) => {
        const visual = new RoomVisual(flag.pos.roomName)
        const targetRoomName = flag.pos.roomName
        const ownerRoomName = flag.name

        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }

        const SCOUT_MANAGER_PROC_LABEL = `scout_manager_of_${targetRoomName}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(SCOUT_MANAGER_PROC_LABEL)) {
            visual.text(`Process from ${ownerRoomName} to scout ${targetRoomName} already exists.`, flag.pos)
            flag.remove()
            return
        }
        console.log(`DEBUG Creating process ${SCOUT_MANAGER_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.CreepManager,
                SCOUT_MANAGER_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.creepName = `ScoutOf${targetRoomName}From${ownerRoomName}Demanded`
            process.creepType = "SCOUT_1"
            process.initialTaskTicketQueue = [new tasks.TaskTicket(
                tasks.tasks.GO_CLOSE_TO_TARGET.name,
                {range: 1, targetPosParams: flag.pos}
            )]
            process.ownerRoomName = ownerRoomName
            process.spawningPriority = 2
            process.dieAfterCreep = true
        }
        catch (ex) {
            console.log(`Failed to launch process ${SCOUT_MANAGER_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    },
    scoutRoomUnderFlag: (flag) => {
        const visual = new RoomVisual(flag.pos.roomName)
        const targetRoomName = flag.pos.roomName
        const ownerRoomName = flag.name

        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }

        const SCOUT_DIRECTOR_PROC_LABEL = `scout_director_of_${targetRoomName}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(SCOUT_DIRECTOR_PROC_LABEL)) {
            visual.text(`Process from ${ownerRoomName} to guard ${targetRoomName} already exists.`, flag.pos)
            flag.remove()
            return
        }

        try {
            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.ScoutDirector,
                SCOUT_DIRECTOR_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.ownerRoomName = ownerRoomName
            process.targetRoomName = targetRoomName
            process.targetPos = flag.pos
            flag.remove()
        } catch (ex) {
            console.log(`Failed to launch process ${SCOUT_DIRECTOR_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    },
    guardRoomUnderFlag: (flag) => {
        const visual = new RoomVisual(flag.pos.roomName)
        const targetRoomName = flag.pos.roomName
        const ownerRoomName = flag.name

        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }

        const GUARD_DIRECTOR_PROC_LABEL = `guard_director_of_${targetRoomName}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(GUARD_DIRECTOR_PROC_LABEL)) {
            visual.text(`Process from ${ownerRoomName} to guard ${targetRoomName} already exists.`, flag.pos)
            flag.remove()
            return
        }
        try {
            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.GuardDirector,
                GUARD_DIRECTOR_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.ownerRoomName = ownerRoomName
            process.targetRoomName = targetRoomName
            process.targetPos = flag.pos
            flag.remove()
        }
        catch (ex) {
            console.log(`Failed to launch process ${GUARD_DIRECTOR_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }

    },
    claimRoomUnderFlag: (flag) => {
        const visual = new RoomVisual(flag.pos.roomName)
        const ownerRoomName = flag.name
        const targetRoomName = flag.pos.roomName

        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Ownner Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }

        const CONQUISTADOR_PROC_LABEL = `conquest_director_of_${targetRoomName}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(CONQUISTADOR_PROC_LABEL)) {
            flag.remove()
            visual.text(`Process from ${ownerRoomName} to claim ${targetRoomName} already exists.`, flag.pos)
            return
        }
        console.log(`DEBUG Creating process ${CONQUISTADOR_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.ConquestDirector,
                CONQUISTADOR_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.ownerRoomName = ownerRoomName
            process.targetRoomName = targetRoomName
        }
        catch (ex) {
            console.log(`Failed to launch process ${CONQUISTADOR_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }

    },
    supplyEnergyToRoom: (flag) => {
        const visual = new RoomVisual(flag.pos.roomName)
        const ownerRoomName = flag.name
        const targetRoomName = flag.pos.roomName

        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Owner Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }


        const FEEDER_PROC_LABEL = `energy_supply_director_of_room_${targetRoomName}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(FEEDER_PROC_LABEL)) {
            flag.remove()
            visual.text(`Process from ${ownerRoomName} to claim ${targetRoomName} already exists.`, flag.pos)
            return
        }
        console.log(`DEBUG Creating process ${FEEDER_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.EnergySupplyDirector,
                FEEDER_PROC_LABEL
            )
            visual.text(`Launched process ${process.label}.`, flag.pos)
            process.ownerRoomName = ownerRoomName
            process.targetRoomName = targetRoomName
        }
        catch (ex) {
            console.log(`Failed to launch process ${FEEDER_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    }
}