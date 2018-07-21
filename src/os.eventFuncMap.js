const test = require("event.test")
const source = require("event.source")
const controller = require("event.controller")

module.exports = {
    "1_1" /*RED_RED*/    : test.sayHelloWorld,
    "2_1" /*PURPLE_RED*/ : source.harvestSourceUnderFlagForOwnRoom,
    "4_1" /*CYAN_RED*/   : controller.upgradeControllerUnderFlag,
    "5_1" /*GREEN_RED*/  :
}