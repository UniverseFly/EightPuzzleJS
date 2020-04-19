class BestFirstSearchable {
    getProblemTree() {
        return console.error("必须被重写")
    }

    totalCost(node) {
        return console.error("必须被重写")
    }

    bestFirstSearch() {
        const problemTree = this.getProblemTree()
        const root = problemTree.root

        let myRecord = [
            {
                state: root.state,
                cost: this.totalCost(root),
                children: []
            }
        ]
        let myOrderIndices = []

        root.index = 0
        let openList = new FastPriorityQueue((lhs, rhs) => this.totalCost(lhs) < this.totalCost(rhs))
        openList.add(root)

        let closedList = {}

        while (!openList.isEmpty()) {
            const recIndex = myRecord.length
            const myNode = openList.poll()
            myOrderIndices.push(myNode.index)

            if (problemTree.problem.isGoal(myNode.state)) {
                return {
                    node: myNode,
                    record: myRecord,
                    orderIndices: myOrderIndices
                }
            }
            closedList[myNode.state.oneDArray] = null
            problemTree.children(myNode).forEach(child => {
                // 不在 closedList 里
                if (closedList[child.state.oneDArray] === undefined) {
                    child.index = myRecord.length
                    myRecord.push({
                        state: child.state,
                        cost: this.totalCost(child),
                        children: []
                    })
                    openList.add(child)
                }
            })
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