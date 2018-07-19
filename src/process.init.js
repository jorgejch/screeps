const BaseProcess = require("process.base")
const empire = require("process.empire")
const energy = require("process.energy")
const events = require("process.events")

module.exports = {

    Init: class extends BaseProcess {
        run() {


            // the event manager process must always exist
            const FLAG_EVENT_LISTENER_PROCESS_LABEL = "flag_event_listener"
            if (!Kernel.scheduler.getProcessByLabel(FLAG_EVENT_LISTENER_PROCESS_LABEL)) {
                console.log(`DEBUG Creating process ${FLAG_EVENT_LISTENER_PROCESS_LABEL}`)
                Kernel.scheduler.launchProcess(events.FlagEventListener, FLAG_EVENT_LISTENER_PROCESS_LABEL, this.pid, 5)
            }

            const EMPIRE_MANAGER_PROCESS_LABEL = "empire_manager"
            if (!Kernel.scheduler.getProcessByLabel(EMPIRE_MANAGER_PROCESS_LABEL)) {
                console.log(`DEBUG Creating process ${EMPIRE_MANAGER_PROCESS_LABEL}`)
                Kernel.scheduler.launchProcess(empire.EmpireManager, EMPIRE_MANAGER_PROCESS_LABEL, this.pid, 2)
            }

            const TEST_LABEL = "test_source_harvest_manager"
            if (!Kernel.scheduler.getProcessByLabel(TEST_LABEL)) {
                const process = Kernel.scheduler.launchProcess(energy.SourceHarvestManager, TEST_LABEL)
                const processData = Kernel.getProcessData(process)
                processData.sourceId = Object.values(Game.rooms)[0].find(FIND_SOURCES_ACTIVE)[0].id
                processData.ownerRoomName = Game.getObjectById(processData.sourceId).room.name
            }
        }
    }
}