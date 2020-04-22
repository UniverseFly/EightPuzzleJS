class BadPuzzleAgent extends BestFirstSearchable {
    constructor(problemTree) {
        super()
        this.problemTree = problemTree
    }

    heuristicCost(state) {
        console.assert(state.oneDArray.length === this.problemTree.problem.goal.oneDArray.length,
            "参数状态所表示的网格大小必须不匹配")
        let cost = 0
        for (let index = 0; index !== state.oneDArray.length; index++) {
            const value = state.oneDArray[index]
            const selfValue = this.problemTree.problem.goal.oneDArray[index]
            cost += value !== selfValue ? 1 : 0
        }
        return cost
    }

    totalCost(node) {
        return node.pathCost + this.heuristicCost(node.state)
    }

    getProblemTree() {
        return this.problemTree
    }
}
