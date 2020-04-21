class ViewController {
    constructor() {
        const origin = [0, 8, 7, 6, 5, 4, 3, 2, 1]
        const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

        this.puzzleModel = new Puzzle(3, 3, origin, goal)

        this.refreshOriginBox()
        this.refreshGoalBox()
        this.puzzleView = this.newPuzzleView()
        document.querySelector("#puzzleArea").appendChild(this.puzzleView)

        document.querySelector("#recover").addEventListener("click",
            () => this.refreshPuzzleView())
        document.querySelector("#puzzleSize").addEventListener("change",
            () => {
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.refreshPuzzleView()
                this.refreshOriginBox()
                this.refreshGoalBox()
            })
        document.querySelector("#random").addEventListener("click",
            () => {
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.refreshOriginBox()
                this.refreshPuzzleView()
            })

        document.querySelector("#goodSolve").addEventListener("click",
            () => this.goodSolve())

        document.querySelector("#next").addEventListener("click",
            () => this.clickNext())
    }

    getDimension() {
        const index = document.querySelector("#puzzleSize").selectedIndex
        const rows = 3
        const columns = index === 0 ? 3 : 4
        return {
            rows: rows,
            columns: columns
        }
    }

    refreshOriginBox() {
        const originBox = document.querySelector("#origin")
        originBox.textContent = this.puzzleModel.origin.oneDArray.join(" ")
    }

    refreshGoalBox() {
        const goalBox = document.querySelector("#goal")
        goalBox.textContent = this.puzzleModel.goal.oneDArray.join(" ")
    }

    refreshPuzzleView() {
        this.puzzleView.remove()
        this.puzzleView = this.newPuzzleView()
        document.querySelector("#puzzleArea").appendChild(this.puzzleView)
    }

    newPuzzleView() {
        this.tileViews = []
        const puzzleView = document.createElement("div")
        for (let i = 0; i < this.puzzleModel.origin.rows; ++i) {
            const lineView = document.createElement("div")
            for (let j = 0; j < this.puzzleModel.origin.columns; ++j) {
                const index = this.puzzleModel.origin.oneDIndex([i, j])
                const value = this.puzzleModel.origin.oneDArray[index]

                const tileView = document.createElement("span")
                tileView.className = value === 0 ? "tile specialTile" : "tile"
                tileView.id = `tile${index}`
                tileView.textContent = value.toString()
                lineView.appendChild(tileView)
                this.tileViews.push(tileView)
            }
            puzzleView.appendChild(lineView)
        }
        return puzzleView
    }

    goodSolve() {
        const puzzleAgent = new PuzzleAgent(new PuzzleTree(this.puzzleModel))
        this.result = puzzleAgent.bestFirstSearch()
        this.result.nodes = this.result.node.expansion()
        this.result.node = undefined

        this.nodeIndex = 0
        document.querySelector("#next").disabled = false
    }

    clickNext() {
        this.nodeIndex += 1
        if (this.nodeIndex === this.result.nodes.length) {
            this.result = undefined
            this.nodeIndex = undefined
            document.querySelector("#next").disabled = true
            return
        }
        this.updatePuzzleFromNode(this.result.nodes[this.nodeIndex])
    }

    updatePuzzleFromNode(node) {
        this.tileViews.forEach((value, index) => {
            value.textContent = node.state.oneDArray[index].toString()
            value.className = node.state.oneDArray[index] === 0 ? "tile specialTile" : "tile"
        })
    }
}
