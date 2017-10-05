module.exports = {
    run : function(){
        let i;
        for(i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }
};