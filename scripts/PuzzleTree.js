/// 搜索树
class PuzzleTree {
    constructor(problem) {
        this.problem = problem
        this.root = new PuzzleNode(problem.origin)
    }

    /// 某个节点某个动作下的孩子
    child(node, action) {
        return new PuzzleNode(this.problem.result(node.state, action), node, action,
            node.pathCost + this.problem.stepCost(node.state, action))
    }

    /// 节点所有的孩子
    children(node) {
        return this.problem.actions(node.state).map(action => this.child(node, action))
    }
}
