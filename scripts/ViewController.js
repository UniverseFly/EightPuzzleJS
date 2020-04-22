class ViewController {
    constructor() {
        const origin = [0, 8, 7, 6, 5, 4, 3, 2, 1]
        const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

        this.puzzleModel = new Puzzle(3, 3, origin, goal)
        this.currentNode = new PuzzleNode(this.puzzleModel.origin)

        this.tileWidth = 100
        this.tileHeight = 100
        this.borderSize = 5

        this.refreshOriginBox()
        this.refreshGoalBox()
        this.refreshPuzzleView()

        document.querySelector("#recover").addEventListener("click",
            () => {
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.refreshPuzzleView()
            })
        document.querySelector("#puzzleSize").addEventListener("change",
            () => {
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.refreshPuzzleView()

                if (size.columns === 3) {
                    [...Array(3).keys()].map(x => x + 9).forEach(value => {
                        document.querySelector(`#tile${value}`).remove()
                    })
                }

                this.refreshOriginBox()
                this.refreshGoalBox()
            })
        document.querySelector("#random").addEventListener("click",
            () => {
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.refreshOriginBox()
                this.moveTileFromCurrentNode()
            })

        document.querySelector("#goodSolve").addEventListener("click",
            () => this.goodSolve())
        document.querySelector("#badSolve").addEventListener("click",
            () => this.badSolve())
        document.querySelector("#greedySolve").addEventListener("click",
            () => this.greedySolve())
        document.querySelector("#slowSolve").addEventListener("click",
            () => this.slowSolve())

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
        if (this.inSolvedState) {
            this.resetSolution()
        }
        const currentState = this.currentNode.state
        const frameWidth = (this.tileWidth + this.borderSize) * currentState.columns + this.borderSize
        const frameHeight = (this.tileHeight + this.borderSize) * currentState.rows + this.borderSize

        let puzzleFrame = document.querySelector("#puzzleFrame")
        if (puzzleFrame === null) {
            puzzleFrame = document.createElement("div")
            puzzleFrame.id = "puzzleFrame"
            document.querySelector("#puzzleArea").appendChild(puzzleFrame)
        }
        puzzleFrame.style.width = `${frameWidth}px`
        puzzleFrame.style.height = `${frameHeight}px`

        for (let i = 0; i < currentState.rows; ++i) {
            for (let j = 0; j < currentState.columns; ++j) {
                const index = currentState.oneDIndex([i, j])
                const value = currentState.oneDArray[index]

                let tileView = document.querySelector(`#tile${value}`)
                if (tileView === null) {
                    tileView = document.createElement("div")
                    tileView.className = "tile"
                    tileView.id = `tile${value}`
                    tileView.textContent = value.toString()
                    tileView.style.width = `${this.tileWidth}px`
                    tileView.style.height = `${this.tileHeight}px`
                    tileView.style.lineHeight = `${this.tileHeight}px`
                    tileView.style.top = `${i * (this.tileHeight + this.borderSize)}px`
                    tileView.style.left = `${j * (this.tileWidth + this.borderSize)}px`
                    tileView.style.border = `solid lightgreen ${this.borderSize}px`
                    puzzleFrame.appendChild(tileView)
                    tileView.addEventListener("click", (e) => this.clickTile(e))
                } else {
                    this.moveTileView(value, index)
                }
            }
        }
    }

    getAgent() {
        const goal = this.puzzleModel.goal
        return new PuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    getBadAgent() {
        const goal = this.puzzleModel.goal
        return new BadPuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    getGreedyAgent() {
        const goal = this.puzzleModel.goal
        return new GreedyPuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    getSlowPuzzleAgent() {
        const goal = this.puzzleModel.goal
        return new SlowPuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    goodSolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    badSolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getBadAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    greedySolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getGreedyAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    slowSolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getSlowPuzzleAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    solveTemplate(solveFunc) {
        this.inSolvedState = true
        this.result = solveFunc()
        this.result.nodes = this.result.node.expansion()
        this.result.node = undefined

        this.nodeIndex = 0
        document.querySelector("#next").disabled = false
    }

    clickTile(event) {
        const tileClicked = event.target
        const value = parseInt(tileClicked.id.substr(4))
        let index = undefined
        const currentIndex = this.currentNode.state.specialIndex
        const puzzleTree = this.getAgent().problemTree
        const node = this.currentNode
        puzzleTree.children(node).forEach(x => {
            const specialIndex = x.state.specialIndex
            if (value === this.currentNode.state.oneDArray[specialIndex]) {
                index = specialIndex
                this.currentNode = x
            }
        })
        if (index !== undefined) {
            if (this.inSolvedState) {
                this.resetSolution()
            }
            this.moveTileView(value, currentIndex)
            this.moveTileView(0, index)
        }
    }

    resetSolution() {
        this.result = undefined
        this.nodeIndex = undefined
        this.inSolvedState = false
        document.querySelector("#next").disabled = true
    }

    clickNext() {
        this.nodeIndex += 1
        if (this.nodeIndex === this.result.nodes.length) {
            this.resetSolution()
            return
        }
        const previousSpecialIndex = this.currentNode.state.specialIndex
        this.currentNode = this.result.nodes[this.nodeIndex]
        const currentSpecialIndex = this.currentNode.state.specialIndex
        const movedTileId = this.currentNode.state.oneDArray[previousSpecialIndex]

        this.moveTileView(0, currentSpecialIndex)
        this.moveTileView(movedTileId, previousSpecialIndex)
    }

    moveTileFromCurrentNode() {
        const state = this.currentNode.state
        state.oneDArray.forEach((value, index) => {
            this.moveTileView(value, index)
        })
    }

    moveTileView(tileId, targetIndex) {
        const tile = document.querySelector(`#tile${tileId}`)
        const twoDIndex = this.currentNode.state.twoDIndex(targetIndex)
        tile.style.top = `${twoDIndex[0] * (this.tileHeight + this.borderSize)}px`
        tile.style.left = `${twoDIndex[1] * (this.tileWidth + this.borderSize)}px`
    }
}
