import {CreepTypeInInventory} from "verifications"
import {AddOrderForNecessaryAmountOfCreeps} from "rectifications"

function executeRule(room,
                     verification,
                     rectification) {

    if (!verification.verify(room)) {
        rectification.rectify(room)
    }
}

export default {
    CREEP_TYPE_NUMBER_IN_ROOM: {
        name: "CREEP_TYPE_NUMBER_IN_ROOM",
        ruleFunc: (room, currentRuleTicket) => {
            const params = currentRuleTicket.ruleParams
            const type = params.type
            const reqNum = params.requiredNumber
            const priority = params.priority
            const newCreepParams = params.newCreepParams

            executeRule(
                room,
                new CreepTypeInInventory(type, reqNum),
                new AddOrderForNecessaryAmountOfCreeps(reqNum, type, newCreepParams, priority)
            )
        }
    }
}