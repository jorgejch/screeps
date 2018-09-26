const BaseProcess = require("process.base")
const creepSpawner = require("util.creepSpawner")
const energyCapacityLevels = require("util.energyCapacityLevels")
const tasks = require("creep.tasks");
const processUtils = require('util.process')
const config = require("config")
const mixins = require("process.mixins")
const generalUtils = require("util.general");
const obtainEnergyOptions = require("util.obtainEnergyOptions")

module.exports = {
    ConstructionManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
        run() {
            const role = "builder"
            this.cleanRoleDeadProcesses(role)
            const targetRoomConstructionSites = Object.values(Game.constructionSites)
                .filter(cs => cs.pos.roomName === this.targetRoomName)

            if (targetRoomConstructionSites.length > 0) {
                const ownerRoomSourceOption = processUtils.determineDefaultRoomEnergyObtentionMethod(this.ownerRoom)
                const targetRoomSourceOption = processUtils.determineDefaultRoomEnergyObtentionMethod(this.targetRoom)
                let sourceOption, sourceRoomName

                // // rather than harvest on the target leech from owner
                // if (
                //     targetRoomSourceOption === obtainEnergyOptions.HARVEST
                //     && ownerRoomSourceOption !== obtainEnergyOptions.HARVEST
                // ) {
                //     sourceOption = ownerRoomSourceOption
                //     sourceRoomName = this.ownerRoomName
                // } else {
                //     sourceOption = targetRoomSourceOption
                //     sourceRoomName = this.targetRoomName
                // }

                sourceOption = targetRoomSourceOption
                sourceRoomName = this.targetRoomName

                const sourceEnergyTaskTicket = processUtils.getDefaultEnergySourcingTaskTicket(sourceOption, sourceRoomName)
                const energyCapacityAvailable = this.ownerRoom.energyCapacityAvailable
                const totalProgressReq = _.sum(targetRoomConstructionSites, cs => cs.progressTotal)
                let bodyType, currentLevel, numOfCreeps

                if (energyCapacityAvailable < energyCapacityLevels.LEVEL_2) {
                    bodyType = "BASIC_WORKER_1"
                    currentLevel = 1
                    numOfCreeps = targetRoomConstructionSites.length > 3 ? 3 : 1
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_2"
                    /*
                        CS progress cost examples:
                        road = 300 or 1500
                        extension = 3000
                     */
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*1 extension*/ 3000), 3)
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_3"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*2 extensions*/ 6000), 2)
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                    currentLevel = 4
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_4"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*5 extentensions*/ 15000), 2)
                }
                else {
                    currentLevel = 5
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_5"
                    numOfCreeps = 1 + Math.min(Math.trunc(totalProgressReq / /*10 extensions*/ 30000), 1)
                }

                this.resolveRoleProcessesQuantity(
                    role,
                    numOfCreeps,
                    bodyType,
                    15,
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
    },
    ControllerUpgradeManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
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
                numberOfUpgraders = 3
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                currentLevel = 2
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_2"
                numberOfUpgraders = 3
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                currentLevel = 3
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_3"
                numberOfUpgraders = 4
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                currentLevel = 4
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_4"
                numberOfUpgraders = 4
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_6) {
                currentLevel = 5
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_5"
                numberOfUpgraders = 3
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_7) {
                currentLevel = 6
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_6"
                numberOfUpgraders = 3
            }
            else if (roomsEnergyCapacityAvailable < energyCapacityLevels.LEVEL_8) {
                currentLevel = 7
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_7"
                numberOfUpgraders = 3
            }
            else if (processUtils.checkRoomHasLinkCloseToController(this.controllerRoom)) {
                currentLevel = 7
                this.resolveLevelForRole(role, currentLevel)
                bodyType = "BASIC_WORKER_7"
                numberOfUpgraders = 3
            }
            else {
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
    FeedManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
        run() {
            const role = "feeder"
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
                }
                else {
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
                    100  // space orders to prevent feeders dying together
                )
            }
        }
    },
    GuardManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
        run() {
            const guardRole = "guard"
            const scoutRole = "scout"
            this.cleanRoleDeadProcesses(guardRole)
            this.cleanRoleDeadProcesses(scoutRole)

            // send scout if target room is not visible
            if (!Game.rooms[this.targetRoomName]) {
                const rallyFlag = generalUtils.getRoomRallyFlag(this.targetRoomName)
                const scoutBodyType = "SCOUT_1"

                this.resolveRoleProcessesQuantity(
                    scoutRole,
                    1,
                    scoutBodyType,
                    2,
                    [new tasks.TaskTicket(
                        tasks.tasks.GO_CLOSE_TO_TARGET.name,
                        {range: 1, targetPosParams: rallyFlag.pos}
                    )],
                    this.targetRoomName,
                    1
                )
                this.setAllRoleProcessesToDieAfterCreep(scoutRole)
                console.log(`Target room ${this.targetRoomName} is not visible. Sending scout.`)
                return
            }

            const hostiles = generalUtils.findHostiles(this.targetRoom)
            // send guard if hostile in room
            if (hostiles.length > 0) {
                const guardBodyType = "ATTACKER_3"

                this.resolveRoleProcessesQuantity(
                    guardRole,
                    1,
                    guardBodyType,
                    3,
                    [new tasks.TaskTicket(
                        tasks.tasks.GUARD_ROOM.name,
                        {roomName: this.targetRoomName}
                    )],
                    this.targetRoomName,
                    1
                )
                this.setAllRoleProcessesToDieAfterCreep(guardRole)
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

        _processNextCreepOrder(spawn) {
            const order = this.orderBook.sort((a, b) => a.priority - b.priority)[0]
            if (order) {
                creepSpawner.executeOrder(order, spawn, this.orderBook)
            }
        }

        _printStats() {
            const idnt = "    "
            let message = `\n*** ${this.roomName} Stats ***\n`

            message += `${idnt}Spawns and Extensions\n${idnt}${idnt}spawns and exts energy avail/capacity:`
                + ` ${this.room.energyAvailable}/${this.room.energyCapacityAvailable}\n`

            // add storage content
            if (processUtils.getRoomStorage(this.room)) {
                const storage = this.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_STORAGE)[0]
                message += `${idnt}${idnt}storage total consumed/capacity: `
                    + `${_.sum(storage.store)}/${storage.storeCapacity}\n`
                Object.keys(storage.store).forEach(resourceKey => {
                    message = message + `${idnt}${idnt}${resourceKey} amount: ${storage.store[resourceKey]}\n`
                })
            }
            // add orderbook content
            message += `${idnt}Orderbook\n`
            if (this.orderBook.length > 0) {
                this.orderBook.forEach(order => {
                    message += `${idnt}${idnt}Name: ${order.name} | Type: ${order.type} | Priority: ${order.priority}\n`
                })
            }
            else {
                message += `${idnt}${idnt}Empty`
            }
            console.log(message)
        }

        addOrderForCreep(order) {
            creepSpawner.addOrderForCreepInOrderBook(order, this.orderBook)
        }

        isOrderForCreepNameInOrderBook(creepName) {
            return !!this.orderBook.find(order => order.name === creepName)
        }

        run() {
            this._printStats() // print stat before spawning so order gets outputted before consumed

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
            if (this.room.energyCapacityAvailable >= energyCapacityLevels.LEVEL_2) {
                const FEED_MANAGER_PROC_LABEL = `feed_manager_of_room_${this.roomName}_from_${this.roomName}`
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
                    const label = `tower_manager_of_${tower.id}_on_${this.roomName}`
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
                const CONSTRUCTION_MANAGER_PROC_LABEL = `construction_manager_of_${this.roomName}_from_${this.roomName}`
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
    RepairManager: class extends mixins.ActivityDirectorProcess(BaseProcess) {
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
                        }
                        else if (struct.structureType === STRUCTURE_RAMPART) {
                            return struct.hits < config.MAX_RAMPART_HITS_LIMIT / 3
                        }
                        else if (struct.structureType === STRUCTURE_CONTAINER) {
                            // TODO: as a migration right side dividend has to be slowly brought to 1
                            return struct.hits < struct.hitsMax / 10
                        }
                        else {
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
                    numOfCreeps = 1 + Math.min(Math.trunc(damagedStructuresAtThreshold.length / 5), 3)
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_3) {
                    currentLevel = 2
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_2"
                    numOfCreeps = 1 + Math.min(Math.trunc(damagedStructuresAtThreshold.length / 5), 2)
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_4) {
                    currentLevel = 3
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_3"
                    numOfCreeps = 1 + Math.min(Math.trunc(damagedStructuresAtThreshold.length / 5), 1)
                }
                else if (energyCapacityAvailable < energyCapacityLevels.LEVEL_5) {
                    currentLevel = 4
                    this.resolveLevelForRole(role, currentLevel)
                    bodyType = "BASIC_WORKER_4"
                    numOfCreeps = 1
                }
                else {
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
                this.die()
                return
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
                                if (struct.structureType === STRUCTURE_WALL) {
                                    return struct.hits < config.MAX_WALL_HITS_LIMIT
                                        || (processUtils.getRoomStorage(this.room)
                                            && processUtils.checkStorageStoreAboveThreshold(this.room))
                                }
                                else if (struct.structureType === STRUCTURE_RAMPART) {
                                    return struct.hits < config.MAX_RAMPART_HITS_LIMIT
                                        || (processUtils.getRoomStorage(this.room)
                                            && processUtils.checkStorageStoreAboveThreshold(this.room))
                                }
                                else {
                                    return true
                                }
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