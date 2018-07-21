const obtainEnergyOptions = require("util.obtainEnergyOptions")
const tasks = require("creep.tasks");

module.exports = {
    checkContainerExists: function (room) {
        return room.find(FIND_MY_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
            .length > 0
    },

    checkStorageExists: function (room) {
        return room.find(FIND_MY_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_CONTAINER)
            .length > 0
    },
    determineEnergyObtentionMethod: function (room) {
        if (this.checkStorageExists(room)) {
            return obtainEnergyOptions.FROM_STORAGE
        }
        else if (this.checkContainerExists(room)) {
            return obtainEnergyOptions.FROM_CONTAINER
        }
        else {
            return obtainEnergyOptions.HARVEST
        }
    },
    getEnergySourcingTaskTicket: function (sourceOption, roomName) {
        let sourceEnergyTaskTicket
        switch (sourceOption) {
            case obtainEnergyOptions.HARVEST:
                sourceEnergyTaskTicket = new tasks.TaskTicket(
                    tasks.tasks.CYCLIC_HARVEST_CLOSEST_SOURCE_IN_ROOM.name, {roomName: roomName}
                )
                break
            case obtainEnergyOptions.FROM_CONTAINER:
                sourceEnergyTaskTicket = new tasks.TaskTicket(
                    tasks.tasks.CYCLIC_LEECH_FROM_CLOSEST_CONTAINER_IN_ROOM.name,
                    {roomName: roomName, resourceType: RESOURCE_ENERGY, amount: null}
                )
                break
            case obtainEnergyOptions.FROM_STORAGE:
                sourceEnergyTaskTicket = new tasks.TaskTicket(
                    tasks.tasks.CYCLIC_LEECH_FROM_ROOM_STORAGE.name,
                    {roomName: roomName, resourceType: RESOURCE_ENERGY, amount: null}
                )
                break
        }
        return sourceEnergyTaskTicket
    }

}