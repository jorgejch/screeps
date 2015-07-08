/**
 * Created by jorge on 7/6/15.
 */

module.exports = function(creep,spawn){
    var targets = creep.room.find(FIND_HOSTILE_CREEPS);

    if (targets.length) {
        if (targets.length){
            creep.moveTo(targets[0]);
            creep.attack(targets[0]);
        }
    }
}
