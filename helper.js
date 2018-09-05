"use strict";
function getRandomBetween(x, y) {
    return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
}
function isBetween(x, lowerBound, upperBound, error) {
    return lowerBound <= x - error && x + error < upperBound;
}
function isColliding(a, bound, error) {
    return isBetween(a, bound - error, bound, error);
}
//# sourceMappingURL=helper.js.map