import {CreepRoleQuantityInRoom} from './rules'

class Tower {
    constructor(struct) {
        this.struct = struct
    }

    execute() {
        // attack when enemies
        const enemy = this.struct.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (enemy) {
            this.struct.attack(enemy)
            return
        }
        // repair otherwise
        const structToRepair = Game.rooms[this.struct.pos.roomName]
            .find(
                FIND_STRUCTURES,
                {filter: s => s.hits < s.hitsMax && s.hits < 130000}
            ).sort((a, b) => {
                return a.hits - b.hits
            })[0]
        this.struct.repair(structToRepair)
    }
}

export class BaseRoomConfig {
    constructor(room, roomFarms) {
        this.room = room
        this.roomFarms = roomFarms
        this.orderBook = {}
        this.creepsInventory = {}
        this.rules = []
    }

    get towers() {
        return this.room
            .find(FIND_MY_STRUCTURES,
                {filter: s => s.structureType === STRUCTURE_TOWER})
            .map(struct => new Tower(struct))
    }

    addCreepRoleQuantityInRoomRule(role, type, requiredQuantity, initParams, priority) {
        this.rules.push(new CreepRoleQuantityInRoom(role, type, requiredQuantity, priority, initParams))
    }

    configureCreepRequirements() {
        throw "Must be implemented by child"
    }

    configure() {
        this.configureCreepRequirements()
    }

    printStats() {
        console.log("**Game Stats**");
        console.log(`Cpu bucket count: ${Game.cpu.bucket}`);
        console.log(`Room ${this.room.name}:
        - Energy:    ${this.room.energyAvailable}/${this.room.energyCapacityAvailable}  stored/capacity
        - Citizens:  ${_.sum(Object.values(this.creepsInventory))}
        - Personnel: ${JSON.stringify(this.creepsInventory)}`
        )
    }
}

