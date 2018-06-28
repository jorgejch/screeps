
module.exports = {
    Rule: {
        set name(v) {
            this.name = v
        },
        get name() {
            if (this.name === undefined){
                throw "Violation name not set."
            }
            return this.name
        },
        set verifyFunc(f) {
            this.verifyFunc = f
        },
        verify: function (target) {
            if (verifyFunc === undefined){
                throw "Violations verify function is not set."
            }
            this.verifyFunc(target)
        },
        set rectifyFunc(f){
            this.rectifyFunc = f
        },
        rectify: function (target) {
            if (this.rectifyFunc === undefined){
                throw "Violations remediate function is not set"
            }
            this.rectifyFunc(target)
        }
    },
}
