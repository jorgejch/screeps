export function performNextTask(creep) {
    const queue = creep.memory.taskTicketQueue
    const nextTicket = queue.shift()
    if (nextTicket) {
        creep.memory.currentTaskTicket = nextTicket
    }
    else {
        throw `Creep ${creep.name} has no task to execute.`
    }
}
export function addCurrentTaskToTopOfQueueAndPerformNextTask(creep, task) {
    const queue = creep.memory.taskTicketQueue
    queue.push(task)
    performNextTask(creep)
}