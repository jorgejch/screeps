const verifications = require("verifications")
const rectifications = require("rectifications")

class Rule {
    constructor(name, verification, rectification) {
        this.name = name
        this.verification = verification
        this.rectification = rectification
    }

    verify(room) {
        if (this.verification === undefined){
            throw "Verification object missing from Rule"
        }
        this.verification.verify(room)
    }

    rectify(room) {
        if (this.rectification === undefined){
            throw "Rectification object missing from Rule"
        }
        this.rectification.rectify(room)
    }
}

module.exports = {
    getCreepTypeNumberInRoomRule: function (type, reqNumber, roomName, priority, creepsParams) {
        return new Rule(
            `SHOULD_HAVE_${type}_IN_ROOM`,
            new verifications.CreepTypeInInventory(type, reqNumber),
            new rectifications.AddOrderForNecessaryAmountOfCreeps(reqNumber, type, creepsParams, priority)
        )
    }
}