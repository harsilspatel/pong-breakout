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

  let
    score1 = 0,
    score2 = 0,
    speed = 4,
    fps = 10;
  const
    gameRounds = 5,
  svg = document.getElementById("canvas")!;

  let divider = new Elem(svg, 'line')
    .attr('x1', svg.getBoundingClientRect().width/2)
    .attr('y1', 0)
    .attr('x2', svg.getBoundingClientRect().width/2)
    .attr('y2', svg.getBoundingClientRect().height)
    .attr('stroke', '#444444')
    .attr('stroke-width', 4)
    .attr('stroke-dasharray', 20)

  let leftPaddle = new Elem(svg, 'rect')
    .attr('x', 10)
    .attr('y', 80)
    .attr('width', 3)
    .attr('height', 120)
    .attr('fill', '#FFFFFF');

    const paddleArea = new Elem(svg, 'rect')
    .attr('width', 100)
    .attr('height', svg.getBoundingClientRect().height)
    .attr('x', svg.getBoundingClientRect().width - 100)
    .attr('y', 0)
    .attr('fill', '#444444')

  let rightPaddle = new Elem(svg, 'rect')
    .attr('x', 900-10-3) //canvas - distanceFromCanvas - width
    .attr('y', 70)
    .attr('width', 3)
    .attr('height', 120)
    .attr('fill', '#FFFFFF');

  let ball = new Elem(svg, 'circle')
  .attr('cx', getRandomBetween(400,500))
  .attr('cy', getRandomBetween(250,350))
  .attr('r', 7)
  .attr('fill', '#FFFFFF')
  .attr('xSpeed', speed)
  .attr('ySpeed', speed);


  Observable
    .fromEvent<MouseEvent>(svg, "mousemove")
    .map(({clientX, clientY})=>({x: Math.floor(clientX -svg.getBoundingClientRect().left - parseInt(rightPaddle.attr('width'))/2), y: Math.floor(clientY -svg.getBoundingClientRect().top - parseInt(rightPaddle.attr('height'))/2)}))
    .filter(({x,y}) => 0 <= y && (y + parseInt(rightPaddle.attr('height')) <= (svg.getBoundingClientRect().height))) //for upperBound
    .filter(({x, y}) => isBetween(x, svg.getBoundingClientRect().width - 100, 100, 0))
    .subscribe(({x,y}) => rightPaddle.attr('x', x).attr('y', y));



  const mainInterval = Observable.interval(fps);
  // .map(() => ({
  //   score1: 0,
  //   score2: 0,
  //   gameRounds: 3
  // }));

  const mainObservable = mainInterval
  // {score1,score2,gameRounds}
    .takeUntil(mainInterval.filter(_ => score1 == gameRounds || score2 == gameRounds))
    .map(_ => ({
      x: parseInt(ball.attr('cx')),
      y: parseInt(ball.attr('cy')),
      r: parseInt(ball.attr('r')),
      xSpeed: parseInt(ball.attr('xSpeed')),
      ySpeed: parseInt(ball.attr('ySpeed')),
      score1,
      score2,
      gameRounds
    }));


    
    // making the ball collide the paddles
  mainObservable
  .map(({x, y, r, xSpeed, ySpeed}) => ({x,y,r, xSpeed, ySpeed, paddleHeight: parseInt(rightPaddle.attr('height')), paddleWidth: parseInt(rightPaddle.attr('width'))})) //both paddles have same height and widths
  .filter(({x,y,r, xSpeed, ySpeed, paddleHeight, paddleWidth}) => //if x coordinates for ball and right paddle are same and cy is between the edges of paddle then reverse the direction
    (isCollision(x+r, parseInt(rightPaddle.attr('x')), 2*xSpeed) && //Please note that error here is 2*xSpeed, so that when paddle is being moving towards the ball it can hit it. However, as it is twice the normal error, it may look like the ball is not touching the paddle when striking.  
    (isBetween(y, parseInt(rightPaddle.attr('y')), paddleHeight, ySpeed))) ||
    (isCollision(x-r, parseInt(leftPaddle.attr('x')) + paddleWidth, xSpeed) &&
    (isBetween(y, parseInt(leftPaddle.attr('y')), paddleHeight, ySpeed)))) // no need to check this since the left paddle is just following it
  .subscribe(({xSpeed}) => ball.attr('xSpeed', -1*xSpeed))

  // making the ball move
  mainObservable.subscribe(({x, y, xSpeed, ySpeed}) => ball.attr('cx', x+xSpeed).attr('cy',y+ySpeed))

  // making the ball collide the top and bottom boundaries
  mainObservable
    .filter(({y,r,ySpeed}) =>  isCollision(y-r, 0, ySpeed) || isCollision(y+r, Math.floor(svg.getBoundingClientRect().height), ySpeed))
    .subscribe(({ySpeed}) => ball.attr('ySpeed', -1*ySpeed))


    // making left paddle track the ball 

  mainObservable
  .map(({y}) => ({y, paddleHeight:parseInt(rightPaddle.attr('height'))}))
  .filter(({y,paddleHeight}) => isBetween(y, Math.floor(0+paddleHeight/2), Math.floor(svg.getBoundingClientRect().height - paddleHeight),0))
  .subscribe(({y, paddleHeight}) => leftPaddle.attr('y', y - Math.floor(paddleHeight/2)))

  // mainObservable
  //   .map(({x, y, ySpeed}) => ({x, y,ySpeed, paddleY: parseInt(leftPaddle.attr('y')), paddleHeightByTwo: Math.floor(parseInt(rightPaddle.attr('height'))/2)}))
  //   .filter(({y,paddleHeightByTwo}) => isBetween(y, Math.floor(0+paddleHeightByTwo), Math.floor(svg.getBoundingClientRect().height - 2*paddleHeightByTwo),0))
  //   .filter(({x}) => x < svg.getBoundingClientRect().width/2)
  //   .forEach(({y, paddleY, paddleHeightByTwo, ySpeed}) => console.log(y,paddleY, paddleHeightByTwo, Math.floor(y - (paddleY + paddleHeightByTwo)), Math.floor(y - (paddleY + paddleHeightByTwo)) > 0))
  //   .subscribe(({y, paddleY, paddleHeightByTwo, ySpeed}) => leftPaddle.attr('y', Math.floor(y - (paddleY + paddleHeightByTwo)) > 0 ? paddleY + Math.abs(ySpeed/2) : paddleY - Math.abs(ySpeed/2) ))

