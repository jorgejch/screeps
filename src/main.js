'use strict'
import {OSKernel} from "./os.kernel"
import {EventManager} from "process.eventManager"

export function loop() {
    const EVENT_MANAGER_PROCESS_LABEL = "event_manager"

    if (Game.cpu.bucket < 500) {
        throw "CPU Bucket too low. Halting."
    }
    global.Kernel = new OSKernel()
    Kernel.init()

    // add event manager process if non-existent
    if (!Kernel.scheduler.getProcessByLabel(EVENT_MANAGER_PROCESS_LABEL)) {
        Kernel.scheduler.launchProcess(EventManager, null, EVENT_MANAGER_PROCESS_LABEL)
    }
    Kernel.run()
}
