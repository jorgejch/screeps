'use strict'
const BaseProcess = require("process.base")
const empire = require("process.empire")
const energy = require("process.energy")
const events = require("process.events")

module.exports = {

    Init: class extends BaseProcess {
        run() {
            // the event manager process must always exist
            const FLAG_EVENT_LISTENER_PROCESS_LABEL = "flag_event_listener"
            if (!Kernel.getProcessByLabel(FLAG_EVENT_LISTENER_PROCESS_LABEL)) {
                console.log(`DEBUG Creating process ${FLAG_EVENT_LISTENER_PROCESS_LABEL}`)
                Kernel.scheduler.launchProcess(
                    Kernel.availableProcessClasses.FlagEventListener,
                    FLAG_EVENT_LISTENER_PROCESS_LABEL,
                    this.pid,
                    5
                )
            }

            const EMPIRE_MANAGER_PROCESS_LABEL = "empire_manager"
            if (!Kernel.getProcessByLabel(EMPIRE_MANAGER_PROCESS_LABEL)) {
                console.log(`DEBUG Creating process ${EMPIRE_MANAGER_PROCESS_LABEL}`)
                Kernel.scheduler.launchProcess(
                    Kernel.availableProcessClasses.EmpireManager,
                    EMPIRE_MANAGER_PROCESS_LABEL,
                    this.pid,
                    1
                )
            }

            // Kernel.getProcessByLabel("tower_manager_of_5b9b598483aa9a1563ddc40c_on_E49S15").die()
            // Kernel.getProcessByLabel("construction_manager_of_room_E49S15_from_E47S16").die()
            // Kernel.getProcessByLabel("repair_manager_of_room_E49S15_from_E47S16").die()
        }
    }
}