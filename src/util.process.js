const obtainEnergyOptions = require("util.obtainEnergyOptions")
const tasks = require("creep.tasks");
const config = require("config")

module.exports = {
    getRoomStorage(room) {
        return room.find(FIND_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_STORAGE)[0]
    },
    getRoomTowers(room) {
        return room.find(FIND_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_TOWER)
    },
    getRoomLinks(room) {
        return room.find(FIND_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_LINK)
    },
    checkStorageStoreAboveThreshold: function (room) {
        const storage = this.getRoomStorage(room)
        const ratio = _.sum(storage.store) / storage.storeCapacity
        return ratio > config.DEFAULT_ROOM_STORAGE_THRESHOLD

    },
    checkRoomHasTowers: function (room) {
        const towers = this.getRoomTowers(room)
        return towers.length > 0
    },
    checkRoomHasContainers: function (room) {
        return room.find(FIND_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
            .length > 0
    },
    checkRoomHasLinkCloseToController: function (room) {
        const links = this.getRoomLinks(room)
        links.forEach(link => {
            if (room.controller.pos.inRangeTo(link.pos, 4)) {
                return true
            }
        })
        return false
    },

    determineDefaultRoomEnergyObtentionMethod: function (room) {
        if (this.getRoomStorage(room)) {
            return obtainEnergyOptions.STORAGE
        }
        else if (this.checkRoomHasContainers(room)) {
            return obtainEnergyOptions.CONTAINER
        }
        else {
            return obtainEnergyOptions.HARVEST
        }
    },
    getDefaultEnergySourcingTaskTicket: function (sourceOption, roomName) {
        let sourceEnergyTaskTicket
        switch (sourceOption) {
            case obtainEnergyOptions.HARVEST:
                sourceEnergyTaskTicket = new tasks.TaskTicket(
                    tasks.tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: roomName}
                )
                break
            case obtainEnergyOptions.CONTAINER:
                sourceEnergyTaskTicket = new tasks.TaskTicket(
                    tasks.tasks.CYCLIC_LEECH_ENERGY_FROM_FULLEST_CONTAINER_IN_ROOM.name,
                    {roomName: roomName, amount: null}
                )
                break
            case obtainEnergyOptions.STORAGE:
                sourceEnergyTaskTicket = new tasks.TaskTicket(
                    tasks.tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                    {roomName: roomName, resourceType: RESOURCE_ENERGY, amount: null}
                )
                break
        }
        return sourceEnergyTaskTicket
    },
    checkRoomExists: function (roomName) {
        return !!Game.rooms[roomName]
    },
    checkRoomExistsAndItsMine: function (roomName) {
        // room exists and it's mine
        return this.checkRoomExists(roomName)
            && (
                Game.rooms[roomName].controller
                && Game.rooms[roomName].controller.owner.username === config.PLAYER_NAME
            )
    },
}