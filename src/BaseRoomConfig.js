import rules from './rules'
import {RuleTicket} from './rulesUtils'

export class BaseRoomConfig {
    constructor(room, roomFarms, spawns) {
        this.room = room
        this.roomFarms = roomFarms
        this.spawns = spawns
    }

    addOrUpdateCreepTypeNumberToRoomRuleTicket(type, requiredQuantity, initParams, priority) {
        const ruleTickets = this.room.memory.ruleTickets
        const name = rules.CREEP_TYPE_NUMBER_IN_ROOM.name
        const params = {type: type, requiredNumber: requiredQuantity, priority: priority, newCreepParams: initParams}
        const existingRuleTicket = ruleTickets.find(ticket => {
            return ticket.ruleParams.type === type
        })
        // add ticket if ticket for same type doesn't exist but only update existing ticket's rule params if it does
        if (!existingRuleTicket) {
            // regex that matches a similar creep type (different version)
            const similarTypeRegexStr = `${type.substring(0, type.lastIndexOf("_"))}_\\d+`
            console.log(similarTypeRegexStr)
            const similarTypeRegex = new RegExp(similarTypeRegexStr)

            // remove any existing tickets for similar type
            for (const index in ruleTickets) {
                const ruleTicket = ruleTickets[index]

                if (ruleTicket.ruleParams.type.search(similarTypeRegex) > -1) {
                    console.log(JSON.stringify(ruleTicket.ruleParams.type.search(similarTypeRegex)))
                    const indexToRemove = ruleTickets.indexOf(ruleTicket)
                    if (indexToRemove > -1) {
                        ruleTickets.splice(indexToRemove, 1)
                    }
                }
            }

            ruleTickets.push(new RuleTicket(name, params))
        }
        else {
            existingRuleTicket.ruleParams = params
        }
    }

    configureCreepRequirements() {
        throw "Must be implemented by child"
    }

    configure() {
        this.room.memory.spawns = this.spawns
        if (!("orderBook" in this.room.memory)) {
            this.room.memory.orderBook = {}
        }

        if (!("ruleTickets" in this.room.memory)) {
            this.room.memory.ruleTickets = []
        }
        this.room.memory.creepsInventory = {}
        this.configureCreepRequirements()
    }
}

