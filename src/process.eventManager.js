import {BaseProcess} from "process.base"
import ProcessState from "os.processState"
import eventFlagMap from "os.eventFlagMap"
import * as generalUtils from "generalUtils"

export class EventManager extends BaseProcess {
    constructor(pid, parentPid, label) {
        super(pid, parentPid, label)
    }

    static _getEventFuncForFlag(flag){
        return eventFlagMap[generalUtils.getFlagDescriptor(flag.color, flag.secondaryColor)]
    }

    run() {
        this.state = ProcessState.ACTIVE
        Object.values(Game.flags)
            .filter(flag => flag.color !== COLOR_WHITE)
            .forEach(flag => {
                const eventFunction = EventManager._getEventFuncForFlag(flag)
                if (eventFunction){
                    try{
                        eventFunction(flag)
                        flag.remove()
                    }
                    catch (e) {
                        console.log(`Failed to execute event function ${eventFunction.name} due to: ${e.stack}`)
                    }
                }
                else{
                    console.log(`Invalid flag. Name: ${flag.name} Color1: ${flag.color} Color2: ${flag.secondaryColor}`)
                }
            })

        this.state = ProcessState.WAIT
    }
}