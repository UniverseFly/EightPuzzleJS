/// 计算曼哈顿距离
function manhattanDistance(start, end) {
    return Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1])
}

/// 曼哈顿距离版本的 A*
class PuzzleAgent extends BestFirstSearchable {
    constructor(problemTree) {
        super()
        this.problemTree = problemTree
        this.goalIndex = {}
        const goalArray = this.problemTree.problem.goal.oneDArray
        for (let index = 0; index !== goalArray.length; index += 1) {
            this.goalIndex[goalArray[index]] = index
        }
    }

    /// 启发函数
    heuristicCost(state) {
        console.assert(state.oneDArray.length === this.problemTree.problem.goal.oneDArray.length,
            "参数状态所表示的网格大小必须不匹配")
        let cost = 0
        for (let index = 0; index !== state.oneDArray.length; index++) {
            const value = state.oneDArray[index]
            const first = state.twoDIndex(index)
            const second = state.twoDIndex(this.goalIndex[value])
            cost += manhattanDistance(first, second)
        }
        return cost
    }

    /// 评估函数
    totalCost(node) {
        return node.pathCost + this.heuristicCost(node.state)
    }

    getProblemTree() {
        return this.problemTree
    }
}
