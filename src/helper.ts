/**
 * this function generates a random number between x and y (both inclusive)
 * @param x lower number
 * @param y higher number
 */
function getRandomBetween(x: number, y: number): number {
  return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
}

/**
 * This function checks the whether an object's attribute is between giving bound (accounting the error)
 * @param x attribute of object which is to be checked if it is inBetween a boundary
 * @param lowerBound the lower bound
 * @param rangeLength the range of the bound
 * @param error the error that needs to be accounted
 */
function isBetween(
  x: number,
  lowerBound: number,
  rangeLength: number,
  error: number
): boolean {
  let upperBound = lowerBound + rangeLength;
  let absErrorByTwo = Math.floor(Math.abs(error) / 2);
  // if (lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo) {console.log('isB', x)}
  return lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo;
}

// The idea between having two functions is that, isBetween can check if an element is between given boundaries
// whereas isCollision checks if the collision occurs between element and the boundary.
// And as the underlying math in both the functions is similar, isCollision just calls the isBetween function

/**
 * This function is for brevity purposes only, it uses the inBetween function to do the calculations
 * @param x attribute of object which is to be checked if it is colliding with a boundary
 * @param bound the boundary to be check against for collision
 * @param error the error that needs to be accounted for collision
 */
function isCollision(x: number, bound: number, error: number): boolean {
  return isBetween(x, bound, 0, error); // rangeLength is 0 as we're checking if the object collides with boundary.
}

/**
 *
 * @param n the number which is to be converted into emoji
 */
function getEmojiNumber(n: number): string {
  const emojiNumbers: string[] = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣"
  ];
  return n
    .toString()
    .split("") //convert into string and create a list splitting each digit
    .map(digit => emojiNumbers[parseInt(digit)]) // mapping to corresponding emoji values
    .reduce((string, emoji) => string + emoji, ""); // concatenating the string
}
