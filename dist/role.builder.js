/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(creep){
        var room = creep.room
        
        if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity){
            creep.memory.harvesting = false
            creep.say("build")
        }
        else if (!creep.memory.harvesting && creep.carry.energy == 0){
            creep.memory.harvesting = true
            creep.say("harvest")
        }
        
        if (creep.memory.harvesting){
            var sources = room.find(FIND_SOURCES);

            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#fff'}});
            }
        }
        else {
            var targets = room.find(FIND_CONSTRUCTION_SITES)
                
            if (targets.length){
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff0'}});
                }
            }
            else{
                console.log("Nothing to build. Moving to BuilderPoint.")
                creep.moveTo(Game.flags.BuilderPoint)
            }
        }        
    }
};