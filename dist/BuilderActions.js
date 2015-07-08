/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builder'); // -> 'a thing'
 */

module.exports = function(creep, spawn){
    var harvesters = _.filter(Game.creeps,{ memory : {role: 'harvester'}});



    if (harvesters.length < Memory.minHarvesters){
        return;
    }

    if (creep.energy === 0){
        creep.moveTo(spawn);
        spawn.transferEnergy(creep);
    }else {
        //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (creep.room.controller && creep.room.controller.level < 3){
            creep.moveTo(creep.room.controller);
            creep.upgradeController(creep.room.controller);
        }
    }
}