// resetting the game 
mainObservable
.filter(({x,xSpeed,r}) => isCollision(x-r, 0, xSpeed) || isCollision(x+r, Math.floor(svg.getBoundingClientRect().right) - Math.floor(svg.getBoundingClientRect().left), parseInt(ball.attr('xSpeed'))))
// .map(({x,score1,score2}) => document.getElementById("score")!.innerHTML = (x < 0 ? `${score1} ${++score2}` : `${++score1} ${score2}`))
// .map(({score1,score2,gameRounds}) => document.getElementById("score")!.innerHTML = ())
.forEach(({x}) => (x < svg.getBoundingClientRect().width/2 ? scored(score1,++score2,gameRounds) : scored(++score1,score2,gameRounds)))
.subscribe(({xSpeed, ySpeed}) => ball.attr('cx', getRandomBetween(400,500)).attr('cy', getRandomBetween(250,350)).attr('xSpeed', -1*xSpeed).attr('ySpeed', -1*ySpeed))
}

function scored(score1: number, score2: number, gameRounds: number) {
  const score = document.getElementById("score")!;
  score.innerHTML = `${getEmojiNumber(score1)} : ${getEmojiNumber(score2)}`;

  const result = document.getElementById("result")!
  if (score2 == gameRounds) {
    result.innerHTML = "Congratulations Player 2 🎉"
  } else if (score1 == gameRounds) {
    result.innerHTML = "Congratulations Player 1 ✨"
  }
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
}
 