const testEvents = require("event.test")
const energyEvents = require("event.energyEvents")

module.exports = {
    "1_1" /*RED_RED*/    : testEvents.sayHelloWorld,
    "2_1" /*PURPLE_RED*/ : energyEvents.harvestSourceUnderFlagForOwnRoom
}