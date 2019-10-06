'use strict'

const DirectorProcess = require("./process.director.directorProcess")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const tasks = require("./creep.tasks")
const processUtils = require('./util.process')
const config = require("./config")

module.exports = {
    EnergySupplyDirector: class extends DirectorProcess {
        run() {
            const role = "energy_supplier"
            this.cleanRoleDeadProcesses(role)

            if (processUtils.checkRoomHasContainers(this.ownerRoom)) {
                const sourceOption = processUtils.determineDefaultRoomEnergyObtentionMethod(this.ownerRoom)
                const sourceEnergyTaskTicket = processUtils.getDefaultEnergySourcingTaskTicket(
                    sourceOption,
                    this.ownerRoomName
                )

                const energyCapacityAvailable = this.targetRoom.energyCapacityAvailable
                let bodyType, currentLevel, numOfFeeders

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3
                    || !processUtils.getRoomStorage(this.ownerRoom) /* so update to storage source opt happens */) {
                    currentLevel = 1
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "FREIGHTER_2"
                } else {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "FREIGHTER_3"
                }

                numOfFeeders = config.DEFAULT_NUM_OF_FEEDERS

                // above storage threshold towers up walls/ramparts, and feeders are in more demand
                // TODO: make feeder manager calculate how many feeders it needs based on demand
                if (processUtils.getRoomStorage(this.targetRoom)
                    && processUtils.checkStorageStoreAboveThreshold(this.targetRoom)) {
                    numOfFeeders += 1
                }

                this.resolveRoleProcessesQuantity(
                    role,
                    numOfFeeders,
                    bodyType,
                    1,
                    [
                        sourceEnergyTaskTicket,
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_TRANSFER_ENERGY_TO_ROOM_SPAWN_STRUCTS.name,
                            {roomName: this.targetRoom.name}
                        ),
                        sourceEnergyTaskTicket,
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_FEED_EMPTIER_TOWER.name,
                            {roomName: this.targetRoom.name, amount: null}
                        ),
                    ],
                    this.targetRoomName,
                    currentLevel,
                    1  // space orders to prevent feeders dying together
                )
            }
        }
    },
}