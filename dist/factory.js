module.exports = {
    orderBook: [],
    addOrder: function (order) {
        this.orderBook.push(order)
        // higher priority comes first
        this.orderBook.sort(function (a, b) { return b - a })
    }
}