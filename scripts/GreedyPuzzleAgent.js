class GreedyPuzzleAgent extends BestFirstSearchable {
    constructor(problemTree) {
        super()
        this.double = new PuzzleAgent(problemTree)
    }

    totalCost(node) {
        return this.double.heuristicCost(node.state)
    }

    getProblemTree() {
        return this.double.problemTree
    }
}
