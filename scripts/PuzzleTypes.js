/// 表示可以移动的方向，这里就是一个二维向量
const Action = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],

    /// 返回所有的动作
    allActions() {
        return [this.up, this.down, this.left, this.right]
    }
}

/// 状态类，代表数码格子里的状态
class State {
    // 传入一维数组即可
    constructor(oneDArray, rows, columns, specialIndex) {
        this.oneDArray = oneDArray
        this.rows = rows
        this.columns = columns
        this.specialIndex = specialIndex
    }

    /// 从二维坐标变成一维坐标
    oneDIndex(index) {
        return index[0] * this.columns + index[1]
    }

    /// 从一维坐标变成二维坐标
    twoDIndex(index) {
        return [Math.floor(index / this.columns), index % this.columns]
    }
}

/// 节点类，用在搜索树里
class PuzzleNode {
    constructor(state, parent = null, action = null, pathCost = 0 ) {
        this.state = state
        this.parent = parent
        this.action = action
        this.pathCost = pathCost
    }

    /// 把节点往上扩展，以便得到最终的搜索序列
    expansion() {
        let current = this
        let result = []
        while (current !== null) {
            result.unshift(current)
            current = current.parent
        }
        return result
    }
}
