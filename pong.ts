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
    gameRounds = 1;

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

  const ballInterval = Observable.interval(fps)
  .map(() => ({
    x: parseInt(ball.attr('cx')),
    y: parseInt(ball.attr('cy')),
    r: parseInt(ball.attr('r'))
  }));

  const ballOberservable = ballInterval
    .takeUntil(ballInterval.filter(({x,y,r}) => score1 == gameRounds || score2 == gameRounds))
    .map(() => ({
      x: parseInt(ball.attr('cx')),
      y: parseInt(ball.attr('cy')),
      r: parseInt(ball.attr('r'))
    }));

    // making the ball collide the paddles
  ballOberservable
    .map(({x,y,r}) => //if x coordinates for ball and right paddle are same and cy is between the edges of paddle then reverse the direction
    // (x+r >= parseInt(rightPaddle.attr('x')) && 
      // (parseInt(rightPaddle.attr('y'))<=y && y <= (parseInt(rightPaddle.attr('y')) + parseInt(rightPaddle.attr('height'))))
      // (parseInt(rightPaddle.attr('x')) - parseInt(ball.attr('xSpeed')) <= x+r && x+r <= parseInt(rightPaddle.attr('x')) && 
      (isBetween(x+r, parseInt(rightPaddle.attr('x')), 0, parseInt(ball.attr('xSpeed'))) && 
      (isBetween(y, parseInt(rightPaddle.attr('y')), parseInt(rightPaddle.attr('height')), parseInt(ball.attr('ySpeed'))))) ||
    // (x-r <= parseInt(leftPaddle.attr('x')) + parseInt(leftPaddle.attr('width'))
    (isBetween(x-r, parseInt(leftPaddle.attr('x')) + parseInt(leftPaddle.attr('width')), 0, parseInt(ball.attr('xSpeed'))) &&
      // (parseInt(leftPaddle.attr('y')) <= y && y <= (parseInt(leftPaddle.attr('y')) + parseInt(leftPaddle.attr('height'))))) ? 
      (isBetween(y, parseInt(leftPaddle.attr('y')), parseInt(leftPaddle.attr('height')), parseInt(ball.attr('ySpeed')))) // no need to check this since the left paddle is just following it
    ) ? 
          ball.attr('xSpeed', reverseDirection(ball, 'xSpeed')) : (parseInt(ball.attr('xSpeed'))))
    .subscribe(() => (ball.attr('cx', parseInt(ball.attr('xSpeed'))+parseInt(ball.attr('cx')))))

    // making left paddle track the ball
  ballOberservable
    .filter(({y}) => 0 <= y - parseInt(leftPaddle.attr('height'))/2 && y + parseInt(leftPaddle.attr('height'))/2 <= Math.floor(svg.getBoundingClientRect().bottom) - Math.floor(svg.getBoundingClientRect().top))
    // .filter(({y}) => 0 <= parseInt(leftPaddle.attr('y')) && parseInt(leftPaddle.attr('y')) + parseInt(leftPaddle.attr('height')) <= Math.floor(svg.getBoundingClientRect().bottom) - Math.floor(svg.getBoundingClientRect().top))
    .map(({y}) => leftPaddle.attr('y', y - parseInt(leftPaddle.attr('height'))/2))
    // .subscribe(_=> ({}))

    // making the ball collide the top and bottom boundaries
  ballOberservable.map(({y,r}) => ({y,r,
    bottomBound: Math.floor(svg.getBoundingClientRect().bottom) - Math.floor(svg.getBoundingClientRect().top)}))
    // .filter(({y,r,bottomBound}) => (0 < (y - r)) && ((y + r) < bottomBound))
    // .map(({y,r,bottomBound}) => (bottomBound <= y + r) || (y - r <= 0) ? ball.attr('ySpeed', reverseDirection(ball, 'ySpeed')) : (parseInt(ball.attr('ySpeed'))))
    .map(({y,r,bottomBound}) =>  isBetween(y-r, 0, 0, parseInt(ball.attr('ySpeed'))) || isBetween(y+r, bottomBound, 0, parseInt(ball.attr('ySpeed'))) ? ball.attr('ySpeed', reverseDirection(ball, 'ySpeed')) : (parseInt(ball.attr('ySpeed'))))
    .subscribe(({}) => (ball.attr('cy', parseInt(ball.attr('ySpeed'))+parseInt(ball.attr('cy')))))

    // resetting the game 
  ballOberservable
  // .map(({x,y,r}) => (x - r + parseInt(ball.attr('xSpeed')) <= 0) ? updateAndReset(score1, ++score2, ball) : true)
  .map(({x,y,r}) => isBetween(x-r, 0, 0, parseInt(ball.attr('xSpeed'))) ? updateAndReset(score1, ++score2, ball) : true)
  .map(() => ({
    x: parseInt(ball.attr('cx')),
    y: parseInt(ball.attr('cy')),
    r: parseInt(ball.attr('r'))
  }))
  // .map(({x,y,r}) => (x + r - parseInt(ball.attr('xSpeed'))) >= Math.floor(svg.getBoundingClientRect().right) - Math.floor(svg.getBoundingClientRect().left) ? updateAndReset(++score1, score2, ball) : true)
  .map(({x,y,r}) => isBetween(x+r, Math.floor(svg.getBoundingClientRect().right) - Math.floor(svg.getBoundingClientRect().left), 0, parseInt(ball.attr('xSpeed'))) ? updateAndReset(++score1, score2, ball) : true)
  .map(_ => score1 == gameRounds || score2 == gameRounds? endGame(score1, score2) : true)
  .subscribe(_ => {})
}

function endGame(score1: Number, score2: Number){
  const score = document.getElementById("score")!
  score2 == 5 ?
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
          .subscribe(({x,y}) => paddle.attr('y', y));
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
    // mousePosObservable2();
  }
 

  // function mousePosObservable2() {
  //   const 
  //     pos = document.getElementById("pos")!,
  //     o = Observable
  //           .fromEvent<MouseEvent>(document, "mousemove")
  //           .map(({clientX, clientY})=>({x: clientX, y: clientY}));
  
  //   o.map(({x,y}) => `${x},${y}`)
  //     .subscribe(s => pos.innerHTML = s);
  
  //   o.filter(({x}) => x > 400)
  //     .subscribe(_ => pos.classList.add('highlight'));
  
  //   o.filter(({x}) => x <= 400)
  //     .subscribe(_ => pos.classList.remove('highlight'));
  // }