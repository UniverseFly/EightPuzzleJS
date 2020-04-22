class ViewController {
    constructor() {
        const origin = [0, 8, 7, 6, 5, 4, 3, 2, 1]
        const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

        this.puzzleModel = new Puzzle(3, 3, origin, goal)
        this.currentNode = new PuzzleNode(this.puzzleModel.origin)

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
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.refreshPuzzleView()
                this.refreshOriginBox()
                this.refreshGoalBox()
            })
        document.querySelector("#random").addEventListener("click",
            () => {
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
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

        const currentState = this.currentNode.state
        const width = 150
        const height = 150
        const frameWidth = width * currentState.columns
        const frameHeight = height * currentState.rows
        const puzzleView = document.createElement("div")
        puzzleView.id = "puzzleFrame"
        puzzleView.style.width = `${frameWidth}px`
        puzzleView.style.height = `${frameHeight}px`

        for (let i = 0; i < currentState.rows; ++i) {
            for (let j = 0; j < currentState.columns; ++j) {
                const index = currentState.oneDIndex([i, j])
                const value = currentState.oneDArray[index]

                const tileView = document.createElement("div")
                tileView.className = "tile"
                tileView.id = `tile${value}`
                tileView.textContent = value.toString()
                tileView.style.width = `${width}px`
                tileView.style.height = `${height}px`
                tileView.style.top = `${i * height}px`
                tileView.style.left = `${j * width}px`
                tileView.style.lineHeight = `${height}px`
                puzzleView.appendChild(tileView)
                this.tileViews.push(tileView)
            }
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
        this.currentNode = this.result.nodes[this.nodeIndex]
        this.moveTileFromNode()
    }

    moveTileFromNode() {
        const state = this.currentNode.state
        const newSpecialIndex = state.specialIndex
        const reversedAction = this.currentNode.action.map(value => -value)
        const previousSpecialIndex = state.oneDIndex(addTuple(state.twoDIndex(newSpecialIndex), reversedAction))
        const previousTop = this.tileViews[previousSpecialIndex].style.top
        const previousLeft = this.tileViews[previousSpecialIndex].style.left
        this.tileViews[previousSpecialIndex].style.top = this.tileViews[newSpecialIndex].style.top
        this.tileViews[previousSpecialIndex].style.left = this.tileViews[newSpecialIndex].style.left
        this.tileViews[newSpecialIndex].style.top = previousTop
        this.tileViews[newSpecialIndex].style.left = previousLeft
        swapArray(this.tileViews, previousSpecialIndex, newSpecialIndex)
    }
}
