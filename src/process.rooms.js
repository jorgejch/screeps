const BaseProcess = require("process.base")
const creepSpawner = require("util.creepSpawner")
const energyCapacityLevels = require("util.energyCapacityLevels")
const tasks = require("creep.tasks");
const processUtils = require('util.process')
const config = require("config")
const mixins = require("process.mixins")

module.exports = {
    ConstructionManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
        set targetRoomName(name) {
            this.data.targetRoomName = name
        }

        get targetRoomName() {
            return this.data.targetRoomName
        }

        run() {
            const targetRoomConstructionSites = Object.values(Game.constructionSites)
                .filter(cs => cs.room.name === this.targetRoomName)

            if (targetRoomConstructionSites.length > 0) {
                const role = "builder"
                const sourceOption = processUtils.determineEnergyObtentionMethod(this.ownerRoom)
                const sourceEnergyTaskTicket = processUtils.getEnergySourcingTaskTicket(sourceOption, this.ownerRoomName)
                const energyCapacityAvailable = this.ownerRoom.energyCapacityAvailable
                let bodyType, currentLevel, numOfBuilders

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                    bodyType = "BASIC_WORKER_1"
                    currentLevel = 1
                    numOfBuilders = targetRoomConstructionSites.length > 3 ? 3 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_2"
                    numOfBuilders = targetRoomConstructionSites.length > 3 ? 3 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_3"
                    numOfBuilders = targetRoomConstructionSites.length > 3 ? 2 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                    currentLevel = 4
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_4"
                    numOfBuilders = 1
                }
                else {
                    currentLevel = 5
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_5"
                    numOfBuilders = 1
                }

                this.resolveRoleProcessesQuantity(
                    role,
                    numOfBuilders,
                    bodyType,
                    15,
                    [
                        sourceEnergyTaskTicket,
                        new tasks.TaskTicket(
                            tasks.tasks.CYCLIC_BUILD_ROOM.name, {roomName: this.targetRoomName}
                        )
                    ],
                    this.targetRoomName,
                    currentLevel
                )
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

        get controllerRoom() {
            return this.controller.room
        }


        run() {
            if (!this.controller) {
                throw `Invalid controller id ${this.controllerId}.`
            }

            if (!this.ownerRoomName) {
                this.ownerRoomName = this.controllerRoom.name
            }

            let bodyType, currentLevel
            let numberOfUpgraders = 3  // by default there should be 3 upgraders

            const role = "upgrader"
            const roomsEnergyCapacityAvailable = this.controllerRoom.energyCapacityAvailable
            const energySourcingOption = processUtils.determineEnergyObtentionMethod(this.controllerRoom)
            const energySourcingTaskTicket = processUtils.getEnergySourcingTaskTicket(
                energySourcingOption,
                this.controllerRoom.name
            )

            if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                currentLevel = 1
                bodyType = "BASIC_WORKER_1"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                currentLevel = 2
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_2"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                currentLevel = 3
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_3"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                currentLevel = 4
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_4"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_6) {
                currentLevel = 5
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_5"
            }
            else {
                currentLevel = 6
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_6"
            }


            this.resolveRoleProcessesQuantity(
                role,
                numberOfUpgraders,
                bodyType,
                5,
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
    FeedManager: class extends BaseProcess {
        set targetRoomName(name) {
            this.data.targetRoomName = name
        }

        get targetRoomName() {
            return this.data.targetRoomName
        }


        get targetRoom() {
            return Game.rooms[this.targetRoomName]
        }

        run() {
            if (processUtils.checkContainerExists(this.ownerRoom)) {
                const sourceOption = processUtils.determineEnergyObtentionMethod(this.ownerRoom)
                const sourceEnergyTaskTicket = processUtils.getEnergySourcingTaskTicket(
                    sourceOption,
                    this.ownerRoomName
                )

                const role = "feeder"
                const roomECA = this.targetRoom.energyCapacityAvailable
                let bodyType, currentLevel

                if (roomECA < energyCapacityLevels.LEVEL_3) {
                    currentLevel = 1
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "FREIGHTER_2"
                }
                else if (roomECA < energyCapacityLevels.LEVEL_4) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "FREIGHTER_3"
                }
                else {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "FREIGHTER_4"
                }


                this.resolveRoleProcessesQuantity(
                    role,
                    config.MIN_NUM_OF_FEEDERS,
                    bodyType,
                    50,
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
                    currentLevel
                )
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

        get room() {
            return Game.rooms[this.roomName]
        }

        get orderBook() {
            if (!this.data.creepOrderBook) {
                this.data.creepOrderBook = []
            }
            return this.data.creepOrderBook
        }

        get towersIdsToProcessLabels() {
            if (!this.data.towersIdsToProcessLabels) {
                this.data.towersIdsToProcessLabels = {}
            }
            return this.data.towersIdsToProcessLabels
        }

        get towers() {
            return this.room.find(FIND_MY_STRUCTURES).filter(struct => struct.structureType === STRUCTURE_TOWER)
        }

        get managedTowersLabels() {
            return Object.keys(this.towersIdsToProcessLabels)
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
            // spawn
            const spawns = this.room.find(FIND_MY_SPAWNS)
            spawns.forEach(spawn => {
                try {
                    this._processNextCreepOrder(spawn)
                }
                catch (e) {
                    console.log(`Failed to spawn creep on room ${this.roomName}'s `
                        + `${spawn.name} spawn due to: ${e.stack}`)
                }
            })

            // init feed manager when needed
            if (processUtils.checkContainerExists(this.room)) {
                const FEED_MANAGER_PROC_LABEL = `feed_manager_of_room_${this.roomName}_${Game.time}`
                if (!Kernel.getProcessByLabel(FEED_MANAGER_PROC_LABEL)) {
                    console.log(`DEBUG Creating process ${FEED_MANAGER_PROC_LABEL}`)
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.FeedManager,
                        FEED_MANAGER_PROC_LABEL,
                        this.pid,
                        10
                    )
                    process.ownerRoomName = this.roomName
                    process.targetRoomName = this.roomName
                }
            }

            // init tower managers when needed
            if (this.towers.length > 0) {
                const unmanagedTowers = this.towers.filter(tower => this.managedTowersLabels.indexOf(tower.id) < 0)
                unmanagedTowers.forEach(tower => {
                    const label = `tower_manager_of_${tower.id}_from_${this.roomName}`
                    try {
                        const process = Kernel.scheduler.launchProcess(
                            Kernel.availableProcessClasses.TowerManager,
                            label,
                            this.pid,
                            15
                        )
                        process.towerId = tower.id
                        this.towersIdsToProcessLabels[process.towerId] = process.label
                    }
                    catch (e) {
                        console.log(`Failed to launch process ${label} due to: ${e.stack}.`)
                    }
                })
            }

            // init constructor manager when needed
            if (this.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                const CONSTRUCTION_MANAGER_PROC_LABEL = `construction_manager_of_${this.roomName}_${Game.time}`
                if (!Kernel.getProcessByLabel(CONSTRUCTION_MANAGER_PROC_LABEL)) {
                    console.log(`DEBUG Creating process ${CONSTRUCTION_MANAGER_PROC_LABEL}`)
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.ConstructionManager,
                        CONSTRUCTION_MANAGER_PROC_LABEL,
                        this.pid,
                        20
                    )
                    process.ownerRoomName = this.roomName
                    process.targetRoomName = this.roomName
                }
            }
        }
    },
    TowerManager: class extends BaseProcess {
        set towerId(id) {
            this.data.towerId = id
        }

        get towerId() {
            return this.data.towerId
        }

        get tower() {
            return Game.getObjectById(this.towerId)
        }

        get room() {
            return this.tower.room
        }

        run() {
            if (!this.tower) {
                throw `Invalid tower id ${this.towerId}.`
            }

            if (this.tower.energy > 0) {
                const crippledCreeps = this.room.find(FIND_MY_CREEPS)
                    .filter(creep => creep.hits < creep.hitsMax)
                    .sort(
                        // hits and target range weight in for increased tower effectiveness
                        (a, b) => a.hits * this.tower.pos.getRangeTo(a.pos)
                            - b.hits * this.tower.pos.getRangeTo(b.pos)
                    )
                const hostileCreeps = this.room.find(FIND_HOSTILE_CREEPS)
                    .sort(
                        // target range is determinant for max tower effectiveness
                        (a, b) => this.tower.pos.getRangeTo(a.pos)
                            - this.tower.pos.getRangeTo(b.pos)
                    )
                const damagedStructs = this.room.find(FIND_STRUCTURES)
                    .filter(
                        struct => {
                            if (struct.hits < struct.hitsMax) {
                                if (struct.structureType === STRUCTURE_TOWER) {
                                    return struct.hits < config.MAX_WALL_HITS_LIMIT
                                }
                                else if (struct.structureType === STRUCTURE_RAMPART) {
                                    return struct.hits < config.MAX_RAMPART_HITS_LIMIT
                                }
                                return true
                            }
                        }
                    )
                    .sort(
                        // hits and target range weight in for increased tower effectiveness
                        (a, b) => a.hits * this.tower.pos.getRangeTo(a.pos)
                            - b.hits * this.tower.pos.getRangeTo(a.pos)
                    )

                // heal first
                if (crippledCreeps.length > 0) {
                    this.tower.heal(crippledCreeps[0])
                }
                // attack second
                else if (hostileCreeps.length > 0) {
                    const res = this.tower.attack(hostileCreeps[0])

                    switch (res) {
                        case OK:
                            break
                        default:
                            console.log(`Failed to attack target ${hostileCreeps[0].name} due to err # ${res}`)
                    }
                }
                // repair last
                else if (damagedStructs.length > 0) {
                    this.tower.repair(damagedStructs[0])
                }
            }
        }
    },
}