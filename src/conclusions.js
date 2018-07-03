export class UnregisterAndAddCurrentTaskToQueueTop {
        constructor(task) {
            this.task = task
        }

        conclude(creep) {
            creep.memory.taskTicketQueue.push(this.task)
            creep.memory.currentTaskTicket = null
        }
}