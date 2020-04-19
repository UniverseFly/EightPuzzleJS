class Puzzle {
    constructor(rows, columns, origin, goal) {
        function sum(arr) {
            let result = 0
            arr.forEach(value => result += value)
            return result
        }

        function set(arr) {
            return arr.filter((value, index, array) => array.indexOf(value) === index)
        }

        const zeroIndex = origin.indexOf(0)
        console.assert(zeroIndex !== -1, "必须要包含0")

        const setOrigin = set(origin)
        console.assert(setOrigin.length === origin.length, "不允许重复的值")
        console.assert(equalArray(setOrigin.sort(), set(goal).sort()), "初始状态和结束状态必须包含相同值")

        this.origin = new State(origin, rows, columns, zeroIndex)
        this.goal = new State(goal, rows, columns, goal.indexOf(0))
    }

    actions(state) {
        return Action.allActions().filter(function (action) {
            const originalTwoDIndex = state.twoDIndex(state.specialIndex)

            const movedIndexTwoD = addTuple(originalTwoDIndex, action)
            return !(movedIndexTwoD[0] < 0 || movedIndexTwoD[0] === state.rows ||
                movedIndexTwoD[1] < 0 || movedIndexTwoD[1] === state.columns);
        })
    }

    result(state, action) {
        const newSpecialIndex = state.oneDIndex(addTuple(state.twoDIndex(state.specialIndex), action))
        const oneDArray = state.oneDArray.map(x => x)
        swapArray(oneDArray, state.specialIndex, newSpecialIndex)

        return new State(oneDArray, state.rows, state.columns, newSpecialIndex)
    }

    stepCost(state, action) {
        return 1
    }

    isGoal(state) {
        return equalArray(state.oneDArray, this.goal.oneDArray)
    }

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
