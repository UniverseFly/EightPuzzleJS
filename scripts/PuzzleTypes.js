const Action = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],

    allActions() {
        return [this.up, this.down, this.left, this.right]
    }
}

class State {
    constructor(oneDArray, rows, columns, specialIndex) {
        this.oneDArray = oneDArray
        this.rows = rows
        this.columns = columns
        this.specialIndex = specialIndex
    }

    oneDIndex(index) {
        return index[0] * this.columns + index[1]
    }

    twoDIndex(index) {
        return [Math.floor(index / this.columns), index % this.columns]
    }
}

class PuzzleNode {
    constructor(state, parent = null, action = null, pathCost = 0 ) {
        this.state = state
        this.parent = parent
        this.action = action
        this.pathCost = pathCost
    }

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
