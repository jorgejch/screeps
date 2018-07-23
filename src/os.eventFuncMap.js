const test = require("event.test")
const source = require("event.source")
const controller = require("event.controller")
const constructionAnbRepair = require("event.constructionAndRepair")

module.exports = {
    "1_1" /*RED_RED*/    : test.sayHelloWorld,
    "2_1" /*PURPLE_RED*/ : source.harvestSourceUnderFlagForOwnRoom,
    "4_1" /*CYAN_RED*/   : controller.upgradeControllerUnderFlagFromOwnRoom,
    "5_1" /*GREEN_RED*/  :constructionAnbRepair.constructRemoteRoomUnderFlag
}