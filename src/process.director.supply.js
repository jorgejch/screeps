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
                const sourceEnergyTaskTicket = processUtils.getEnergyObtentionTaskTicket(
                    processUtils.determineRoomEnergyObtentionMethod(this.ownerRoom),
                    this.ownerRoomName
                )

                const energyCapacityAvailable = this.targetRoom.energyCapacityAvailable
                let bodyType, currentLevel, numOfFeeders

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2 || this.ownerRoom.controller.level < 2) {
                    // At this level harvesters supply extensions/spawn. No need for a supplier.
                    return
                }
                else if (!processUtils.getRoomStorage(this.ownerRoom)) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = `FREIGHTER_${currentLevel}`
                } else {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = `FREIGHTER_${currentLevel}`
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
                    100  // space orders to prevent suppliers from dying together
                )
            }
        }
    },
}