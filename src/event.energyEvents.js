import {SourceHarvestManager} from "process.energy"

function processLabel(sourceId) {
    return `harvest_manager_of_source_${sourceId}`
}

export function harvestSourceUnderFlagForOwnRoom(flag){
    const source = flag.pos.lookFor(LOOK_SOURCES)[0]
    const visual = new RoomVisual(flag.roomName)
    if (Kernel.scheduler.getProcessByLabel(processLabel(source.id))){
        visual.text(`Process to harvest source ${source.id} already exists.`, flag.pos)
        return
    }
    const process = Kernel.scheduler.launchProcess(SourceHarvestManager, processLabel(source.id))
    visual.text(`Launched process ${process.label}.`, flag.pos)
    process.sourceId = source.id
    process.ownerRoomName = source.room.name
}