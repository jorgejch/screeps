const activities = require('activities')
const conclusions = require('conclusions')
const doneCriterias = require('doneCriterias')

class Task{
    constructor(activity, doneCriteria, conclusion){
        this.activity = activity
        this.doneCriteria = doneCriteria
        this.conclusion = conclusion
    }
    performTask(creep){
        if (this.doneCriteria.check(creep)){
            this.conclusion.conclude(creep)
            return
        }

        this.activity.perform(creep)
    }
}
module.exports = {
    getBasicHarvestEnergyFromSourceTask: function(source, transferTask){
        return new Task(
            new activities.HarvestEnergyFromSource(source),
            new doneCriterias.CreepIsFull(),
            new conclusions.PerformAnotherTask(transferTask)
        )
    },
    getTransferEnergyToSpawnersOrExtentionsTask: function (harvestTask) {
        return new Task(
            new activities.TransferAllResourceToSpawnersOrExtentions(target, RESOURCE_ENERGY),
            new doneCriterias.CreepResourceIsEmpty(RESOURCE_ENERGY),
            new conclusions.PerformAnotherTask(harvestTask)
        )

    }
}
// const transferActivity = new activities.TransferAllResourceToTarget(target, RESOURCE_ENERGY)
// const transferDoneCriteria = new doneCriterias.CreepResourceIsEmpty(RESOURCE_ENERGY)
