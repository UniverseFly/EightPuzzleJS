class SlowPuzzleAgent extends BestFirstSearchable {
    constructor(problemTree) {
        super()
        this.problemTree = problemTree
    }

    totalCost(node) {
        return node.pathCost
    }

    getProblemTree() {
        return this.problemTree
    }
}
