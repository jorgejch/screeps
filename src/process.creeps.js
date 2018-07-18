import {BaseProcess} from "./process.base";
import ProcessState from "./os.processState";
import * as tasks from "creep.tasks"

export class CreepManager extends BaseProcess {

    set creepName(name){
        this.data.creepName = name
    }

    get creepName(){
        return this.data.creepName
    }

    get creep(){
        return Game.creeps[this.creepName]
    }

    getCurrentTaskTicket(){
        if (!this.creep.memory.currentTaskTicket) {
            if (this.creep.memory.taskTicketQueue.length > 0) {
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
        const taskFunc = tasks[Creep.getCurrentTaskTicket(this.creep).taskName].taskFunc
        taskFunc(this.creep)
    }

    die(){
        super.die()
        delete Memory.creeps[this.creepName]
    }

    run() {
        if (!this.creep){
            this.die()
        }

        try {
            this.executeCurrentTask()
        }
        catch (e) {
            console.log(`Failed to execute current task for creep ${this.creepName} due to: ${e.stack}`)
        }

        this.state = ProcessState.WAIT
    }
}