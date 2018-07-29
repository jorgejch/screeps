module.exports = {
    harvestSourceUnderFlagForOwnRoom: function (flag) {
        const source = flag.pos.lookFor(LOOK_SOURCES)[0]
        const label = `harvest_manager_of_source_${source.id}`
        const visual = new RoomVisual(flag.room.name)
        if (Kernel.getProcessByLabel(label)) {
            visual.text(`Process to harvest source ${source.id} already exists.`, flag.pos)
            return
        }
        const process = Kernel.scheduler.launchProcess(
            Kernel.availableProcessClasses.SourceHarvestManager,
            label
        )
        visual.text(`Launched process ${process.label}.`, flag.pos)
        process.sourceId = source.id
        process.ownerRoomName = source.room.name
        console.log(`DEBUG Here X6`)
    }
}