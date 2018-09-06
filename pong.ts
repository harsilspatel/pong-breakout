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

  var
    speed = 1,
    fps = 2,
  score1 = 0,
    score2 = 0,
    gameRounds = 3;

  const svg = document.getElementById("canvas")!;
  let leftPaddle = new Elem(svg, 'rect')
    .attr('x', 10)
    .attr('y', 80)
    .attr('width', 3)
    .attr('height', 120)
    .attr('fill', '#FFFFFF');

  let rightPaddle = new Elem(svg, 'rect')
    .attr('x', 900-10-3) //canvas - distanceFromCanvas - width
    .attr('y', 70)
    .attr('width', 3)
    .attr('height', 120)
    .attr('fill', '#FFFFFF');

  controlPaddleObservable(rightPaddle);

  let ball = new Elem(svg, 'circle')
  .attr('cx', getRandomBetween(400,500))
  .attr('cy', getRandomBetween(250,350))
  .attr('r', 7)
  .attr('fill', '#FFFFFF')
  .attr('xSpeed', speed)
  .attr('ySpeed', speed);

  const mainInterval = Observable.interval(fps)
  .map(() => ({
    x: parseInt(ball.attr('cx')),
    y: parseInt(ball.attr('cy')),
    r: parseInt(ball.attr('r'))
  }));

  const mainObservable = mainInterval
    .takeUntil(mainInterval.filter(({x,y,r}) => score1 == gameRounds || score2 == gameRounds))
    .map(() => ({
      x: parseInt(ball.attr('cx')),
      y: parseInt(ball.attr('cy')),
      r: parseInt(ball.attr('r')),
      xSpeed: parseInt(ball.attr('xSpeed')),
      ySpeed: parseInt(ball.attr('ySpeed')),
      // paddleHeight: parseInt(rightPaddle.attr('height')), //both paddles have same height and widths
      // paddleWidth: parseInt(rightPaddle.attr('width'))
    }));

    // making the ball collide the paddles
  // mainObservable
  //   .map(({x,y,r, xSpeed, ySpeed}) => //if x coordinates for ball and right paddle are same and cy is between the edges of paddle then reverse the direction
  //     (isCollision(x+r, parseInt(rightPaddle.attr('x')), xSpeed) && 
  //     (isBetween(y, parseInt(rightPaddle.attr('y')), parseInt(rightPaddle.attr('height')), ySpeed))) ||
  //   (isCollision(x-r, parseInt(leftPaddle.attr('x')) + parseInt(leftPaddle.attr('width')), xSpeed) &&
  //     (isBetween(y, parseInt(leftPaddle.attr('y')), parseInt(leftPaddle.attr('height')), ySpeed)) // no need to check this since the left paddle is just following it
  //   ) ? 
  //         ball.attr('xSpeed', reverseDirection(ball, 'xSpeed')) : xSpeed )
  //   .subscribe(() => (ball.attr('cx', parseInt(ball.attr('xSpeed'))+parseInt(ball.attr('cx')))))

    
    // making the ball collide the paddles
  mainObservable
  .map(({x, y, r, xSpeed, ySpeed}) => ({x,y,r, xSpeed, ySpeed, paddleHeight: parseInt(rightPaddle.attr('height')), paddleWidth: parseInt(rightPaddle.attr('width'))})) //both paddles have same height and widths
  .filter(({x,y,r, xSpeed, ySpeed, paddleHeight, paddleWidth}) => //if x coordinates for ball and right paddle are same and cy is between the edges of paddle then reverse the direction
    (isCollision(x+r, parseInt(rightPaddle.attr('x')), xSpeed) && 
    (isBetween(y, parseInt(rightPaddle.attr('y')), paddleHeight, ySpeed))) ||
  (isCollision(x-r, parseInt(leftPaddle.attr('x')) + paddleWidth, xSpeed) &&
    (isBetween(y, parseInt(leftPaddle.attr('y')), paddleHeight, ySpeed)) // no need to check this since the left paddle is just following it
  )).subscribe(({xSpeed}) => ball.attr('xSpeed', -1*xSpeed))

  mainObservable.subscribe(({x, y, xSpeed, ySpeed}) => ball.attr('cx', x+xSpeed).attr('cy',y+ySpeed))

  // making the ball collide the top and bottom boundaries
  mainObservable
    .filter(({y,r,ySpeed}) =>  isCollision(y-r, 0, ySpeed) || isCollision(y+r, Math.floor(svg.getBoundingClientRect().height), ySpeed))
    .subscribe(({ySpeed}) => ball.attr('ySpeed', -1*ySpeed))
    // .subscribe(({}) => (ball.attr('cy', parseInt(ball.attr('ySpeed'))+parseInt(ball.attr('cy')))))


    // making left paddle track the ball 
  mainObservable
    // .filter(({y}) => 0 <= y - parseInt(leftPaddle.attr('height'))/2 && y + parseInt(leftPaddle.attr('height'))/2 <= Math.floor(svg.getBoundingClientRect().height))
    .map(({y}) => ({y, paddleHeight:parseInt(rightPaddle.attr('height'))}))
    .filter(({y,paddleHeight}) => isBetween(y, Math.floor(0+paddleHeight/2), Math.floor(svg.getBoundingClientRect().height - paddleHeight),0))
    .subscribe(({y, paddleHeight}) => leftPaddle.attr('y', y - Math.floor(paddleHeight/2)))

  //   // making the ball collide the top and bottom boundaries
  // mainObservable
  //   .map(({y,r,ySpeed}) =>  isCollision(y-r, 0, ySpeed) || isCollision(y+r, Math.floor(svg.getBoundingClientRect().height), ySpeed) ? ball.attr('ySpeed', reverseDirection(ball, 'ySpeed')) : ySpeed)
  //   .subscribe(({}) => (ball.attr('cy', parseInt(ball.attr('ySpeed'))+parseInt(ball.attr('cy')))))



    // resetting the game 
  mainObservable
  .map(({x,xSpeed,r}) => isCollision(x-r, 0, xSpeed) ? updateAndReset(score1, ++score2, ball) : true)
  .map(() => ({
    x: parseInt(ball.attr('cx')),
    y: parseInt(ball.attr('cy')),
    r: parseInt(ball.attr('r'))
  }))
  .map(({x,y,r}) => isCollision(x+r, Math.floor(svg.getBoundingClientRect().right) - Math.floor(svg.getBoundingClientRect().left), parseInt(ball.attr('xSpeed'))) ? updateAndReset(++score1, score2, ball) : true)
  .map(_ => score1 == gameRounds || score2 == gameRounds? endGame(score1, score2) : true)
  .subscribe(_ => {})
}

