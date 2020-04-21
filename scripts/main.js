let origin = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 0
]

const goal = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 0
]

let puzzle;
while (true) {
    origin.forEach((value, index, array) => {
        swapArray(array, index, random(index, array.length))
    })
    puzzle = new Puzzle(3, 3, origin, goal)
    if (puzzle.isSolvable()) {
        break
    }
}
console.log(origin)

const puzzleTree = new PuzzleTree(puzzle)
const puzzleAgent = new PuzzleAgent(puzzleTree)

State.prototype.description = function () {
    let description = ""
    for (let i = 0; i < this.rows; ++i) {
        if (i !== 0) {
            description += "\n"
        }
        for (let j = 0; j < this.columns; ++j) {
            if (j !== 0) {
                description += ", "
            }
            description += this.oneDArray[this.oneDIndex([i, j])]
        }
    }
    return description
}

const result = puzzleAgent.bestFirstSearch()
const expansion = result.node.expansion()
console.log(
    expansion.length,/**/
    result.orderIndices.length,
    result.record.length
)

result.orderIndices.forEach(index => {
    let record = result.record[index]
    console.log("===")
    console.log(record.state.description())
    console.log(`= ${record.cost} =`)

    record.children.forEach(index => {
        console.log(">>>")
        console.log(result.record[index].state.description())
        console.log(`> ${result.record[index].cost} >`)
    })
})

expansion.forEach(value => {
    console.log(value.state.description())
})

function createPuzzle(event) {
    const index = event.target.selectedIndex

    let rows = 3
    let columns = 3
    if (index === 1) {
        rows = 4
        columns = 4
    }

    document.querySelector("#puzzle").remove()
    const puzzle = document.createElement("div")
    puzzle.id = "puzzle"
    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < columns; ++j) {
            const tile = document.createElement("div")
            const id = (i * columns + j).toString()
            tile.id = `tile${id}`
            tile.textContent = id
            puzzle.appendChild(tile)
        }
    }
    document.querySelector("body").appendChild(puzzle)
}

const viewController = new ViewController()