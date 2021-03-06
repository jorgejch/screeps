'use strict'

const DirectorProcess = require("./process.director.directorProcess")
const tasks = require("./creep.tasks")
const generalUtils = require("./util.general")

module.exports = {
    ScoutDirector: class extends  DirectorProcess{
        run() {
            const scoutRole = "scout"
            this.cleanRoleDeadProcesses(scoutRole)

            const rallyFlag = generalUtils.getRoomRallyFlag(this.targetRoomName)
            const scoutBodyType = "SCOUT_1"

            this.resolveRoleProcessesQuantity(
                scoutRole,
                1,
                scoutBodyType,
                2,
                [new tasks.TaskTicket(
                    tasks.tasks.GO_CLOSE_TO_TARGET.name,
                    {range: 1, targetPosParams: rallyFlag.pos}
                )],
                this.targetRoomName,
                1
            )
            this.setAllRoleProcessesToDieAfterCreep(scoutRole)
            console.log(`Target room ${this.targetRoomName} is not visible. Sending scout.`)
        }
    },
    GuardDirector: class extends DirectorProcess{
        run() {
            const guardRole = "guard"
            this.cleanRoleDeadProcesses(guardRole)

            const hostiles = generalUtils.findHostiles(this.targetRoom)
            // send guard if hostile in room
            if (hostiles.length > 0) {
                const guardBodyType = "ATTACKER_3"

                this.resolveRoleProcessesQuantity(
                    guardRole,
                    1,
                    guardBodyType,
                    3,
                    [new tasks.TaskTicket(
                        tasks.tasks.GUARD_ROOM.name,
                        {roomName: this.targetRoomName}
                    )],
                    this.targetRoomName,
                    1
                )
                this.setAllRoleProcessesToDieAfterCreep(guardRole)
            }
        }
    },
}