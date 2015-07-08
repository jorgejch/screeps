/**
 * Created by jorge on 7/6/15.
 */

module.exports = function(creep, spawn){
    var sources = creep.room.find(FIND_SOURCES);

    if (creep.energy < creep.energyCapacity){
        creep.moveTo(sources[0]);
        creep.harvest(sources[0]);
    } else {
        creep.moveTo(spawn);
        creep.transferEnergy(spawn);
    }
}