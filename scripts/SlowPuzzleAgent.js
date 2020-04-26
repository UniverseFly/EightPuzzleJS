/// 一致代价搜索
class SlowPuzzleAgent extends BestFirstSearchable {
    constructor(problemTree) {
        super()
        this.problemTree = problemTree
    }

    /// 直接返回路径耗散
    totalCost(node) {
        return node.pathCost
    }

    getProblemTree() {
        return this.problemTree
    }
}
