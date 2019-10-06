'use strict'

const config = require("config")
const processUtils = require("util.process")

module.exports = {
    constructRemoteRoomUnderFlag: function (flag) {
        const visual = new RoomVisual(flag.room.name)
        const targetRoom = flag.room
        const ownerRoomName = flag.name
        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }
        const label = `construction_director_of_room_${targetRoom.name}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(label)) {
            visual.text(`Process to construct room ${targetRoom.name} already exists.`, flag.pos)
            return
        }
        const process = Kernel.scheduler.launchProcess(
            Kernel.availableProcessClasses.ConstructionDirector,
            label
        )
        visual.text(`Launched process ${process.label}.`, flag.pos)
        process.ownerRoomName = ownerRoomName
        process.targetRoomName = flag.room.name
    },

    repairRemoteRoomUnderFlag: function (flag) {
        const visual = new RoomVisual(flag.room.name)
        const targetRoom = flag.room
        const ownerRoomName = flag.name
        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }
        const label = `repair_director_of_room_${targetRoom.name}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(label)) {
            visual.text(`Process to repair room ${targetRoom.name} already exists.`, flag.pos)
            return
        }
        const process = Kernel.scheduler.launchProcess(
            Kernel.availableProcessClasses.RepairDirector,
            label
        )
        visual.text(`Launched process ${process.label}.`, flag.pos)
        process.ownerRoomName = ownerRoomName
        process.targetRoomName = flag.room.name
    }
}