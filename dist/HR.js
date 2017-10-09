let hr;
module.exports = hr = {

    personelConfigurations: {
        peace: function () {
            let i;
            Memory.numGuards = 0;
            Memory.numHarvesters = 2;
            Memory.numCommuterHarvesters = 3;
            Memory.numBuilders = 0;
            Memory.numUpgraders = 4;
            Memory.numCommuterUpgraders = 4;
            Memory.numRepairmans = 0;

            if (Memory.builders.length > Memory.numBuilders) {
                for (i = Memory.numBuilders; i < Memory.builders.length; i++) {
                    if (Memory.upgraders.length < Memory.numUpgraders) {
                        Memory.builders[i].memory.role = "upgrader"
                    }
                    else {
                        break
                    }
                }
            }

            if (Memory.upgraders.length > Memory.numUpgraders) {
                for (i = Memory.numUpgraders; i < Memory.upgraders.length; i++) {
                    if (Memory.builders.length < Memory.numBuilders) {
                        Memory.upgraders[i].memory.role = "builder"
                    }
                    else {
                        break
                    }
                }
            }
        },
        war: function (num_hostiles) {
            Memory.numGuards = num_hostiles;
            Memory.numHarvesters = 2;
            Memory.numCommuterHarvesters = 0;
            Memory.numBuilders = 0;
            Memory.numUpgraders = 1;
            Memory.numCommuterUpgraders = 0;
            Memory.numBuilders = 0;
            Memory.numRepairmans = 2;
        },
    },
    updateNumOfCreepsByRoles: function () {
        Memory.guards = _.filter(Game.creeps, {memory: {role: 'guard'}});
        Memory.builders = _.filter(Game.creeps, {memory: {role: 'builder'}});
        Memory.harvesters = _.filter(Game.creeps, {memory: {role: 'harvester', subrole:'local'}});
        Memory.commuterHarvesters = _.filter(Game.creeps, {memory: {role: 'harvester', subrole: 'commuter'}});
        Memory.upgraders = _.filter(Game.creeps, {memory: {role: 'upgrader'}});
        Memory.commuterUpgraders = _.filter(Game.creeps, {memory: {role: 'upgrader', subrole: 'commuter'}});
        Memory.repairmans = _.filter(Game.creeps, {memory: {role: 'repairman'}});
    },
    setRoles: function (num_hostiles) {
        if (num_hostiles) {
            hr.personelConfigurations.war(num_hostiles);
        }
        else {
            hr.personelConfigurations.peace();
        }
    }
};