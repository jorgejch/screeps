const taskFactory = require("tasksFactory")
module.exports = {
    PerformAnotherTask: class {
        constructor (task) {
            this.task = task
        }

        conclude(creep){
            creep.memory.task = taskFactory.getTransferEnergyToSpawnersOrExtentionsTask()
        }
    }
}