function endGame(score1: Number, score2: Number){
  const score = document.getElementById("score")!
  score2 == 3 ?
    score.innerHTML = "Congratulations player2" :
    score.innerHTML = "Congratulations player1"
}

function updateAndReset(score1: Number, score2: Number, ball: Elem) {
  console.log('resetted the game!')
  const score = document.getElementById("score")!;
  score.innerHTML = `${score1} ${score2}`;
  ball.attr('cx', getRandomBetween(400,500)).attr('cy', getRandomBetween(250,350))
}

function controlPaddleObservable(paddle: Elem): void {
  const
    svg = document.getElementById("canvas")!,
    svgTop = Math.floor(svg.getBoundingClientRect().top),
    o = Observable
          .fromEvent<MouseEvent>(svg, "mousemove")
          .map(({clientX, clientY})=>({x: clientX, y: clientY - svgTop - parseInt(paddle.attr('height'))/2}))
          .filter(({x,y}) => 0 <= y) //for upperBound
          .filter(({x,y}) => (y + parseInt(paddle.attr('height')) <= parseInt(svg.getAttribute('height')!))) //for lowerBound
          // .filter(({x,y}) => isBetween(y, 0, Math.floor(svg.getBoundingClientRect().height), 0))
          .subscribe(({x,y}) => paddle.attr('y', y));
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
}
 