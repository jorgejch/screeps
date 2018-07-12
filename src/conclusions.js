class Conclusion{
    conclude(creep){
        throw "Must be implemented by child."
    }
}

export class UnregisterAndAddCurrentTaskToQueueTop extends Conclusion{
        constructor(task) {
            super();
            this.task = task
        }

        conclude(creep) {
            creep.memory.taskTicketQueue.push(this.task)
            creep.memory.currentTaskTicket = null
        }
}

export class UnregisterCurrentTask extends Conclusion{
    conclude(creep){
        creep.memory.currentTaskTicket = null
    }
}


export class FooConclusion extends Conclusion{
    conclude(creep){
    }
}
