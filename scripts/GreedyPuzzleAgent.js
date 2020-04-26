/// 贪心搜索
class GreedyPuzzleAgent extends BestFirstSearchable {
    constructor(problemTree) {
        super()
        this.double = new PuzzleAgent(problemTree)
    }

    /// 直接返回启发函数
    totalCost(node) {
        return this.double.heuristicCost(node.state)
    }

    getProblemTree() {
        return this.double.problemTree
    }
}
