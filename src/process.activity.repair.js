const ActivityDirectorProcess = require("./process.activityDirectorProcess")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const tasks = require("./creep.tasks")
const processUtils = require('./util.process')
const config = require("./config")
const obtainEnergyOptions = require("./util.obtainEnergyOptions")

module.exports = {
    RepairManager: class extends ActivityDirectorProcess {
        run() {
            const role = "repairman"
            this.cleanRoleDeadProcesses(role)

            if (!this.targetRoom) {
                console.log(`Process ${this.label} does not visibility into ${this.targetRoomName}.`)
                return
            }

            const damagedStructuresAtThreshold = this.targetRoom
                .find(FIND_STRUCTURES).filter(struct => {
                    if (struct.hits < struct.hitsMax / 3) {
                        if (struct.structureType === STRUCTURE_WALL) {
                            return struct.hits < config.MAX_WALL_HITS_LIMIT / 3
                        } else if (struct.structureType === STRUCTURE_RAMPART) {
                            return struct.hits < config.MAX_RAMPART_HITS_LIMIT / 3
                        } else if (struct.structureType === STRUCTURE_CONTAINER) {
                            // TODO: as a migration right side dividend has to be slowly brought to 1
                            return struct.hits < struct.hitsMax / 10
                        } else {
                            return true
                        }
                    }
                })

            if (damagedStructuresAtThreshold.length > 0) {
                const ownerRoomSourceOption = processUtils.determineDefaultRoomEnergyObtentionMethod(this.ownerRoom)
                const targetRoomSourceOption = processUtils.determineDefaultRoomEnergyObtentionMethod(this.targetRoom)
                let sourceOption, sourceRoomName

                // rather than harvest on the target leech from owner
                if (
                    targetRoomSourceOption === obtainEnergyOptions.HARVEST
                    && ownerRoomSourceOption !== obtainEnergyOptions.HARVEST
                ) {
                    sourceOption = ownerRoomSourceOption
                    sourceRoomName = this.ownerRoomName
                } else {
                    sourceOption = targetRoomSourceOption
                    sourceRoomName = this.targetRoomName
                }

                const sourceEnergyTaskTicket = processUtils.getDefaultEnergySourcingTaskTicket(sourceOption, sourceRoomName)
                const energyCapacityAvailable = this.ownerRoom.energyCapacityAvailable
                let bodyType, currentLevel, numOfCreeps

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                    bodyType = "BASIC_WORKER_1"
                    currentLevel = 1
                    numOfCreeps = 1 + Math.min(Math.trunc(damagedStructuresAtThreshold.length / 5), 2)
                } else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_2"
                    numOfCreeps = 1 + Math.min(Math.trunc(damagedStructuresAtThreshold.length / 5), 2)
                } else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_3"
                    numOfCreeps = 1 + Math.min(Math.trunc(damagedStructuresAtThreshold.length / 5), 1)
                } else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                    currentLevel = 4
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_4"
                    numOfCreeps = 1
                } else {
                    currentLevel = 5
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_5"
                    numOfCreeps = 1
                }

                this.resolveRoleProcessesQuantity(
                    role,
                    numOfCreeps,
                    bodyType,
                    12,
                    [
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_PICKUP_DROPPED_RESOURCE_ON_ROOM.name,
                            {roomName: this.targetRoomName}
                        ),
                        sourceEnergyTaskTicket,
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_REPAIR_ROOM_STRUCTURES.name, {roomName: this.targetRoomName}
                        )
                    ],
                    this.targetRoomName,
                    currentLevel
                )
                this.setAllRoleProcessesToDieAfterCreep(role)
            }
        }
    },
}