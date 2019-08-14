"use strict";
function getRandomBetween(x, y) {
    return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
}
function isBetween(x, lowerBound, rangeLength, error) {
    let upperBound = lowerBound + rangeLength;
    let absErrorByTwo = Math.floor(Math.abs(error) / 2);
    return lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo;
}
function isCollision(x, bound, error) {
    return isBetween(x, bound, 0, error);
}
function getEmojiNumber(n) {
    const emojiNumbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return n.toString().split("")
        .map(digit => emojiNumbers[(parseInt(digit))])
        .reduce((string, emoji) => string + emoji, "");
}
//# sourceMappingURL=helper.js.map