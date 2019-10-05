const ActivityDirectorProcess = require("./process.activityDirectorProcess")
const creepSpawner = require("./util.creepSpawner")
const energyCapacityLevels = require("./util.energyCapacityLevels")
const tasks = require("./creep.tasks")
const processUtils = require('./util.process')
const config = require("./config")
const generalUtils = require("./util.general")

module.exports = {
    GuardManager: class extends ActivityDirectorProcess.ActivityDirectorProcess(BaseProcess) {
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
            } else {
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
                } catch (e) {
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
                        Kernel.availableProcessClasses.LoadEnergyManager,
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
                    } catch (e) {
                        console.log(`Failed to launch process ${label} due to: ${e.stack}.`)
                    }
                })
            }

            // init constructor manager when needed
            const CONSTRUCTION_MANAGER_PROC_LABEL = `construction_manager_of_${this.roomName}_from_${this.roomName}`
            if (
                this.room.find(FIND_CONSTRUCTION_SITES).length > 0 &&
                !Kernel.getProcessByLabel(CONSTRUCTION_MANAGER_PROC_LABEL)
            ) {
                const process = Kernel.scheduler.launchProcess(
                    Kernel.availableProcessClasses.ConstructionManager,
                    CONSTRUCTION_MANAGER_PROC_LABEL,
                    this.pid,
                    20
                )
                process.ownerRoomName = this.roomName
                process.targetRoomName = this.roomName
            }

            // init repair manager when needed
            const REPAIR_MANAGER_PROC_LABEL = `repair_manager_of_${this.roomName}`
            if (this.towers.length === 0 && !Kernel.getProcessByLabel(REPAIR_MANAGER_PROC_LABEL)) {
                const process = Kernel.scheduler.launchProcess(
                    Kernel.availableProcessClasses.RepairManager,
                    REPAIR_MANAGER_PROC_LABEL,
                    this.pid,
                    21
                )
                process.ownerRoomName = this.roomName
                process.targetRoomName = this.roomName

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
                                } else if (struct.structureType === STRUCTURE_RAMPART) {
                                    return struct.hits < config.MAX_RAMPART_HITS_LIMIT
                                        || (processUtils.getRoomStorage(this.room)
                                            && processUtils.checkStorageStoreAboveThreshold(this.room))
                                } else {
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