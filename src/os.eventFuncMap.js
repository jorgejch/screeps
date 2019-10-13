'use strict'

const test = require("./event.test")
const source = require("./event.source")
const controller = require("./event.controller")
const constructionAndRepair = require("./event.constructionAndRepair")
const foreignRelations = require("./event.foreignRelations")
const utility = require("./event.utility")

module.exports = {
    "1_1" /*RED_RED*/       : test.sayHelloWorld,
    "2_1" /*PURPLE_RED*/    : source.harvestSourceUnderFlagOnOwnedRoom,
    "2_2" /*PURPLE_PURPLE*/ : source.harvestSourceUnderFlagOnRemoteRoom,
    "4_1" /*CYAN_RED*/      : controller.upgradeControllerUnderFlagFromOwnRoom,
    "4_3" /*CYAN_BLUE*/     : controller.upgradeFlagRoomControllerOnRemoteRoom,
    "4_4" /*CYAN_CYAN*/     : controller.upgradeRoomControllerFromRemoteRoom,
    "4_2" /*CYAN_PURPLE*/   : controller.reserveControllerUnderFlag,
    "5_1" /*GREEN_RED*/     : constructionAndRepair.constructRemoteRoomUnderFlag,
    "5_2" /*GREEN_PURPLE*/  : constructionAndRepair.repairRemoteRoomUnderFlag,
    "6_1" /*YELLOW_RED*/    : foreignRelations.sendScoutToFlagPosition,
    "6_2" /*YELLOW_PURPLE*/ : foreignRelations.guardRoomUnderFlag,
    "6_3" /*YELLOW_BLUE*/   : foreignRelations.claimRoomUnderFlag,
    "6_4" /*YELLOW_CYAN*/   : foreignRelations.supplyEnergyToRoom,
    "6_5" /*YELLOW_GREEN*/  : foreignRelations.scoutRoomUnderFlag,
    "9_1" /*GREY_RED*/      : utility.deleteRoomRepairManager
}