class ViewController {
    constructor() {
        const origin = [0, 8, 7, 6, 5, 4, 3, 2, 1]
        const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

        this.puzzleModel = new Puzzle(3, 3, origin, goal)
        this.currentNode = new PuzzleNode(this.puzzleModel.origin)

        this.tileWidth = 100
        this.tileHeight = 100

        this.refreshOriginBox()
        this.refreshGoalBox()
        this.refreshPuzzleView()

        document.querySelector("#recover").addEventListener("click",
            () => this.refreshPuzzleView())
        document.querySelector("#puzzleSize").addEventListener("change",
            () => {
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.refreshPuzzleView()

                if (size.columns === 3) {
                    [...Array(5).keys()].map(x => x + 9).forEach(value => {
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
        const currentState = this.currentNode.state
        const frameWidth = this.tileWidth * currentState.columns
        const frameHeight = this.tileHeight * currentState.rows

        let puzzleFrame = document.querySelector("#puzzleFrame")
        if (puzzleFrame === null) {
            puzzleFrame = document.createElement("div")
            puzzleFrame.id = "puzzleFrame"
            puzzleFrame.style.width = `${frameWidth}px`
            puzzleFrame.style.height = `${frameHeight}px`
            document.querySelector("#puzzleArea").appendChild(puzzleFrame)
        }
        puzzleFrame.style.width = `${frameWidth}px`
        puzzleFrame.style.height = `${frameHeight}px`

        for (let i = 0; i < currentState.rows; ++i) {
            for (let j = 0; j < currentState.columns; ++j) {
                const index = currentState.oneDIndex([i, j])
                const value = currentState.oneDArray[index]

                if (document.querySelector(`#tile${value}`) === null) {
                    const tileView = document.createElement("div")
                    tileView.className = "tile"
                    tileView.id = `tile${value}`
                    tileView.textContent = value.toString()
                    tileView.style.width = `${this.tileWidth}px`
                    tileView.style.height = `${this.tileHeight}px`
                    tileView.style.lineHeight = `${this.tileHeight}px`
                    tileView.style.top = `${i * this.tileHeight}px`
                    tileView.style.left = `${j * this.tileWidth}px`
                    puzzleFrame.appendChild(tileView)
                } else {
                    this.moveTileView(value, index)
                }
            }
        }
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
        tile.style.top = `${twoDIndex[0] * this.tileHeight}px`
        tile.style.left = `${twoDIndex[1] * this.tileWidth}px`
    }
}
