const test = require("event.test")
const source = require("event.source")
const controller = require("event.controller")
const constructionAnbRepair = require("event.constructionAndRepair")
const foreignRelations = require("event.foreignRelations")

module.exports = {
    "1_1" /*RED_RED*/    : test.sayHelloWorld,
    "2_1" /*PURPLE_RED*/ : source.harvestSourceUnderFlagOnOwnedRoom,
    "2_2" /*PURPLE_PURPLE*/ : source.harvestSourceUnderFlagOnRemoteRoom,
    "4_1" /*CYAN_RED*/   : controller.upgradeControllerUnderFlagFromOwnRoom,
    "4_2" /*CYAN_PURPLE*/   : controller.reserveControllerUnderFlag,
    "5_1" /*GREEN_RED*/  : constructionAnbRepair.constructRemoteRoomUnderFlag,
    "6_1" /*YELLOW_RED*/ : foreignRelations.sendScoutToFlagPosition
}