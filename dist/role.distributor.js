const rolesUtils = require("RolesUtils");
const generalUtils = require("GeneralUtils");

let distributorRole;
module.exports = distributorRole = {
    run: function (creep, roomName, targetBuilder) {
        if (creep.memory.collecting && _.sum(creep.carry) > 0) {
            creep.memory.collecting = false;
            creep.say("charge")
        }
        else if (!creep.memory.collecting && _.sum(creep.carry) === 0) {
            creep.memory.collecting = true;
            creep.say("collecting");
        }

        if (creep.memory.collecting) {
            rolesUtils.collect(creep, Game.rooms[roomName], creep.memory.resourceType, null, "#17ff06");
        } else {
            /*
                all local harvesters should be present and all extensions filled
                to allow also charging towers when no structure is critical or at peace time
             */
            const resourceType = Object.keys(creep.carry).filter(k => creep.carry[k] > 0)[0];
            const target = targetBuilder(creep, roomName, resourceType);

            if (target !== undefined) {
                console.log(resourceType);
                const r = creep.transfer(target, resourceType);

                switch (r) {
                    case OK:
                    case ERR_BUSY:
                        break;
                    case ERR_NOT_IN_RANGE :
                        const rr = creep.moveTo(target, {visualizePathStyle: {stroke: '#17ff06'}});
                        if (rr !== OK) {
                            console.log(`Unable to move to source due to ${rr}`)
                        }
                        break;
                    default:
                        console.log(`Unable to transfer due to ${r}`);
                }
            }
            else {
                console.log(`${creep.name} can't find any containers to draw from.`)
            }
        }
    }
};