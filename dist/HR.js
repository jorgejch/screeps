let hr;
module.exports = hr = {
    personelConfigurations: {
        peace: function () {
            Memory.numGuards = 0;
            Memory.numHarvesters = 3;
            Memory.numCommuterHarvesters = 3;
            Memory.numBuilders = 1;
            Memory.numUpgraders = 4;
            Memory.numCommuterUpgraders = 3;
            Memory.numRepairmans = 0;
        },
        war: function (num_hostiles) {
            Memory.numGuards = num_hostiles;
            Memory.numHarvesters = 3;
            Memory.numCommuterHarvesters = 0;
            Memory.numBuilders = 0;
            Memory.numUpgraders = 0;
            Memory.numCommuterUpgraders = 0;
            Memory.numBuilders = 0;
            Memory.numRepairmans = 1;
        },
    },
    updateNumOfCreepsByRoles: function () {
        Memory.guards = _.filter(Game.creeps, {memory: {role: 'guard'}});
        Memory.builders = _.filter(Game.creeps, {memory: {role: 'builder'}});
        Memory.harvesters = _.filter(Game.creeps, {memory: {role: 'harvester', subrole:'local'}});
        Memory.commuterHarvesters = _.filter(Game.creeps, {memory: {role: 'harvester', subrole: 'commuter'}});
        Memory.upgraders = _.filter(Game.creeps, {memory: {role: 'upgrader', subrole: 'local'}});
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