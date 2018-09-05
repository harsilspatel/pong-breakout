function getRandomBetween(x: number, y: number): number {
    return Math.floor(Math.random() * (Math.abs(x-y)+1)) + x
  }

function isBetween(x: number, lowerBound: number, upperBound: number, error: number): boolean {
    return lowerBound <= x - error && x + error < upperBound;
}

function isColliding(a: number, bound: number, error: number): boolean {
    return isBetween(a, bound-error, bound, error);
}