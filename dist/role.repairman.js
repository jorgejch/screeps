let repairman_role;
module.exports = repairman_role = {
    utils: {
        assign_subrole: function (creep) {
            if (!_.filter(Memory.repairmans, {memory: {subrole: "defense"}}).length === 1) {
                creep.memory.subrole = "defense"
            }
            else if (!_.filter(Memory.repairmans, {memory: {subrole: "roads"}}).length === 1) {
                creep.memory.subrole = "roads"
            }
        },
        default_sort_by_criteria: function (structure) {
            return structure.hitsMax - structure.hits;
        }
    },
    run: function (creep, room) {
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("repair")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say("harvest")

        }

        if (creep.memory.harvesting) {
            const sources = room.find(FIND_SOURCES);
            if (creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#49d1ff'}});   // com traço
            }

        } else {
            repairman_role.utils.assign_subrole(creep);

            let target;
            // exclusive does only my stuff
            if (creep.memory.subrole === "defense") {
                target = _.sortBy(room.find(FIND_STRUCTURES,
                    {
                        filter: (structure) => (structure.structureType === STRUCTURE_WALL ||
                            structure.structureType === STRUCTURE_RAMPART ) && (structure.hits < structure.hitsMax)
                    },
                    repairman_role.utils.default_sort_by_criteria))
            }
            else if (creep.memory.subrole === "roads" ){
                target = _.sortBy(room.find(FIND_STRUCTURES,
                    {
                        filter: (structure) => (structure.structureType === STRUCTURE_ROADS) &&
                            (structure.hits < structure.hitsMax)
                    }), repairman_role.utils.default_sort_by_criteria)
            }
            else {      // the "all" that is not so all
                target = _.sortBy(room.find(FIND_STRUCTURES,
                    {
                        filter: (structure) => (structure.hits < structure.hitsMax) &&
                            (structure.structureType !== STRUCTURE_RAMPART && structure.structureType !== STRUCTURE_ROAD)
                    }), repairman_role.utils.default_sort_by_criteria)
            }

            if (target.length) {
                if (creep.repair(target[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target[0], {visualizePathStyle: {stroke: '#251cff'}})
                }
            }
            else {
                console.log(`${creep.name + "|" + creep.memory.subrole} has nothing to repair.`)
            }
        }
    }
};