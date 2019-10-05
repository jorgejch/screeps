const ActivityDirectorProcess = require("./process.activityDirectorProcess")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const tasks = require("./creep.tasks")
const processUtils = require('./util.process')

module.exports = {
    ControllerUpgradeManager: class extends ActivityDirectorProcess {
        set controllerId(id) {
            this.data.controllerId = id
        }

        get controllerId() {
            return this.data.controllerId
        }

        get controller() {
            return Game.getObjectById(this.controllerId)
        }

        get controllerRoom() {
            return this.controller.room
        }


        run() {

            if (!this.controller) {
                throw `Invalid controller id ${this.controllerId}.`
            }
            const role = "upgrader"
            this.cleanRoleDeadProcesses(role)

            if (!this.ownerRoomName) {
                this.ownerRoomName = this.controllerRoom.name
            }

            let bodyType, currentLevel
            let numberOfUpgraders = 0

            const roomsEnergyCapacityAvailable = this.controllerRoom.energyCapacityAvailable
            const energySourcingOption = processUtils.determineDefaultRoomEnergyObtentionMethod(this.controllerRoom)
            const energySourcingTaskTicket = processUtils.getDefaultEnergySourcingTaskTicket(
                energySourcingOption,
                this.controllerRoom.name
            )

            if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                currentLevel = 1
                bodyType = "BASIC_WORKER_1"
                numberOfUpgraders = 2
            } else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                currentLevel = 2
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_2"
                numberOfUpgraders = 2
            } else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                currentLevel = 3
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_3"
                numberOfUpgraders = 3
            } else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                currentLevel = 4
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_4"
                numberOfUpgraders = 3
            } else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_6) {
                currentLevel = 5
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_5"
                numberOfUpgraders = 3
            } else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_7) {
                currentLevel = 6
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_6"
                numberOfUpgraders = 3
            } else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_8) {
                currentLevel = 7
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_7"
                numberOfUpgraders = 3
            } else if (processUtils.checkRoomHasLinkCloseToController(this.controllerRoom)) {
                currentLevel = 7
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_7"
                numberOfUpgraders = 3
            } else {
                currentLevel = 8
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_7"
                numberOfUpgraders = 1
            }

            this.resolveRoleProcessesQuantity(
                role,
                numberOfUpgraders,
                bodyType,
                3,
                [
                    energySourcingTaskTicket,
                    new tasks.TaskTicket(
                        tasks.tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: this.controllerRoom.name}
                    )
                ],
                this.controllerId,
                currentLevel
            )
        }
    },
}