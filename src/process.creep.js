'use strict'

const BaseProcess = require("./process.baseProcess")
const tasks = require("./creep.tasks")
const creepSpawner = require("./util.creepSpawner")

module.exports = {
    CreepManager: class extends BaseProcess {

        set creepName(name) {
            this.data.creepName = name
        }

        get creepName() {
            return this.data.creepName
        }

        get creep() {
            return Game.creeps[this.creepName]
        }

        set creepType(type) {
            this.data.creepType = type
        }

        get creepType() {
            return this.data.creepType
        }

        set initialTaskTicketQueue(queue) {
            this.data.initialTaskTicketQueue = queue
        }

        get initialTaskTicketQueue() {
            return this.data.initialTaskTicketQueue
        }

        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        set spawningPriority(num) {
            this.data.spawningPriority = num
        }

        get spawningPriority() {
            return this.data.spawningPriority
        }

        getCurrentTaskTicket() {
            if (!this.creep.memory.currentTaskTicket) {
                if (this.initialTaskTicketQueue.length > 0) {
                    console.log(`Picking up next task ticket for creep ${this.creep.name}`)
                    this.creep.memory.currentTaskTicket = this.creep.memory.taskTicketQueue.shift()
                }
                else {
                    console.log(`No tasks for ${this.creep.name}. Creep  Idle.`)
                }
            }
            return this.creep.memory.currentTaskTicket
        }

        executeCurrentTask() {
            const name = this.getCurrentTaskTicket(this.creep).taskName
            // console.log(`DEBUG ${this.creep.name}  is to execute task name: ${name}`)
            const taskFunc = tasks.tasks[name].taskFunc
            taskFunc(this.creep)
        }

        set dieAfterCreep(val) {
            this.data.dieAfterCreep = val
        }

        isDieAfterCreep() {
            return this.data.dieAfterCreep
        }

        set creepBorn(bl) {
            this.data.creepBorn = bl
        }

        isCreepBorn() {
            return this.data.creepBorn
        }

        die() {
            if (this.creep) {
                this.creep.suicide()
            }
            super.die()
        }

        run() {
            if (this.creep) {
                if (!this.creep.spawning) {
                    this.creepBorn = true

                    try {
                        this.executeCurrentTask()
                    }
                    catch (e) {
                        console.log(`Failed to execute current task for creep ${this.creepName} due to: ${e.stack}`)
                    }
                }
            }
            else if (this.isDieAfterCreep() && this.isCreepBorn()) {
                this.die()
            }
            else {
                this.creepBorn = false
                const ownerManagerLabel = `${this.ownerRoomName}_governor`
                const ownerManager = Kernel.getProcessByLabel(ownerManagerLabel)

                if (!ownerManager) {
                    throw `${ownerManagerLabel} process does not exist.`
                }

                if (!ownerManager.isOrderForCreepNameInOrderBook(this.creepName)) {
                    ownerManager.addOrderForCreep(
                        new creepSpawner.CreepOrder(
                            this.creepType,
                            this.creepName,
                            this.initialTaskTicketQueue,
                            this.spawningPriority
                        )
                    )
                }
            }
        }
    },
}