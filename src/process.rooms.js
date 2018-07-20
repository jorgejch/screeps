const BaseProcess = require("process.base")
const creepSpawner = require("util.creepSpawner")
const creepTypes = require("creep.types")
const energyCapacityLevels = require("util.energyCapacityLevels")
const obtainEnergyOptions = require("util.obtainEnergyOptions")
const tasks = require("./creep.tasks");

module.exports = {
    ControllerUpgradeManager: class extends BaseProcess {
        set controllerId(id) {
            this.data.controllerId = id
        }

        get controllerId() {
            return this.data.controllerId
        }

        get controller() {
            return Game.getObjectById(this.controllerId)
        }

        get room() {
            return this.controller.room
        }

        get upgraderProcLabels() {
            if (!this.data.upgraderProcLabels) {
                this.data.upgraderProcLabels = []
            }
            return this.data.upgraderProcLabels
        }

        _checkContainerExists() {
            return this.room.find(FIND_MY_STRUCTURES)
                .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
                .length > 0
        }

        _checkStorageExists() {
            return this.room.find(FIND_MY_STRUCTURES)
                .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
                .length > 0
        }

        _determineEnergyObtentionMethod() {
            if (this._checkStorageExists()) {
                return obtainEnergyOptions.FROM_STORAGE
            }
            else if (this._checkContainerExists()) {
                return obtainEnergyOptions.FROM_CONTAINER
            }
            else {
                return obtainEnergyOptions.HARVEST
            }
        }

        run() {
            if (!this.controller) {
                throw `Invalid controller id ${this.controllerId}.`
            }

            const energyCapacityAvailable = this.room.energyCapacityAvailable
            const sourceOption = this._determineEnergyObtentionMethod()
            let upgraderbodyType, numberOfUpgraders = 3

            if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                upgraderbodyType = "BASIC_WORKER_1"
            }
            else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                upgraderbodyType = "BASIC_WORKER_2"
            }
            else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                upgraderbodyType = "BASIC_WORKER_3"
            }
            else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                upgraderbodyType = "BASIC_WORKER_4"
            }
            else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_6) {
                upgraderbodyType = "BASIC_WORKER_5"
            }
            else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_7) {
                upgraderbodyType = "BASIC_WORKER_6"
            }
            else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_8) {
                upgraderbodyType = "BASIC_WORKER_7"
            }
            else {
                upgraderbodyType = "BASIC_WORKER_8"
            }

            while (this.upgraderProcLabels.length < numberOfUpgraders) {
                const label = `upgrader_creep_manager_${Game.time}_${this.upgraderProcLabels.length + 1}`
                try {
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.CreepManager,
                        label,
                        this.pid
                    )
                    process.creepName = `Upgrader${Game.time}_${this.upgraderProcLabels.length + 1}`
                    process.creepType = upgraderbodyType
                    process.ownerRoomName = this.room.name
                    process.spawningPriority = 5

                    let sourceEnergyTaskTicket
                    switch (sourceOption) {
                        case obtainEnergyOptions.HARVEST:
                            sourceEnergyTaskTicket = new tasks.TaskTicket(
                                tasks.tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: this.room.name}
                            )
                            break
                        case obtainEnergyOptions.FROM_CONTAINER:
                            sourceEnergyTaskTicket = new tasks.TaskTicket(
                                tasks.tasks.CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM.name,
                                {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                            )
                            break
                        case obtainEnergyOptions.FROM_STORAGE:
                            sourceEnergyTaskTicket = new tasks.TaskTicket(
                                tasks.tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                                {roomName: this.room.name, resourceType: RESOURCE_ENERGY, amount: null}
                            )
                            break
                    }

                    process.initialTaskTicketQueue = [
                        sourceEnergyTaskTicket,
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_UPGRADE_ROOM_CONTROLLER.name, {roomName: this.room.name}
                        )
                    ]
                    this.upgraderProcLabels.push(process.label)
                }
                catch (e) {
                    console.log(`Failed to launch process for upgrader due to: ${e.stack}`)
                }
            }
        }
    },
    OwnedRoomManager:
        class
            extends BaseProcess {
            set roomName(roomName) {
                this.data.roomName = roomName
            }

            get roomName() {
                return this.data.roomName
            }

            get orderBook() {
                if (!this.data.creepOrderBook) {
                    this.data.creepOrderBook = []
                }
                return this.data.creepOrderBook
            }

            addOrderForCreep(order) {
                creepSpawner.addOrderForCreepInOrderBook(order, this.orderBook)
            }

            isOrderForCreepNameInOrderBook(creepName) {
                return !!this.orderBook.find(order => order.name === creepName)
            }

            _processNextCreepOrder(spawn) {
                const order = this.orderBook.sort((a, b) => a.priority - b.priority)[0]
                if (order) {
                    creepSpawner.executeOrder(order, spawn, this.orderBook)
                }
            }

            run() {
                const room = Game.rooms[this.roomName]

                // spawn
                const spawns = room.find(FIND_MY_SPAWNS)
                spawns.forEach(spawn => {
                    try {
                        this._processNextCreepOrder(spawn)
                    }
                    catch (e) {
                        console.log(`Failed to spawn creep on room ${this.roomName}'s ${spawn.name} spawn due to: ${e.stack}`)
                    }
                })
            }
        }
}