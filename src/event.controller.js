module.exports = {
    upgradeControllerUnderFlag: function (flag) {
        const controller = flag.pos.lookFor(LOOK_STRUCTURES)
            .filter(struct => struct.structureType === STRUCTURE_CONTROLLER)[0]
        const visual = new RoomVisual(flag.roomName)

        const CONTROLLER_UPGRADE_MANAGER_PROC_LABEL = `upgrade_manager_of_${controller.room.name}`
        if (Kernel.getProcessByLabel(CONTROLLER_UPGRADE_MANAGER_PROC_LABEL)) {
            visual.text(`Process to upgrade controller ${controller.id} already exists.`, flag.pos)
            return
        }
        console.log(`DEBUG Creating process ${CONTROLLER_UPGRADE_MANAGER_PROC_LABEL}`)
        try {

            const process = Kernel.scheduler.launchProcess(
                Kernel.availableProcessClasses.ControllerUpgradeManager,
                CONTROLLER_UPGRADE_MANAGER_PROC_LABEL
            )
            process.controllerId = controller.id
        }
        catch (ex) {
            console.log(`Failed to launch process ${CONTROLLER_UPGRADE_MANAGER_PROC_LABEL} `
                + `due to: ${ex.stack}`)
        }
    }
}