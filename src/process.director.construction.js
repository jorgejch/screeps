'use strict'

const DirectorProcess = require("./process.director.directorProcess")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const tasks = require("./creep.tasks")
const processUtils = require('./util.process')

module.exports = {
    ConstructionDirector: class extends DirectorProcess {
        run() {
            const role = "builder"
            this.cleanRoleDeadProcesses(role)
            const targetRoomConstructionSites = Object.values(Game.constructionSites)
                .filter(cs => cs.pos.roomName === this.targetRoomName)

            if (targetRoomConstructionSites.length > 0) {
                const ownerRoomSourceOption = processUtils.determineRoomEnergyObtentionMethod(this.ownerRoom)
                const targetRoomSourceOption = processUtils.determineRoomEnergyObtentionMethod(this.targetRoom)
                let sourceOption, sourceRoomName

                sourceOption = targetRoomSourceOption
                sourceRoomName = this.targetRoomName

                const sourceEnergyTaskTicket = processUtils
                    .getEnergyObtentionTaskTicket(sourceOption, sourceRoomName)
                const energyCapacityAvailable = this.ownerRoom.energyCapacityAvailable
                const totalProgressReq = _.sum(targetRoomConstructionSites, cs => cs.progressTotal)
                let bodyType, currentLevel, numOfCreeps

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                    bodyType = "BASIC_WORKER_1"
                    currentLevel = 1
                    numOfCreeps = targetRoomConstructionSites.length > 3 ? 2 : 1
                } else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_2"
                    /*
                        CS progress cost examples:
                        road = 300 or 1500
                        extension = 3000
                     */
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*1 extension*/ 3000), 2)
                } else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_3"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*2 extensions*/ 6000), 2)
                } else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                    currentLevel = 4
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_4"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*5 extentensions*/ 15000), 2)
                } else {
                    currentLevel = 5
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_5"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*10 extensions*/ 30000), 1)
                }

                this.resolveRoleProcessesQuantity(
                    role,
                    numOfCreeps,
                    bodyType,
                    20,
                    [
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_PICKUP_DROPPED_RESOURCE_ON_ROOM.name,
                            {roomName: this.targetRoomName}
                        ),
                        sourceEnergyTaskTicket,
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_BUILD_ROOM.name, {roomName: this.targetRoomName}
                        )
                    ],
                    this.targetRoomName,
                    currentLevel
                )
                this.setAllRoleProcessesToDieAfterCreep(role)
            }
        }
    }
}
