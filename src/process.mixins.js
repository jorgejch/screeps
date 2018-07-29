
function capitalize (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports = {
    ActivityDirectorProcess: Base => class extends Base {
        set ownerRoomName(name) {
            this.data.ownerRoomName = name
        }

        get ownerRoomName() {
            return this.data.ownerRoomName
        }

        get ownerRoom() {
            return Game.rooms[this.ownerRoomName]
        }

        get lastLevel() {
            if (!this.data.lastLevel) {
                this.data.lastLevel = 0
            }
            return this.data.lastLevel
        }

        set lastLevel(level) {
            this.data.lastLevel = level
        }

        getRoleProcessesLabels(role) {
            if (!this.data.roleProcessesLabels) {
                this.data.roleProcessesLabels = {}
            }

            if (!this.data.roleProcessesLabels[role]) {
                this.data.roleProcessesLabels[role] = []
            }

            return this.data.roleProcessesLabels[role]
        }

        setRoleProcessesLabels(role, labels){
            if (!this.data.roleProcessesLabels) {
                this.data.roleProcessesLabels = {}
            }
            this.data.roleProcessesLabels[role] = labels
        }

        cleanRoleDeadProcesses(role){
            // filter out dead processes
            const roleProcesses = this.getRoleProcessesLabels(role)
            this.setRoleProcessesLabels(role, roleProcesses.filter(label => Kernel.getProcessByLabel(label)))
        }

        getRoleCount(role) {
            if (!this.data.roleCounters) {
                this.data.roleCounters = {}
            }

            if (!this.data.roleCounters[role]) {
                this.data.roleCounters[role] = 0
            }

            return this.data.roleCounters[role]
        }

        incrementRoleCount(role) {
            if (!this.data.roleCounters) {
                this.data.roleCounters = {}
            }

            if (!this.data.roleCounters[role]) {
                this.data.roleCounters[role] = 0
            }

            this.data.roleCounters[role] += 1
        }

        setAllRoleProcessesToDieAfterCreep(role){
            this.getRoleProcessesLabels(role).forEach(
                procLabel => Kernel.getProcessByLabel(procLabel).dieAfterCreep()
            )
        }

        resolveLevelForRole(role, currentLevel) {
            if (this.lastLevel < currentLevel) {
                console.log(`Next ${role} order placed by ${this.label} will be at new level ${currentLevel}.`)
                // no creep shall be made, a new age has arrived
                this.setAllRoleProcessesToDieAfterCreep(role)
            }
        }

        resolveRoleProcessesQuantity(role,
                                     reqNumber,
                                     bodyType,
                                     priority,
                                     initialTaskTicketQueue,
                                     targetdesc,
                                     currentLevel) {

            while (this.getRoleProcessesLabels(role).length < reqNumber) {
                const label = `${role}_creep_manager_${this.getRoleCount(role)}_of_${targetdesc}`
                    + `_from_${this.ownerRoomName}`
                try {
                    const process = Kernel.scheduler.launchProcess(
                        Kernel.availableProcessClasses.CreepManager,
                        label,
                        this.pid
                    )
                    process.creepName = `${capitalize(role)}${this.getRoleCount(role)}Of${targetdesc}`
                        + `From${this.ownerRoomName}`
                    process.creepType = bodyType
                    process.ownerRoomName = this.ownerRoomName
                    process.spawningPriority = priority
                    process.initialTaskTicketQueue = initialTaskTicketQueue
                    this.incrementRoleCount(role)
                    this.getRoleProcessesLabels(role).push(process.label)
                    this.lastLevel = currentLevel
                }
                catch (e) {
                    console.log(`Failed to lunch harvester process due to: ${e.stack}`)
                }
            }
        }
    }
}