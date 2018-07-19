module.exports = {
    performNextTask: function(creep) {
        const queue = creep.memory.initialTaskTicketQueue
        const nextTicket = queue.shift()
        if (nextTicket) {
            creep.memory.currentTaskTicket = nextTicket
        }
        else {
            throw `Creep ${creep.name} has no task to execute.`
        }
    },
    addCurrentTaskToTopOfQueueAndPerformNextTask: function(creep, task) {
        const queue = creep.memory.initialTaskTicketQueue
        queue.push(task)
        this.performNextTask(creep)
    }
}