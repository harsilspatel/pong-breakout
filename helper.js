"use strict";
function getRandomBetween(x, y) {
    return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
}
function isBetween(x, lowerBound, rangeLength, error) {
    let upperBound = lowerBound + rangeLength;
    let absErrorByTwo = Math.floor(Math.abs(error) / 2);
    if (lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo) {
        console.log('isB', x);
    }
    return lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo;
}
function isCollision(x, bound, error) {
    return isBetween(x, bound, 0, error);
}
function reverseDirection(element, attributeLabel) {
    console.log('reversed ' + attributeLabel);
    return -1 * parseInt(element.attr(attributeLabel));
}
//# sourceMappingURL=helper.js.map