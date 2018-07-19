const init =require("process.init")
const energy = require("process.energy")
const empire = require("process.empire")
const room = require("process.room")
const events = require("process.events")

module.exports =  {
    "EmpireManager": empire.EmpireManager,
    "FlagEventListener": events.FlagEventListener,
    "SourceHarvestManager": energy.SourceHarvestManager,
    "Init": init.Init,
    "RoomManager": room.RoomManager
}