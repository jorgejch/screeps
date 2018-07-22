const BaseProcess = require("process.base")
const creepSpawner = require("util.creepSpawner")
const energyCapacityLevels = require("util.energyCapacityLevels")
const tasks = require("creep.tasks");
const processUtils = require('util.process')
const config = require("config")

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

                const sourceOption = processUtils.determineEnergyObtentionMethod(this.ownerRoom)
                const sourceEnergyTaskTicket = processUtils.getEnergySourcingTaskTicket(sourceOption, this.ownerRoomName)
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

                while (this.childLabels.length < numOfBuilders) {
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

                        // the constructor cyclically sources energy and builds the target room
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

            let upgraderbodyType
            let numberOfUpgraders = 3  // by default there should be 3 upgraders

            const roomsEnergyCapacityAvailable = this.room.energyCapacityAvailable
            const energySourcingOption = processUtils.determineEnergyObtentionMethod(this.room)
            const energySourcingTaskTicket = processUtils.getEnergySourcingTaskTicket(
                energySourcingOption,
                this.room.name
            )

            if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                upgraderbodyType = "BASIC_WORKER_1"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                upgraderbodyType = "BASIC_WORKER_2"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                upgraderbodyType = "BASIC_WORKER_3"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                upgraderbodyType = "BASIC_WORKER_4"
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_6) {
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

                    // the upgrader cyclically sources energy and upgrades the room controller
                    process.initialTaskTicketQueue = [
                        energySourcingTaskTicket,
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
                    console.log(`DEBUG here ${JSON.stringify(hostileCreeps)}`)
                    const res = this.tower.attack(hostileCreeps[0])

                    switch (res){
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
            if (room.find(FIND_CONSTRUCTION_SITES).length > 0) {
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

            // init tower managers when needed
            if (this.towers.length > 0) {
                const unmanagedTowers = this.towers.filter(tower => this.managedTowersLabels.indexOf(tower.id) < 0)
                unmanagedTowers.forEach(tower => {
                    const label = `tower_manager_of_tower_${tower.id}_on_room_${this.roomName}`
                    try {
                        const process = Kernel.scheduler.launchProcess(
                            Kernel.availableProcessClasses.TowerManager,
                            label,
                            this.pid,
                            50
                        )
                        process.towerId = tower.id
                        this.towersIdsToProcessLabels[process.towerId] = process.label
                    }
                    catch(e){
                        console.log(`Failed to launch process ${label} due to: ${e.stack}.`)
                    }
                })
            }
        }
    }
}