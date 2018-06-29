module.exports = {
    HarvestEnergyFromSource: class {
        constructor(source) {
            this.source = source
        }

        perform(creep) {
            const res = creep.harvest(this.source)

            switch (res) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(this.source)
                    break;
                default:
                    console.log(`Unable to harvest source id ${this.source.id} due to err # ${res}`)
            }
        }
    },
    TransferAllResourceToTarget: class {

        constructor(target, resourceType) {
            this.target = target
            this.resourceType = resourceType
        }

        perform(creep) {
            const res = creep.transfer(this.target, this.resourceType)

            switch (res) {
                case OK:
                    break
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(this.target)
                    break
                default:
                    console.log(`Unable to transfer ${this.resourceType} to ${this.target.structureType} id ${this.target.id} due to err # ${res}`)
            }
        }
    },
    TransferAllEnergyToSpawnOrExtension: class extends this.TransferAllResourceToTarget {
        constructor(room) {
            const target = room.find(FIND_MY_STRUCTURES, {
                    filter:
                        function (struct) {
                            return struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION
                        }
                }
            )[0]
            super(target, RESOURCE_ENERGY)
        }
    }
}