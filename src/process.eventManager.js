import {BaseProcess} from "./process.base"
import ProcessState from "os.processState"
import eventFlagMap from "os.eventFlagMap"
import * as generalUtils from "generalUtils"

export class EventManager extends BaseProcess {
    constructor(pid, parentPid, label) {
        super(pid, parentPid, label)
    }

    _getEventFuncForFlag(flag){
        return eventFlagMap[generalUtils.getFlagDescriptor(flag.color, flag.secondaryColor)]
    }

    run() {
        this.state = ProcessState.ACTIVE

        Object.values(Game.flags)
            .filter(flag => flag.color !== COLOR_WHITE)
            .forEach(flag => {
                const eventFunction = this._getEventFuncForFlag(flag)
                eventFunction(flag)
                flag.remove()
            })
    }
}