'use strict'

const DirectorProcess = require("./process.director.directorProcess")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const tasks = require("./creep.tasks")
const processUtils = require('./util.process')
const obtainEnergyOptions = require("./util.obtainEnergyOptions")

module.exports = {
    ConstructionDirector: class extends DirectorProcess {
        run() {
            const role = "builder"
            this.cleanRoleDeadProcesses(role)
            const targetRoomConstructionSites = Object.values(Game.constructionSites)
                .filter(cs => cs.pos.roomName === this.targetRoomName)

            if (targetRoomConstructionSites.length > 0) {
                const sourceRoomName = this.targetRoomName
                const energyCapacityAvailable = this.ownerRoom.energyCapacityAvailable
                const totalProgressReq = _.sum(targetRoomConstructionSites, cs => cs.progressTotal)
                const defaultSourceOption = processUtils.determineRoomEnergyObtentionMethod(this.ownerRoom)
                let bodyType, currentLevel, numOfCreeps, sourceEnergyTaskTicket

                sourceEnergyTaskTicket =
                    processUtils.getEnergyObtentionTaskTicket(defaultSourceOption, sourceRoomName)

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2 || this.ownerRoom.controller.level === 1) {
                    sourceEnergyTaskTicket =
                        processUtils.getEnergyObtentionTaskTicket(obtainEnergyOptions.HARVEST, sourceRoomName)
                    bodyType = "BASIC_WORKER_1"
                    currentLevel = 1
                    numOfCreeps = targetRoomConstructionSites.length > 3 ? 2 : 1
                } else if (
                    energyCapacityAvailable < energyCapacityLevels.LEVEL_3 || this.ownerRoom.controller.level === 2
                ) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_2"
                    /*
                        CS progress cost examples:
                        road = 300 or 1500
                        extension = 3000
                     */
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*1 extension*/ 3000), 3)
                } else if (
                    energyCapacityAvailable < energyCapacityLevels.LEVEL_4 || this.ownerRoom.controller.level === 3
                ) {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_3"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*2 extensions*/ 6000), 2)
                } else if (
                    energyCapacityAvailable < energyCapacityLevels.LEVEL_5 || this.ownerRoom.controller.level === 4
                ) {
                    currentLevel = 4
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_4"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*5 extensions*/ 15000), 2)
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
