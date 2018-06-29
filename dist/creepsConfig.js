module.exports = {
    updateOwnerRoomInventory: function (creep) {

        const inventory = Game.rooms[creep.memory.ownerRoomName].memory.creepsInventory

        if (creep.memory.type in inventory) {
            inventory[creep.memory.type] += 1
        }
        else {
            inventory[creep.memory.type] = 1
        }
    }
}