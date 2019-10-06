'use strict'

const DirectorProcess = require("./process.director.directorProcess")
const tasks = require("./creep.tasks");
const generalUtils = require("./util.general");

module.exports = {
    ConquestDirector: class extends DirectorProcess {

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
                        {roomName: this.targetRoomName}
                    )
                ],
                this.targetRoomName,
                1
            )

            this.setAllRoleProcessesToDieAfterCreep(conquistadorRole)
        }
    },

    ReserveRoomDirector: class extends DirectorProcess {
        set controllerPositionProps(pos) {
            this.data.controllerPositionProps = pos
        }

        get controllerPosition() {
            const posProps = this.data.controllerPositionProps
            return new RoomPosition(posProps.x, posProps.y, posProps.roomName)
        }

        run() {
            const role = "reserver"
            const ownerRoomEnergyCapacity = this.ownerRoom.energyCapacityAvailable
            let currentLevel, bodyType

            this.cleanRoleDeadProcesses(role)
            if (ownerRoomEnergyCapacity < energyCapacityLevels.LEVEL_4) {
                currentLevel = 1
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "CLAIMER_3"
            } else {
                currentLevel = 2
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "CLAIMER_4"
            }

            this.resolveRoleProcessesQuantity(
                role,
                1,
                bodyType,
                25,
                [
                    new tasks.TaskTicket(
                        tasks.tasks.GO_CLOSE_TO_TARGET.name,
                        {range: 1, targetPosParams: this.controllerPosition}
                    ),
                    new tasks.TaskTicket(
                        tasks.tasks.RESERVE_ROOM_CONTROLLER.name,
                        {roomName: this.controllerPosition.roomName}
                    )
                ],
                this.controllerPosition.roomName,
                currentLevel
            )
        }
    }
}
