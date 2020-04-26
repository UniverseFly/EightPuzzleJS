/// 这相当于一个抽象接口，不同的类进行实现从而达到代码复用
class BestFirstSearchable {
    /// 需要实现
    getProblemTree() {
        return console.error("必须被重写")
    }

    /// 需要实现
    totalCost(node) {
        return console.error("必须被重写")
    }

    /// 得到复用的最佳优先搜索代码
    bestFirstSearch() {
        const problemTree = this.getProblemTree()
        const root = problemTree.root

        /// 记录是一个数组，每个元素有它的状态、路径耗散、以及孩子节点的索引
        let myRecord = [
            {
                state: root.state,
                cost: this.totalCost(root),
                children: []
            }
        ]
        /// 扩展节点的顺序
        let myOrderIndices = []

        // 初始化开表闭表
        root.index = 0
        /// 优先队列
        let openList = new FastPriorityQueue((lhs, rhs) => this.totalCost(lhs) < this.totalCost(rhs))
        openList.add(root)
        /// 哈希表
        let closedList = {}

        // 算法扩展循环
        while (!openList.isEmpty()) {
            const recIndex = myRecord.length
            const myNode = openList.poll()
            /// 增加扩展节点下标
            myOrderIndices.push(myNode.index)

            /// 找到目标
            if (problemTree.problem.isGoal(myNode.state)) {
                return {
                    node: myNode,
                    record: myRecord,
                    orderIndices: myOrderIndices
                }
            }
            /// 这个状态进入闭表
            closedList[myNode.state.oneDArray] = null
            problemTree.children(myNode).forEach(child => {
                // 不在 closedList 里（undefined 和 null 不一样）
                if (closedList[child.state.oneDArray] === undefined) {
                    child.index = myRecord.length
                    myRecord.push({
                        state: child.state,
                        cost: this.totalCost(child),
                        children: []
                    })
                    // 不在闭表则加入开表
                    openList.add(child)
                }
            })
            // 现在扩展节点的孩子 id 就是没有增加时的长度一直到现在的长度
            // recIndex...myRecord.length-1
            myRecord[myNode.index].children =
                [...Array(myRecord.length - recIndex).keys()].map(x => x + recIndex)
        }
        return {
            node: null,
            record: myRecord,
            orderIndices: myOrderIndices
        }
    }
}
