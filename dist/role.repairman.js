let repairmanRole;
module.exports = repairmanRole = {
    assign_subrole: function (creep) {
        if (_.filter(Memory.repairmans, {memory: {subrole: "all"}}).length > 1) {
            if (_.filter(Memory.repairmans, {memory: {subrole: "defense"}}).length < 1) {
                creep.memory.subrole = "defense"
                console.log(`${creep.name} assigned to defense.`)
            }
            else if (_.filter(Memory.repairmans, {memory: {subrole: "roads"}}).length < 1) {
                creep.memory.subrole = "roads"
                console.log(`${creep.name} assigned to roads.`)
            }
        }
    },
    run: function (creep, roomSource, roomTarget) {
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("repair")
        }
        else if (!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
            creep.say("harvest")
        }

        if (creep.memory.harvesting) {
            const sources = roomSource.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#49d1ff'}});   // com traço
            }

        } else {
            let target;
            // obtain possible targets based on subroles
            if (creep.memory.subrole === "defense") {
                target = roomTarget.find(FIND_STRUCTURES,
                    {
                        filter: (structure) => (structure.structureType === STRUCTURE_WALL ||
                            structure.structureType === STRUCTURE_RAMPART )
                            && (structure.hits < structure.hitsMax)
                            && (structure.hits < 20000)
                    });
            }
            else if (creep.memory.subrole === "roads") {
                target = roomTarget.find(FIND_STRUCTURES,
                    {
                        filter: (structure) => (structure.structureType === STRUCTURE_ROAD)
                            && (structure.hits < structure.hitsMax)
                            && (100 < structure.hits < 10000)
                    })
            }
            else {      // the "all" that is not so all
                target = roomTarget.find(FIND_STRUCTURES,
                    {
                        filter: (structure) => (structure.hits < structure.hitsMax) &&
                            (structure.structureType !== STRUCTURE_RAMPART
                                && structure.structureType !== STRUCTURE_ROAD)
                            && (structure.hits < 100000)
                    });
            }

            // execute action on target
            if (target.length) {
                const t_index = Math.round(Math.random() / (target.length - 1));
                if (creep.repair(target[t_index]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target[t_index], {visualizePathStyle: {stroke: '#251cff'}})
                }
            }
            else {
                console.log(`${creep.name + "|" + creep.memory.subrole} has nothing to repair.`)
            }
        }
    }
}
;