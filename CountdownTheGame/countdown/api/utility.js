exports.getRandomItem = function getRandomItem(itemList) {
    return itemList[Math.floor(Math.random() * itemList.length)];
}