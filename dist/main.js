module.exports.loop = function () {

    Object.values(Game.rooms).forEach(
        function (room) {
            console.log(`On room ${room.name}.`)

            if (!"rules" in room.memory) {
                throw `Missing rules array in room ${room.name}'s memory.`
            }

            // verify rules compliance and rectify when verification fails
            room.memory.rules.forEach(function (rule) {
                if (!rule.verify(room)){
                    rule.rectify(room)
                }
            })

        }
    );


    Object.values(Game.creeps).forEach(
        function (creep, creepIndex, creeps) {
            console.log(`Creep ${creep.name} reporting for service.`)
        }
    )
}