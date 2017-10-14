let hr;
module.exports = hr = {
    personelConfigurations: {
        peace: function () {
            Memory.numGuards = 0;
            Memory.numHarvesters = 3;
            Memory.numCommuterHarvesters = 2;
            Memory.numBuilders = 2;
            Memory.numUpgraders = 6;
            Memory.numCommuterUpgraders = 4;
            Memory.numRepairmans = 0;
            Memory.numConquerors = 0;
        },
        war: function (num_hostiles) {
            Memory.numGuards = num_hostiles > 2 ? num_hostiles : 0;
            Memory.numHarvesters = 3;
            Memory.numCommuterHarvesters = 0;
            Memory.numBuilders = 1;
            Memory.numUpgraders = 0;
            Memory.numCommuterUpgraders = 0;
            Memory.numRepairmans = 1;
            Memory.numConquerors = 0;
        },
    },
    updateCreepsRolesCount: function () {
        Memory.guards = _.filter(Game.creeps, {memory: {role: 'guard'}});
        Memory.builders = _.filter(Game.creeps, {memory: {role: 'builder'}});
        Memory.harvesters = _.filter(Game.creeps, {memory: {role: 'harvester', subrole:'local'}});
        Memory.commuterHarvesters = _.filter(Game.creeps, {memory: {role: 'harvester', subrole: 'commuter', target: "W71S76"}});
        Memory.upgraders = _.filter(Game.creeps, {memory: {role: 'upgrader', subrole: 'local'}});
        Memory.commuterUpgraders = _.filter(Game.creeps, {memory: {role: 'upgrader', subrole: 'commuter'}});
        Memory.repairmans = _.filter(Game.creeps, {memory: {role: 'repairman'}});
        Memory.conquerors = _.filter(Game.creeps, {memory: {role: 'conqueror'}});
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