'use strict'
const BaseProcess = require("./process.baseProcess")
const config = require("./config")
const mixins = require("./process.activityDirectorProcess")
const tasks = require("./creep.tasks");
const generalUtils = require("./util.general");

module.exports = {
    EmpireManager: class extends BaseProcess {
        run() {
            if (!this.data.ownRooms) {
                this.data.ownRooms = {}
            }

            Object.keys(Game.rooms).forEach(roomName => {
                const room = Game.rooms[roomName]
                if (
                    room.controller
                    && room.controller.owner
                    && room.controller.owner.username === config.PLAYER_NAME
                    && !this.data.ownRooms[roomName]
                ) {
                    const label = `${roomName}_manager`
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.OwnedRoomManager,
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
    ConquestManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {

        run() {

            // send scout if target room is not visible
            if (!Game.rooms[this.targetRoomName]) {
                const rallyFlag = generalUtils.getRoomRallyFlag(this.targetRoomName)
                const scoutBodyType = "SCOUT_1"
                const scoutRole = "scout"

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
                return
            }

            if (!this.targetRoom.controller) {
                throw `Room has no controller to claim.`
            }

            const conquistadorRole = "conquistador"
            this.cleanRoleDeadProcesses(conquistadorRole)

            this.resolveRoleProcessesQuantity(
                conquistadorRole,
                1,
                "CLAIMER_4",
                15,
                [
                    new tasks.TaskTicket(
                        tasks.tasks.CLAIM_ROOM_CONTROLLER.name,
                        {roomName:this.targetRoomName}
                    )
                ],
                this.targetRoomName,
                1
            )

            this.setAllRoleProcessesToDieAfterCreep(conquistadorRole)
        }
    }
}