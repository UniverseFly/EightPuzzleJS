/// 数码的数据结构
class Puzzle {
    /// 随机生成符合条件的数码
    static random(rows, columns) {
        const goal = this.goalGenerator(rows, columns)
        const origin = this.originGenerator(rows, columns, goal)
        return new Puzzle(rows, columns, origin, goal)
    }

    /// 目标设置为从1开始的逐步增加的序列
    static goalGenerator(rows, columns) {
        let goal = [...Array(rows * columns).keys()].map(x => x + 1)
        goal[goal.length - 1] = 0
        return goal
    }

    /// 计算逆序数，不断随机生成初始状态
    static originGenerator(rows, columns, goal) {
        let origin = [...Array(rows * columns).keys()]
        while (true) {
            origin.forEach((value, index, array) => {
                swapArray(array, index, random(index, array.length))
            })
            const puzzle = new Puzzle(3, 3, origin, goal)
            if (puzzle.isSolvable()) {
                return origin
            }
        }
    }

    /// 根据行列，初始状态目标状态构造
    constructor(rows, columns, origin, goal) {
        function sum(arr) {
            let result = 0
            arr.forEach(value => result += value)
            return result
        }

        function set(arr) {
            return arr.filter((value, index, array) => array.indexOf(value) === index)
        }

        /// 合理化判断
        const zeroIndex = origin.indexOf(0)
        console.assert(zeroIndex !== -1, "必须要包含0")

        const setOrigin = set(origin)
        console.assert(setOrigin.length === origin.length, "不允许重复的值")
        console.assert(equalArray(setOrigin.sort(), set(goal).sort()), "初始状态和结束状态必须包含相同值")

        this.origin = new State(origin, rows, columns, zeroIndex)
        this.goal = new State(goal, rows, columns, goal.indexOf(0))
    }

    /// 返回一个状态下可能的动作
    actions(state) {
        return Action.allActions().filter(function (action) {
            const originalTwoDIndex = state.twoDIndex(state.specialIndex)

            const movedIndexTwoD = addTuple(originalTwoDIndex, action)
            return !(movedIndexTwoD[0] < 0 || movedIndexTwoD[0] === state.rows ||
                movedIndexTwoD[1] < 0 || movedIndexTwoD[1] === state.columns);
        })
    }

    /// 转移函数
    result(state, action) {
        const newSpecialIndex = state.oneDIndex(addTuple(state.twoDIndex(state.specialIndex), action))
        const oneDArray = state.oneDArray.map(x => x)
        swapArray(oneDArray, state.specialIndex, newSpecialIndex)

        return new State(oneDArray, state.rows, state.columns, newSpecialIndex)
    }

    /// 路径耗散是 1
    stepCost(state, action) {
        return 1
    }

    /// 判断是否是目标状态
    isGoal(state) {
        return equalArray(state.oneDArray, this.goal.oneDArray)
    }

    /// 利用逆序数判断是否可行
    isSolvable() {
        const originInversionModTwo = inversion(this.origin.oneDArray.filter(x => x !== 0))
        const goalInversionModTwo = inversion(this.goal.oneDArray.filter(x => x !== 0))
        const inversionEqual = originInversionModTwo === goalInversionModTwo
        const odd = originInversionModTwo % 2 === 1
        if (odd) {
            return inversionEqual
        } else {
            const originModTwo = (this.origin.rows - this.origin.twoDIndex(this.origin.specialIndex)[0]) % 2
            const goalModTwo = (this.goal.rows - this.goal.twoDIndex(this.goal.specialIndex)[0]) % 2
            if (originModTwo === goalModTwo) {
                return inversionEqual
            } else {
                return !inversionEqual
            }
        }
    }
}
