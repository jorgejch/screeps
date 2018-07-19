module.exports = {
    sayHelloWorld: function(flag){
        const visual = new RoomVisual(flag.roomName)
        visual.text(`Hello world!`, flag.pos)
    }
}