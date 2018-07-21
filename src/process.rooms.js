const BaseProcess = require("process.base")
const creepSpawner = require("util.creepSpawner")
const energyCapacityLevels = require("util.energyCapacityLevels")
const obtainEnergyOptions = require("util.obtainEnergyOptions")
const tasks = require("creep.tasks");

function checkContainerExists(room) {
    return room.find(FIND_MY_STRUCTURES)
        .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
        .length > 0
}

function checkStorageExists(room) {
    return room.find(FIND_MY_STRUCTURES)
        .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
        .length > 0
}

function determineEnergyObtentionMethod(room) {
    if (checkStorageExists(room)) {
        return obtainEnergyOptions.FROM_STORAGE
    }
    else if (checkContainerExists(room)) {
        return obtainEnergyOptions.FROM_CONTAINER
    }
    else {
        return obtainEnergyOptions.HARVEST
    }
}

function getEnergySourcingTaskTicket(sourceOption, roomName){
    let sourceEnergyTaskTicket
    switch (sourceOption) {
        case obtainEnergyOptions.HARVEST:
            sourceEnergyTaskTicket = new tasks.TaskTicket(
                tasks.tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: roomName}
            )
            break
        case obtainEnergyOptions.FROM_CONTAINER:
            sourceEnergyTaskTicket = new tasks.TaskTicket(
                tasks.tasks.CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM.name,
                {roomName: roomName, resourceType: RESOURCE_ENERGY, amount: null}
            )
            break
        case obtainEnergyOptions.FROM_STORAGE:
            sourceEnergyTaskTicket = new tasks.TaskTicket(
                tasks.tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                {roomName: roomName, resourceType: RESOURCE_ENERGY, amount: null}
            )
            break
    }
    return sourceEnergyTaskTicket
}

module.exports = {
    ConstructionManager: class extends BaseProcess {
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        get ownerRoom() {
            return Game.rooms[this.ownerRoomName]
        }

        set targetRoomName(name) {
            this.data.targetRoomName = name
        }

        get targetRoomName() {
            return this.data.targetRoomName
        }

        get childLabels() {
            if (!this.data.childLabels) {
                this.data.childLabels = []
            }
            return this.data.childLabels
        }

        run() {
            const targetRoomConstructionSites = Object.values(Game.constructionSites)
                .filter(cs => cs.room.name === this.targetRoomName)

            if (targetRoomConstructionSites.length > 0) {
                let numOfBuilders

                const sourceOption = determineEnergyObtentionMethod(this.ownerRoom)
                const sourceEnergyTaskTicket = getEnergySourcingTaskTicket(sourceOption, this.ownerRoomName)
                const energyCapacityAvailable = this.ownerRoom.energyCapacityAvailable
                let bodyType

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                    bodyType = "BASIC_WORKER_1"
                    numOfBuilders = targetRoomConstructionSites.length > 3 ? 3 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                    bodyType = "BASIC_WORKER_2"
                    numOfBuilders = targetRoomConstructionSites.length > 3 ? 3 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                    bodyType = "BASIC_WORKER_3"
                    numOfBuilders = targetRoomConstructionSites.length > 3 ? 3 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                    bodyType = "BASIC_WORKER_4"
                    numOfBuilders = 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_6) {
                    bodyType = "BASIC_WORKER_5"
                    numOfBuilders = 1
                }
                else {
                    bodyType = "BASIC_WORKER_6"
                    numOfBuilders = 1
                }

                while(this.childLabels.length < numOfBuilders){
                    const label = `constructor_creep_manager_${Game.time}_${this.childLabels.length + 1}`
                    try {
                        const process = Kernel.scheduler.launchProcess(
                            Kernel.availableProcessClasses.CreepManager,
                            label,
                            this.pid
                        )
                        process.creepName = `Constructor${Game.time}_${this.childLabels.length + 1}`
                        process.creepType = bodyType
                        process.ownerRoomName = this.ownerRoomName
                        process.spawningPriority = 15

                        process.initialTaskTicketQueue = [
                            sourceEnergyTaskTicket,
                            new tasks.TaskTicket(
                                tasks.tasks.CYCLIC_BUILD_ROOM.name, {roomName: this.targetRoomName}
                            )
                        ]
                        this.childLabels.push(process.label)
                    }
                    catch (e) {
                        console.log(`Failed to launch process for upgrader due to: ${e.stack}`)
                    }
                }
            }
        }
    },
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

        run() {
            if (!this.controller) {
                throw `Invalid controller id ${this.controllerId}.`
            }

            let upgraderbodyType, numberOfUpgraders = 3

            const sourceOption = determineEnergyObtentionMethod(this.room)
            const sourceEnergyTaskTicket = getEnergySourcingTaskTicket(sourceOption, this.room.name)
            const energyCapacityAvailable = this.room.energyCapacityAvailable

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
            else {
                upgraderbodyType = "BASIC_WORKER_6"
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
    OwnedRoomManager: class extends BaseProcess {
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

            // init constructor manager when needed
            if(room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                const CONSTRUCTION_MANAGER_PROC_LABEL = `construction_manager_of_room_${this.roomName}`
                if (!Kernel.getProcessByLabel(CONSTRUCTION_MANAGER_PROC_LABEL)) {
                    console.log(`DEBUG Creating process ${CONSTRUCTION_MANAGER_PROC_LABEL}`)
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.ConstructionManager,
                        CONSTRUCTION_MANAGER_PROC_LABEL,
                        this.pid,
                        10
                    )
                    process.ownerRoomName = this.roomName
                    process.targetRoomName = this.roomName
                }
            }
        }
    }
}