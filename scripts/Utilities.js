/// 工具函数

/// 增加两个数组
function addTuple(lhs, rhs) {
    return lhs.map((element, index) => element + rhs[index])
}

/// 交换数组元素
function swapArray(arr, i, j) {
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}

/// 判断两个数组是否相等
function equalArray(lhs, rhs) {
    for (let index = 0; index < lhs.length; index += 1) {
        if (lhs[index] !== rhs[index]) {
            return false
        }
    }
    return true;
}

/// 插入排序求解逆序数
/// O(n2)
function inversion(array) {
    array = array.map(x => x)
    let result = 0
    for (let index = 1; index < array.length; index += 1) {
        let insertionIndex = index
        let insertionElement = array[index]
        while (insertionIndex !== 0 && insertionElement < array[insertionIndex - 1]) {
            result += 1
            array[insertionIndex] = array[insertionIndex - 1]
            insertionIndex -= 1
        }
        array[insertionIndex] = insertionElement
    }
    return result
}

/// [a, b) 里生成随机数
function random(a, b) {
    return a + Math.floor(Math.random() * (b - a))
}
