class SearchTree {
    static preprocess(record) {
        return record.map((value, index) => new Object({
            state: value.state,
            cost: value.cost,
            id: index
        }))
    }

    constructor(result) {
        this.nodes = SearchTree.preprocess(result.record)
        this.index = 0
        this.record = result.record
        this.orderIndices = result.orderIndices
    }

    getRoot() {
        return this.nodes[0]
    }

    getExpansionId() {
        return this.orderIndices[this.index]
    }

    expand() {
        const id = this.getExpansionId()
        this.nodes[id].children = this.record[id].children.map(index => this.nodes[index])
        this.index += 1
    }
}
