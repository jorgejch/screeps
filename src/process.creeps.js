'use strict'
const BaseProcess = require("process.base")
const processStates = require("os.processState")
const tasks = require("creep.tasks")
const creepSpawner = require("util.creepSpawner")

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
            const taskFunc = tasks.tasks[this.getCurrentTaskTicket(this.creep).taskName].taskFunc
            taskFunc(this.creep)
        }

        die() {
            super.die()
            delete Memory.creeps[this.creepName]
        }

        run() {
            if (this.creep) {
                try {
                    this.executeCurrentTask()
                }
                catch (e) {
                    console.log(`Failed to execute current task for creep ${this.creepName} due to: ${e.stack}`)
                }
            } else {
                const ownerManagerLabel = `${this.ownerRoomName}_manager`
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
            this.state = processStates.WAIT
        }
    }
}