// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing

function pong() {
  // Inside this function you will use the classes and functions
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in pong.html, animate them, and make them interactive.
  // Study and complete the tasks in basicexamples.ts first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!
  // Explain which ideas you have used ideas from the lectures to
  // create reusable, generic functions.

  // the pong game stats
  const pongStats = {
      score1: 0,
      score2: 0,
      maxScore: 3
    },
    svg = document.getElementById("canvas")!;

  // creating a divider line
  let divider: Elem = new Elem(svg, "line")
    .attr("x1", svg.getBoundingClientRect().width / 2)
    .attr("y1", 0)
    .attr("x2", svg.getBoundingClientRect().width / 2)
    .attr("y2", svg.getBoundingClientRect().height)
    .attr("stroke", "#444444")
    .attr("stroke-width", 4)
    .attr("stroke-dasharray", 20);

  // left paddle is the one the computer controls
  let leftPaddle: Elem = new Elem(svg, "rect")
    .attr("x", 10)
    .attr("y", 80)
    .attr("width", 3)
    .attr("height", 120)
    .attr("fill", "#FFFFFF");

  // paddleArea is the highlighted area wherein the rightPaddle can move
  let paddleArea: Elem = new Elem(svg, "rect")
    .attr("width", 100)
    .attr("height", svg.getBoundingClientRect().height)
    .attr("x", svg.getBoundingClientRect().width - 100)
    .attr("y", 0)
    .attr("fill", "#444444");

  // the human controllable paddle
  let rightPaddle: Elem = new Elem(svg, "rect")
    .attr("x", 900 - 10 - 3) // canvas - distanceFromCanvas - width
    .attr("y", 70)
    .attr("width", 3)
    .attr("height", 120)
    .attr("fill", "#FFFFFF");

  // the pong ball
  let ball: Elem = new Elem(svg, "circle")
    .attr("cx", getRandomBetween(300, 600))
    .attr("cy", getRandomBetween(200, 400))
    .attr("r", 7)
    .attr("fill", "#FFFFFF")
    .attr("xSpeed", 7)
    .attr("ySpeed", 3);

  // the observable, which is triggered from mousemove event, that is used to control rightPaddle
  // inspiration: basicexamples
  Observable.fromEvent<MouseEvent>(svg, "mousemove")
    .map(({ clientX, clientY }) => ({
      x: Math.floor(
        clientX -
          svg.getBoundingClientRect().left -
          parseInt(rightPaddle.attr("width")) / 2
      ),
      y: Math.floor(
        clientY -
          svg.getBoundingClientRect().top -
          parseInt(rightPaddle.attr("height")) / 2
      )
    }))
    .filter(
      ({ x, y }) =>
        0 <= y &&
        y + parseInt(rightPaddle.attr("height")) <=
          svg.getBoundingClientRect().height
    ) //for upperBound
    .filter(({ x, y }) =>
      isBetween(x, svg.getBoundingClientRect().width - 100, 100, 0)
    )
    .subscribe(({ x, y }) => rightPaddle.attr("x", x).attr("y", y));

  // the mainInterval (or the main clock that ticks)
  // inspiration: basicexamples
  const mainInterval = Observable.interval(10).map(() => ({
    pongStats
  }));

  // this is the obervable, which acts like a clock that `ticks`
  const mainObservable = mainInterval
    .takeUntil(
      mainInterval.filter(
        _ =>
          pongStats.score1 == pongStats.maxScore || // takeUntil one of the player's reaches the maxScore
          pongStats.score2 == pongStats.maxScore
      )
    )
    .map(_ => ({
      x: parseInt(ball.attr("cx")),
      y: parseInt(ball.attr("cy")),
      r: parseInt(ball.attr("r")),
      xSpeed: parseInt(ball.attr("xSpeed")),
      ySpeed: parseInt(ball.attr("ySpeed")),
      pongStats
    }));

  // In most of the isCollision() and isBetween() functions, the error is xSpeed or ySpeed, because those are the values
  // being added to the x or y coordinate of the ball. So if it has those values as the error it will not cross over the
  // boundary or paddle and will actually be computed as `True, the collision has occured or the ball is inBetween`.

  // making the ball collide the paddles
  mainObservable
    .map(({ x, y, r, xSpeed, ySpeed }) => ({
      x,
      y,
      r,
      xSpeed,
      ySpeed,
      paddleHeight: parseInt(rightPaddle.attr("height")),
      paddleWidth: parseInt(rightPaddle.attr("width"))
    })) //both paddles have same height and widths
    .filter(
      ({ x, y, r, xSpeed, ySpeed, paddleHeight, paddleWidth }) =>
        // if horizontal edge (x+r or x-r) of the ball and the paddle are close by (in the range of `error`) and cy is between the edges of paddle then reverse the direction
        (isCollision(x + r, parseInt(rightPaddle.attr("x")), 2 * xSpeed) && //Please note that error here is 2*xSpeed, so that when paddle is being moving towards the ball it can hit it (given that speed is slow enough). However, as it is twice the normal error, it may look like the ball is not touching the paddle when striking.
          isBetween(
            y,
            parseInt(rightPaddle.attr("y")),
            paddleHeight,
            ySpeed
          )) ||
        (isCollision(
          x - r,
          parseInt(leftPaddle.attr("x")) + paddleWidth,
          xSpeed
        ) &&
          isBetween(y, parseInt(leftPaddle.attr("y")), paddleHeight, ySpeed))
    )
    .subscribe(({ xSpeed }) => ball.attr("xSpeed", -1 * xSpeed));

  // making the ball move
  mainObservable.subscribe(({ x, y, xSpeed, ySpeed }) =>
    ball.attr("cx", x + xSpeed).attr("cy", y + ySpeed)
  );

  // making the ball collide the top and bottom boundaries
  mainObservable
    .filter(
      ({ y, r, ySpeed }) =>
        isCollision(y - r, 0, ySpeed) || // if the ball is close enough to the edge (in the range of ySpeed).
        isCollision(
          y + r,
          Math.floor(svg.getBoundingClientRect().height),
          ySpeed
        )
    )
    .subscribe(({ ySpeed }) => ball.attr("ySpeed", -1 * ySpeed));

  // making left paddle track the ball. we will map the ball's cy to the paddle's centre
  mainObservable
    .map(({ y }) => ({ y, paddleHeight: parseInt(rightPaddle.attr("height")) }))
    .filter(({ y, paddleHeight }) =>
      isBetween(
        y,
        Math.floor(0 + paddleHeight / 2),
        Math.floor(svg.getBoundingClientRect().height - paddleHeight),
        0
      )
    ) // filtering the cy coordinate of ball when it is `paddleHeight/2` units away from both the top and bottom bounds
    .subscribe(({ y, paddleHeight }) =>
      leftPaddle.attr("y", y - Math.floor(paddleHeight / 2))
    ); // mapping the balls cy to the paddle's centre y coordinate

  // resetting the game
  mainObservable
    .filter(
      ({ x, xSpeed, r }) =>
        isCollision(x - r, 0, xSpeed) || // reset if the ball's left most edge is close enough to the 0
        isCollision(
          x + r,
          Math.floor(svg.getBoundingClientRect().width),
          xSpeed
        )
    ) // reset if the ball's right most edge is close enough to the right bound
    .forEach(({ x, pongStats }) =>
      x < svg.getBoundingClientRect().width / 2
        ? scored(pongStats.score1, ++pongStats.score2, pongStats.maxScore)
        : scored(++pongStats.score1, pongStats.score2, pongStats.maxScore)
    ) // if the game was resetted then check if the ball is on the left side then player2 scored, else player1 did
    .subscribe(({ xSpeed, ySpeed }) =>
      ball
        .attr("cx", getRandomBetween(400, 500))
        .attr("cy", getRandomBetween(250, 350))
        .attr("xSpeed", -1 * xSpeed)
        .attr("ySpeed", -1 * ySpeed)
    ); // spawn the ball randomly and reverse the x and y speeds, just for fun!
}

/**
 *
 * @param score1 player1's score
 * @param score2 player2's score
 * @param maxScore the max achievable score
 */
function scored(score1: number, score2: number, maxScore: number) {
  const score: HTMLElement = document.getElementById("score")!;
  score.innerHTML = `${getEmojiNumber(score1)} : ${getEmojiNumber(score2)}`;
  const result: HTMLElement = document.getElementById("result")!;

  // if the score reaches max score then print a congratulating message
  if (score2 == maxScore) {
    result.innerHTML = "Congratulations Player 2 🎉";
  } else if (score1 == maxScore) {
    result.innerHTML = "Congratulations Player 1 ✨";
  }
}

// the following simply runs your pong function on window load. Make sure to leave it in place.
if (typeof window != "undefined")
  window.onload = () => {
    pong();
  };
