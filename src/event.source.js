'use strict'

const processUtils = require("./util.process");

module.exports = {
    harvestSourceUnderFlagOnOwnedRoom: function (flag) {
        const source = flag.pos.lookFor(LOOK_SOURCES)[0]
        const label = `harvest_director_of_source_${source.id}`
        const visual = new RoomVisual(flag.room.name)
        if (Kernel.getProcessByLabel(label)) {
            visual.text(`Process to harvest source ${source.id} already exists.`, flag.pos)
            return
        }
        const process = Kernel.scheduler.launchProcess(
            Kernel.availableProcessClasses.HarvestDirector,
            label
        )
        visual.text(`Launched process ${process.label}.`, flag.pos)
        process.sourceId = source.id
        process.ownerRoomName = source.room.name
        process.targetRoomName = source.room.name
    },
    harvestSourceUnderFlagOnRemoteRoom: function(flag){
        const source = flag.pos.lookFor(LOOK_SOURCES)[0]
        const visual = new RoomVisual(flag.room.name)

        const ownerRoomName = flag.name
        if (!processUtils.checkRoomExists(ownerRoomName)) {
            visual.text(`Room ${ownerRoomName} doesn't exist.`, flag.pos)
            return
        }
        const label = `harvest_director_of_source_${source.id}_from_${ownerRoomName}`
        if (Kernel.getProcessByLabel(label)) {
            visual.text(`Process to harvest source ${source.id} from ${ownerRoomName} already exists.`, flag.pos)
            return
        }
        const process = Kernel.scheduler.launchProcess(
            Kernel.availableProcessClasses.HarvestDirector,
            label
        )
        visual.text(`Launched process ${process.label}.`, flag.pos)
        process.sourceId = source.id
        process.ownerRoomName = ownerRoomName
        process.targetRoomName = flag.pos.roomName
    }
}