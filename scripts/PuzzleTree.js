class PuzzleTree {
    constructor(problem) {
        this.problem = problem
        this.root = new PuzzleNode(problem.origin)
    }

    child(node, action) {
        return new PuzzleNode(this.problem.result(node.state, action), node, action,
            node.pathCost + this.problem.stepCost(node.state, action))
    }

    children(node) {
        return this.problem.actions(node.state).map(action => this.child(node, action))
    }
}
