module.exports = {
    run : function(creep, room){
        const targets = creep.room.find(FIND_HOSTILE_CREEPS);

        if (targets.length){
            if (creep.attack(targets[0]) === ERR_NOT_IN_RANGE){
                creep.moveTo(targets[0]);
                creep.say("To enemy!")
            }
            else {
                creep.say("Attacking.")
            }
        }
    }
};