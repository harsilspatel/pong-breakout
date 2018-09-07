function getRandomBetween(x: number, y: number): number {
    return Math.floor(Math.random() * (Math.abs(x-y)+1)) + x
  }

/**
 * 
 * @param x object's attribute
 * @param lowerBound 
 * @param rangeLength 
 * @param error 
 */
function isBetween(x: number, lowerBound: number, rangeLength: number, error: number): boolean {
    // console.log('isb')
    let upperBound = lowerBound + rangeLength;
    let absErrorByTwo = Math.floor(Math.abs(error)/2);
    // if (lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo) {console.log('isB', x)}
    return lowerBound - absErrorByTwo <= x && x <= upperBound + absErrorByTwo;
}

/**
 * This function is for brevity purposes only, it uses the inBetween function to do the calculations
 * @param x 
 * @param bound 
 * @param error 
 */
function isCollision(x: number, bound: number, error: number): boolean {
    return isBetween(x, bound, 0, error); // rangeLength is 0 as we're checking if the object collides with boundary.
}


function getEmojiNumber(n: number): string {
    const emojiNumbers: string[] = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return n.toString().split("") //convert into string and create a list splitting each digit
            .map(digit => emojiNumbers[(parseInt(digit))]) // mapping to corresponding emoji values
            .reduce((string, emoji) => string + emoji, "") // concatenating the string
}