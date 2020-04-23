class ViewController {
    constructor() {
        const origin = [0, 8, 7, 6, 5, 4, 3, 2, 1]
        const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

        this.puzzleModel = new Puzzle(3, 3, origin, goal)
        this.currentNode = new PuzzleNode(this.puzzleModel.origin)

        this.tileWidth = 100
        this.tileHeight = 100
        this.marginSize = 10

        this.updateViewFromModel()

        document.querySelector("#recover").addEventListener("click",
            () => {
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.updateViewFromModel()
            })
        document.querySelector("#puzzleSize").addEventListener("change",
            () => {
                if (this.inSolvedState) {
                    this.resetSolution()
                }
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.updateViewFromModel()

                const badSolve = document.querySelector("#badSolve")
                const slowSolve = document.querySelector("#slowSolve")
                if (size.columns === 3) {
                    [...Array(3).keys()].map(x => x + 9).forEach(value => {
                        document.querySelector(`#tile${value}`).remove()
                    })
                    badSolve.disabled = false
                    slowSolve.disabled = false
                } else {
                    badSolve.disabled = true
                    slowSolve.disabled = true
                }
            })
        document.querySelector("#random").addEventListener("click",
            () => {
                if (this.inSolvedState) {
                    this.resetSolution()
                }
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.updateViewFromModel()
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

    refreshCurrentBox() {
        const currentBox = document.querySelector("#current")
        currentBox.textContent = this.currentNode.state.oneDArray.join(" ")
    }

    updateViewFromModel() {
        const currentState = this.currentNode.state
        const frameWidth = (this.tileWidth + this.marginSize) * currentState.columns + this.marginSize
        const frameHeight = (this.tileHeight + this.marginSize) * currentState.rows + this.marginSize

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
                    tileView.id = `tile${value}`
                    tileView.textContent = value.toString()
                    tileView.style.width = `${this.tileWidth}px`
                    tileView.style.height = `${this.tileHeight}px`
                    tileView.style.lineHeight = `${this.tileHeight}px`
                    tileView.style.top = `${i * (this.tileHeight + this.marginSize)}px`
                    tileView.style.left = `${j * (this.tileWidth + this.marginSize)}px`
                    tileView.style.margin = `${this.marginSize}px`
                    puzzleFrame.appendChild(tileView)
                    tileView.addEventListener("click", (e) => this.clickTile(e))
                } else {
                    this.moveTileView(value, index)
                }
                if (value === this.puzzleModel.goal.oneDArray[index]) {
                    tileView.className = "tile correctPosition"
                } else {
                    tileView.className = "tile wrongPosition"
                }
            }
        }
        this.refreshOriginBox()
        this.refreshGoalBox()
        this.refreshCurrentBox()
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
        this.resetSolution()
        this.inSolvedState = true
        this.result = solveFunc()
        this.result.nodes = this.result.node.expansion()
        this.result.node = undefined

        this.nodeIndex = 0
        document.querySelector("#next").disabled = false

        const expandedCount = this.result.orderIndices.length
        const expandedNode = document.createElement("li")
        expandedNode.textContent = `已扩展节点数：${expandedCount}`

        const remainingCount = this.result.record.length - expandedCount
        const remainingNode = document.createElement("li")
        remainingNode.textContent = `剩余待扩展节点数：${remainingCount}`

        const solutionCount = this.result.nodes.length
        const solutionNode = document.createElement("li")
        solutionNode.textContent = `搜索到的路径长度：${solutionCount}`

        const list = document.createElement("ul")
        list.id = "resultList"
        list.appendChild(expandedNode)
        list.appendChild(remainingNode)
        list.appendChild(solutionNode)

        document.querySelector("#result").appendChild(list)
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
            this.updateViewFromModel()
        }
    }

    resetSolution() {
        this.result = undefined
        this.nodeIndex = undefined
        this.inSolvedState = false
        document.querySelector("#next").disabled = true

        const resultList = document.querySelector("#resultList")
        if (resultList !== null) {
            resultList.remove()
        }
    }

    clickNext() {
        this.nodeIndex += 1
        if (this.nodeIndex === this.result.nodes.length) {
            this.resetSolution()
            return
        }
        this.currentNode = this.result.nodes[this.nodeIndex]
        this.updateViewFromModel()
    }

    moveTileView(tileId, targetIndex) {
        const tile = document.querySelector(`#tile${tileId}`)
        const twoDIndex = this.currentNode.state.twoDIndex(targetIndex)
        tile.style.top = `${twoDIndex[0] * (this.tileHeight + this.marginSize)}px`
        tile.style.left = `${twoDIndex[1] * (this.tileWidth + this.marginSize)}px`
    }
}
