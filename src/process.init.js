import {BaseProcess} from "./process.base";
import eventFlagMap from "./os.eventFuncMap";
import ProcessState from "./os.processState";
import {EmpireManager} from "./process.empire";

export class FlagEventListener extends BaseProcess {

    static _getEventFuncForFlag(flag) {
        return eventFlagMap[`${flag.color}_${flag.secondaryColor}`]
    }

    run() {
        Object.values(Game.flags)
            .filter(flag => flag.color !== COLOR_WHITE)
            .forEach(flag => {
                const eventFunction = FlagEventListener._getEventFuncForFlag(flag)
                if (eventFunction) {
                    try {
                        eventFunction(flag)
                        flag.remove()
                    }
                    catch (e) {
                        console.log(`Failed to execute event function ${eventFunction.name} due to: ${e.stack}`)
                    }
                }
                else {
                    console.log(`Invalid flag. Name: ${flag.name} Color1: ${flag.color} Color2: ${flag.secondaryColor}`)
                }
            })

        this.state = ProcessState.WAIT
    }
}

export class Init extends BaseProcess{
    run(){


        // the event manager process must always exist
        const FLAG_EVENT_LISTENER_PROCESS_LABEL = "flag_event_listener"
        if (!Kernel.scheduler.getProcessByLabel(FLAG_EVENT_LISTENER_PROCESS_LABEL)) {
            console.log(`DEBUG Creating process ${FLAG_EVENT_LISTENER_PROCESS_LABEL}`)
            Kernel.scheduler.launchProcess(FlagEventListener, FLAG_EVENT_LISTENER_PROCESS_LABEL, this.pid, 5)
        }

        const EMPIRE_MANAGER_PROCESS_LABEL = "empire_manager"
        if (!Kernel.scheduler.getProcessByLabel(EMPIRE_MANAGER_PROCESS_LABEL)) {
            console.log(`DEBUG Creating process ${EMPIRE_MANAGER_PROCESS_LABEL}`)
            Kernel.scheduler.launchProcess(EmpireManager, EMPIRE_MANAGER_PROCESS_LABEL, this.pid, 2)
        }

    }
}