/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.guard');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run : function(creep){
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);

        if (targets.length){
            if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(targets[0]);
                creep.say("To enemy!")
            }
            else {
                creep.say("Attacking.")
            }
        }
    }
};