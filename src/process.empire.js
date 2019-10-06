'use strict'

const BaseProcess = require("./process.baseProcess")
const config = require("./config")
const eventFlagMap = require("./os.eventFuncMap")

module.exports = {
    EmpireRuler: class extends BaseProcess {
        run() {
            if (!this.data.ownRooms) {
                this.data.ownRooms = {}
            }

            /* init if needed */

            const FLAG_EVENT_LISTENER_PROCESS_LABEL = "flag_event_listener"
            if (!Kernel.getProcessByLabel(FLAG_EVENT_LISTENER_PROCESS_LABEL)) {
                Kernel.scheduler.launchProcess(
                    Kernel.availableProcessClasses.FlagEventListener,
                    FLAG_EVENT_LISTENER_PROCESS_LABEL,
                    this.pid,
                    5
                )
            }

            Object.keys(Game.rooms).forEach(roomName => {
                const room = Game.rooms[roomName]
                if (
                    room.controller
                    && room.controller.owner
                    && room.controller.owner.username === config.PLAYER_NAME
                    && !this.data.ownRooms[roomName]
                ) {
                    const label = `${roomName}_governor`
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.OwnedRoomGovernor,
                        label,
                        this.pid,
                        10
                    )
                    this.data.ownRooms[roomName] = process.label
                    process.roomName = roomName
                }
            })
        }
    },
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
                        } catch (e) {
                            console.log(`Failed to execute event function ${eventFunction.name} due to: ${e.stack}`)
                        }
                    } else {
                        console.log(`Invalid flag. Name: ${flag.name} Color1: ${flag.color} Color2: ${flag.secondaryColor}`)
                    }
                })
        }
    },
}