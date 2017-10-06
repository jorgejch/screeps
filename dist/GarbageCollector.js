module.exports = {
    clearDeadScreepsFromMemory : function(){
        let i;
        for(i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }
};