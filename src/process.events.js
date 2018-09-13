const BaseProcess = require("process.base")
const processStates = require("os.processState")
const eventFlagMap = require("os.eventFuncMap")
module.exports = {
    FlagEventListener: class extends BaseProcess {
        _getEventFuncForFlag(flag) {
            return eventFlagMap[`${flag.color}_${flag.secondaryColor}`]
        }

        run() {
            Object.values(Game.flags)
                .filter(flag => flag.color !== COLOR_WHITE)
                .forEach(flag => {
                    const eventFunction = this._getEventFuncForFlag(flag)
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
        }
    },
}