/// 连接视图和模型
class ViewController {
    constructor() {
        /// 默认的初始状态和目标状态
        const origin = [0, 8, 7, 6, 5, 4, 3, 2, 1]
        const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]

        /// 解决的问题模型
        this.puzzleModel = new Puzzle(3, 3, origin, goal)
        /// 代表当前状态的节点
        this.currentNode = new PuzzleNode(this.puzzleModel.origin)

        /// 控制显示时的小方块大小
        this.tileWidth = 100
        this.tileHeight = 100
        this.marginSize = 10

        /// 更新视图
        this.updateViewFromModel()

        /// 绑定监听
        document.querySelector("#recover").addEventListener("click",
            () => {
                /// 如果正在 next 解决状态，则需要复原
                if (this.inSolvedState) {
                    this.resetSolution()
                }
                /// 复原到 origin
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                /// 刷新
                this.updateViewFromModel()
            })

        /// 当更改数码大小时，需要重置
        document.querySelector("#puzzleSize").addEventListener("change",
            () => {
                if (this.inSolvedState) {
                    this.resetSolution()
                }
                const size = this.getDimension()
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.updateViewFromModel()

                /// 在 3*4 的时候，不允许一致代价以及A*非曼哈顿版本，因为太慢了
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

        /// 随机化
        document.querySelector("#random").addEventListener("click",
            () => {
                if (this.inSolvedState) {
                    this.resetSolution()
                }
                const size = this.getDimension()
                /// 调用模型的 random 方法
                this.puzzleModel = Puzzle.random(size.rows, size.columns)
                this.currentNode = new PuzzleNode(this.puzzleModel.origin)
                this.updateViewFromModel()
            })

        /// 不同的 solve 选项绑定不同方法
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

    /// 获得当前选择的维度
    getDimension() {
        const index = document.querySelector("#puzzleSize").selectedIndex
        const rows = 3
        const columns = index === 0 ? 3 : 4
        return {
            rows: rows,
            columns: columns
        }
    }

    /// 刷新初始状态的序列
    refreshOriginBox() {
        const originBox = document.querySelector("#origin")
        originBox.textContent = this.puzzleModel.origin.oneDArray.join(" ")
    }

    /// 刷新目标状态的序列
    refreshGoalBox() {
        const goalBox = document.querySelector("#goal")
        goalBox.textContent = this.puzzleModel.goal.oneDArray.join(" ")
    }

    /// 刷新当前状态
    refreshCurrentBox() {
        const currentBox = document.querySelector("#current")
        currentBox.textContent = this.currentNode.state.oneDArray.join(" ")
    }

    /// 关键方法！
    /// 从模型刷新视图，任何操作都会调用。
    updateViewFromModel() {
        /// 获得当前状态
        const currentState = this.currentNode.state
        /// 整个数码区域的宽高
        const frameWidth = (this.tileWidth + this.marginSize) * currentState.columns + this.marginSize
        const frameHeight = (this.tileHeight + this.marginSize) * currentState.rows + this.marginSize

        /// 获取数码区域框
        let puzzleFrame = document.querySelector("#puzzleFrame")
        if (puzzleFrame === null) {
            puzzleFrame = document.createElement("div")
            puzzleFrame.id = "puzzleFrame"
            document.querySelector("#puzzleArea").appendChild(puzzleFrame)
        }
        puzzleFrame.style.width = `${frameWidth}px`
        puzzleFrame.style.height = `${frameHeight}px`

        /// 刷新整个数码
        for (let i = 0; i < currentState.rows; ++i) {
            for (let j = 0; j < currentState.columns; ++j) {
                /// 当前的一维坐标
                const index = currentState.oneDIndex([i, j])
                /// 当前坐标下的值
                const value = currentState.oneDArray[index]

                let tileView = document.querySelector(`#tile${value}`)
                // 如果选择的是空，则需要创建一个数码，并对位置进行确定
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
                    // 如果有数码，则将有这个值的数码移动到它对应的下标！
                    this.moveTileView(value, index)
                }

                // 变色操作，如果当前值和目标值相等，变成蓝色对应的class，否则红色。
                if (value === this.puzzleModel.goal.oneDArray[index]) {
                    tileView.className = "tile correctPosition"
                } else {
                    tileView.className = "tile wrongPosition"
                }
            }
        }

        // 刷新状态窗口
        this.refreshOriginBox()
        this.refreshGoalBox()
        this.refreshCurrentBox()
    }

    /// A* 曼哈顿的 Agent
    getAgent() {
        const goal = this.puzzleModel.goal
        return new PuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    /// 不好的 A* 的 Agent
    getBadAgent() {
        const goal = this.puzzleModel.goal
        return new BadPuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    /// 贪婪 Agent
    getGreedyAgent() {
        const goal = this.puzzleModel.goal
        return new GreedyPuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    /// 一致代价 Agent
    getSlowPuzzleAgent() {
        const goal = this.puzzleModel.goal
        return new SlowPuzzleAgent(new PuzzleTree(new Puzzle(goal.rows, goal.columns,
            this.currentNode.state.oneDArray, goal.oneDArray)))
    }

    /// A*
    goodSolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    /// A*（不好的h）
    badSolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getBadAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    /// 贪婪
    greedySolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getGreedyAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    /// 一致代价
    slowSolve() {
        this.solveTemplate(() => {
            const puzzleAgent = this.getSlowPuzzleAgent()
            return puzzleAgent.bestFirstSearch()
        })
    }

    /// 求解模版
    solveTemplate(solveFunc) {
        this.resetSolution()
        this.inSolvedState = true

        /// 计时器
        const startTime = new Date()
        this.result = solveFunc()
        const finishedTime = new Date()

        /// 结果绑定
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

        /// 结果显示
        const expandedCount = this.result.orderIndices.length
        const expandedContent = `已扩展节点数：${this.result.orderIndices.length}`

        const remainingCount = this.result.record.length - expandedCount
        const remainingContent = `剩余待扩展节点数：${remainingCount}`

        const solutionCount = this.result.nodes.length - 1
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
        const height = Math.floor(window.screen.height * 0.7)

        const margin = {
            top: 20,
            right: 50,
            bottom: 100,
            left: 50
        }

        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        /// 搜索树的构造
        const tree = d3.tree().size([innerWidth, innerHeight])

        const svgArea = d3.select("#svgArea")

        /// 搜索区域框体
        svgArea
            .append("p")
            .style("text-align", "center")
            .style("color", "#fd9645")
            .text("点击区域逐步演示搜索树（放到圆点上查看状态）")

        /// 里面的 svg 树
        const svgGroup = svgArea
            .style("margin", "8px")
            .style("border", "3px dotted #fd9645")
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", width - 22)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        /// 搜索树模型
        this.searchTree = {
            model: new SearchTree(this.result),
            treeFunc: tree,
            svgGroup: svgGroup,
            selectingNode: true
        }

        /// 根节点
        const root = tree(d3.hierarchy(this.searchTree.model.getRoot()))
        console.log(root.descendants())

        /// 在框体中点击就进入下一个状态
        d3.select("#svgArea")
            .on("click", () => this.enterNextTreeState())

        /// 初始化跟节点
        const g = svgGroup
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
        g.append("circle")
            .style("r", "4px")
        g.append("text")
            .text(d => d.data.cost)
            .style("font-size", "11px")
            .attr("x", "5px")
            .attr("y", "2px")

        /// 鼠标放在节点上就能够显示状态
        const tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-5, 0])
            .html(function (d) {
                let str = ""
                const arr = Array.from(d.data.state.oneDArray);
                const rows = d.data.state.rows
                const columns = d.data.state.columns
                for (let i = 0; i < rows; ++i) {
                    if (i !== 0) {
                        str += "<br>"
                    }
                    for (let j = 0; j < columns; ++j) {
                        if (j !== 0) {
                            str += "&nbsp;"
                        }
                        const index = d.data.state.oneDIndex([i, j])
                        str += `${arr[index]}`
                    }
                }
                return str
            });

        g.call(tip)

        /// 监听绑定
        d3.select("#node0")
            .select("circle")
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)

        this.searchTree.tip = tip
    }

    /// 搜索树的下一个状态
    enterNextTreeState() {
        const model = this.searchTree.model
        const treeFunc = this.searchTree.treeFunc
        const svgGroup = this.searchTree.svgGroup

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

        // 代表是在选择扩展节点进行显示，还是在扩展树枝
        if (this.searchTree.selectingNode) {
            console.log(model.getExpansionId())
            d3.select(`#node${model.getExpansionId()}`)
                .select("circle")
                .transition()
                .style("fill", "red")
            this.searchTree.selectingNode = false;

            return
        }

        // 模型扩展结束后，停留在最终的节点
        if (model.index === model.orderIndices.length - 1) {
            return;
        }

        // 找到当前扩展元素，加入闭表
        d3.select(`#node${model.getExpansionId()}`)
            .select("circle")
            .transition()
            .duration(1000)
            .style("fill", "black")
        model.expand()
        const root = treeFunc(d3.hierarchy(model.getRoot()))

        // 需要先更新 links!!!
        // 否则links的生成会由于nodes的改编而移位
        const linksUpdate = svgGroup.selectAll("path")
            .data(root.links(), d => `${d.source.data.id} ${d.target.data.id}`)

        const linksEnter = linksUpdate.enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", parentPathGenerator)

        linksUpdate.merge(linksEnter)
            // .join("path")
            .transition()
            .duration(1000)
            .attr("d", linkPathGenerator)

        // 更新 nodes
        const nodesUpdate = svgGroup.selectAll("g")
            .data(root.descendants(), d => d.data.id)

        const nodesEnter = nodesUpdate.enter()
            .append("g")
            .attr("transform", d => `translate(${d.parent.data.x0}, ${d.parent.data.y0})`)

        nodesEnter
            .append("circle")
            .style("r", "4px")
            .on("mouseover", this.searchTree.tip.show)
            .on("mouseout", this.searchTree.tip.hide)

        // 增加 f 值的显示
        nodesEnter
            .append("text")
            .text(d => d.data.cost)
            .style("font-size", "11px")
            .attr("x", "5px")
            .attr("y", "2px")

        nodesEnter
            .transition()
            .duration(1000)
            .attr("transform", d => {
                // 记录原坐标
                d.data.x0 = d.x
                d.data.y0 = d.y
                return `translate(${d.x}, ${d.y})`
            })

        nodesUpdate
            .transition()
            .duration(1000)
            .attr("transform", d => {
                // 记录原坐标
                d.data.x0 = d.x
                d.data.y0 = d.y
                return `translate(${d.x}, ${d.y})`
            })

        nodesUpdate.merge(nodesEnter)
            .attr("id", d => `node${d.data.id}`)

        // toggle一下
        this.searchTree.selectingNode = true;
    }

    /// 手动移动方块
    clickTile(event) {
        const tileClicked = event.target
        const value = parseInt(tileClicked.id.substr(4))
        let index = undefined
        const currentIndex = this.currentNode.state.specialIndex
        const puzzleTree = this.getAgent().problemTree
        const node = this.currentNode

        // 观察是否确实时合理滑块
        puzzleTree.children(node).forEach(x => {
            const specialIndex = x.state.specialIndex
            if (value === this.currentNode.state.oneDArray[specialIndex]) {
                index = specialIndex
                this.currentNode = x
            }
        })
        // 如果是合理的滑块，则移动
        if (index !== undefined) {
            if (this.inSolvedState) {
                this.resetSolution()
            }
            this.updateViewFromModel()
        }
    }

    /// 每次打断操作后的刷新
    resetSolution() {
        // 清空搜索树
        d3.select("#svgArea")
            .style("margin", "")
            .style("border", "")
            .selectAll("*").remove()

        // 清空结果
        this.result = undefined
        this.nodeIndex = undefined
        this.inSolvedState = false
        document.querySelector("#next").disabled = true

        // 清空结果显示
        const resultList = document.querySelector("#resultList")
        if (resultList !== null) {
            resultList.remove()
        }
    }

    // 选择 next 搜索
    clickNext() {
        this.nodeIndex += 1
        if (this.nodeIndex === this.result.nodes.length) {
            this.resetSolution()
            return
        }
        this.currentNode = this.result.nodes[this.nodeIndex]
        this.updateViewFromModel()
    }

    // 移动的动画方法
    moveTileView(tileId, targetIndex) {
        const tile = document.querySelector(`#tile${tileId}`)
        const twoDIndex = this.currentNode.state.twoDIndex(targetIndex)
        tile.style.top = `${twoDIndex[0] * (this.tileHeight + this.marginSize)}px`
        tile.style.left = `${twoDIndex[1] * (this.tileWidth + this.marginSize)}px`
    }
}
