'use strict'

module.exports = {
    performNextTask: function(creep) {
        const queue = creep.memory.taskTicketQueue
        const nextTicket = queue.shift()
        if (nextTicket) {
            creep.memory.currentTaskTicket = nextTicket
        }
        else {
            throw `Creep ${creep.name} has no task to execute.`
        }
    },
    addCurrentTaskToTopOfQueueAndPerformNextTask: function(creep, task) {
        const queue = creep.memory.taskTicketQueue
        queue.push(task)
        this.performNextTask(creep)
    }
}