import {CreepTypeQuantityInRoom} from './rules'

export class BaseRoomConfig {
    constructor(room, roomFarms) {
        this.room = room
        this.roomFarms = roomFarms
        this.orderBook = {}
        this.creepsInventory = {}
        this.rules = []
    }
    addCreepTypeQuantityInRoomRule(type, requiredQuantity, initParams, priority) {
        this.rules.push(new CreepTypeQuantityInRoom(type, requiredQuantity, priority, initParams))
    }

    configureCreepRequirements() {
        throw "Must be implemented by child"
    }

    configure() {
        this.configureCreepRequirements()
    }
}

