import {BaseProcess} from "./process.base";
import {addOrderForCreepInOrderBook, executeOrder} from "util.creepSpawner"

export class RoomManager extends BaseProcess {
    set roomName(roomName) {
        this.data.roomName = roomName
    }

    get roomName() {
        return this.data.roomName
    }

    get orderBook() {
        if (!this.data.creepOrderBook) {
            this.data.creepOrderBook = []
        }
        return this.data.creepOrderBook
    }

    addOrderForCreep(order){
        addOrderForCreepInOrderBook(order, this.orderBook)
    }

    isOrderForCreepNameInOrderBook(creepName){
        return !!this.orderBook.find(order => order.name === creepName)
    }

    _processNextCreepOrder(spawn){
        const order = this.orderBook.sort((a, b) => a.priority - b.priority)[0]
        if (order){
            executeOrder(order, spawn, this.orderBook)
        }
    }

    run() {
        const room = Game.rooms[this.roomName]

        // spawn
        const spawns = room.find(FIND_MY_SPAWNS)
        spawns.forEach(spawn => {
            try{
                this._processNextCreepOrder(spawn)
            }
            catch (e) {
                console.log(`Failed to spawn creep on room ${this.roomName}'s ${spawn.name} spawn due to: ${e.stack}`)
            }
        })
    }
}