import {BaseProcess} from "./process.base";
import ProcessState from "./os.processState";
import * as tasks from "creep.tasks"
import {CreepOrder} from "./util.creepSpawner";

export class CreepManager extends BaseProcess {

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
                this.creep.memory.currentTaskTicket = this.creep.memory.initialTaskTicketQueue.shift()
            }
            else {
                console.log(`No tasks for ${this.creep.name}. Creep  Idle.`)
            }
        }
        return this.creep.memory.currentTaskTicket
    }

    executeCurrentTask() {
        const taskFunc = tasks[Creep.getCurrentTaskTicket(this.creep).taskName].taskFunc
        taskFunc(this.creep)
    }

    die() {
        super.die()
        delete Memory.creeps[this.creepName]
    }

    run() {

        console.log(`DEBUG ${JSON.stringify(this.creep)}`)
        if (!this.creep) {
            try {
                this.executeCurrentTask()
            }
            catch (e) {
                console.log(`Failed to execute current task for creep ${this.creepName} due to: ${e.stack}`)
            }
        } else {
            const ownerManagerLabel = `${this.ownerRoomName}_manager`
            const ownerManager = Kernel.scheduler.getProcessByLabel(ownerManagerLabel)

            if (!ownerManager) {
                throw `${ownerManagerLabel} process does not exist.`
            }

            if (!ownerManager.isOrderForCreepNameInOrderBook(this.creepName)) {
                ownerManager.addOrderForCreep(
                    new CreepOrder(
                        this.creepType,
                        this.creepName,
                        this.initialTaskTicketQueue,
                        0
                    )
                )
            }
        }
        this.state = ProcessState.WAIT
    }
}