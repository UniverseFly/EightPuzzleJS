/// 搜索树模型
class SearchTree {
    /// 将返回的结果预处理
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

    /// 得到树的根
    getRoot() {
        return this.nodes[0]
    }

    /// 待扩展 id
    getExpansionId() {
        return this.orderIndices[this.index]
    }

    /// 扩展
    expand() {
        const id = this.getExpansionId()
        this.nodes[id].children = this.record[id].children.map(index => this.nodes[index])
        this.index += 1
    }
}
