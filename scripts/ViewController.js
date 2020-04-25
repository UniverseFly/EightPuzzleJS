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

        const startTime = new Date()
        this.result = solveFunc()
        const finishedTime = new Date()

        this.result.timeCost = (finishedTime - startTime)
        this.result.nodes = this.result.node.expansion()
        this.result.node = undefined

        this.nodeIndex = 0
        document.querySelector("#next").disabled = false

        function createLi(content) {
            const node = document.createElement("li")
            node.textContent = content
            return node
        }

        const expandedCount = this.result.orderIndices.length
        const expandedContent = `已扩展节点数：${this.result.orderIndices.length}`

        const remainingCount = this.result.record.length - expandedCount
        const remainingContent = `剩余待扩展节点数：${remainingCount}`

        const solutionCount = this.result.nodes.length
        const solutionContent = `搜索到的路径长度：${solutionCount}`

        const timeCost = this.result.timeCost
        const timeContent = `耗时：${timeCost}ms (${timeCost / 1000}s)`

        const list = document.createElement("ul")
        list.id = "resultList"
        list.appendChild(createLi(expandedContent))
        list.appendChild(createLi(remainingContent))
        list.appendChild(createLi(solutionContent))
        list.appendChild(createLi(timeContent))

        document.querySelector("#result").appendChild(list)

        const width = document.body.clientWidth
        const height = document.body.clientHeight

        const margin = {
            top: 50,
            right: 100,
            bottom: 100,
            left: 100
        }

        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        const tree = d3.tree().size([innerWidth, innerHeight])
        const svgGroup = d3.select("#svgArea")
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        this.searchTree = {
            model: new SearchTree(this.result),
            treeFunc: tree,
            svgGroup: svgGroup,
            selectingNode: true
        }
        const root = tree(d3.hierarchy(this.searchTree.model.getRoot()))
        console.log(root.descendants())
        svgGroup
            .selectAll("g")
            .data(root.descendants(), d => d.data.id)
            .enter()
            .append("g")
            .attr("transform", d => {
                d.data.x0 = d.x
                d.data.y0 = d.y
                return `translate(${d.x}, ${d.y})`
            })
            .attr("id", `node0`)
            .append("circle")
            .style("fill", "black")
            .style("r", "5px")
    }

    enterNextTreeState() {
        const model = this.searchTree.model
        const treeFunc = this.searchTree.treeFunc
        const svgGroup = this.searchTree.svgGroup

        const root = treeFunc(d3.hierarchy(model.getRoot()))
        // console.log(root)

        const linkPathGenerator = d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        const parentPathGenerator = d => {
            const parent = {
                x: d.source.data.x0,
                y: d.source.data.y0
            }
            return linkPathGenerator({
                source: parent,
                target: parent
            })
        }

        if (this.searchTree.selectingNode) {
            console.log(model.getExpansionId())
            d3.select(`#node${model.getExpansionId()}`)
                .select("circle")
                .style("fill", "red")
            this.searchTree.selectingNode = false;

            model.expand()

            const root = treeFunc(d3.hierarchy(model.getRoot()))

            const nodesEnter = svgGroup.selectAll("g")
                .data(root.descendants(), d => d.data.id)
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.parent.data.x0}, ${d.parent.data.y0})`)

            nodesEnter
                .append("circle")
                .style("fill", "black")
                .style("r", "5px")

            nodesEnter
                .append("text")
                .style("opacity", "0")
                .text(d => d.data.cost)

            svgGroup.selectAll("path")
                .data(root.links(), d => `${d.source.data.id} ${d.target.data.id}`)
                .enter()
                .append("path")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("d", parentPathGenerator)

            return
        }

        const nodesUpdate = svgGroup.selectAll("g")
            .data(root.descendants(), d => d.data.id)
            .attr("id", d => `node${d.data.id}`)

        nodesUpdate.selectAll("circle")
            .style("fill", "black")

        nodesUpdate.selectAll("text")
            .transition()
            .duration(2000)
            .style("opacity", "100%")

        nodesUpdate/*.merge(nodesEnter)*/
            // .join("g")
            .transition()
            .duration(2000)
            .attr("transform", d => {
                // 记录原坐标
                d.data.x0 = d.x
                d.data.y0 = d.y
                return `translate(${d.x}, ${d.y})`
            })

        const linksUpdate = svgGroup.selectAll("path")
            .data(root.links(), d => `${d.source.data.id} ${d.target.data.id}`)

        linksUpdate/*.merge(linksEnter)*/
            // .join("path")
            .transition()
            .duration(2000)
            .attr("d", linkPathGenerator)

        this.searchTree.selectingNode = true;
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
