// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing

function breakout() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in pong.html, animate them, and make them interactive.
  // Study and complete the tasks in basicexamples.ts first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.

  var bricks = 0,
    ySpeed = 2,
    xSpeed = 2,
    lives = 3,
    fps = 10;

  const svg = document.getElementById("breakout")!;
  let paddle = new Elem(svg, 'rect')
    .attr('x', 30)
    .attr('y', 580)
    .attr('width', 120)
    .attr('height', 3)
    .attr('fill', '#FFFFFF');

  controlPaddleObservable2(paddle);

  let ball = new Elem(svg, 'circle')
  .attr('cx', 650)
  .attr('cy', 300)
  .attr('r', 7)
  .attr('fill', '#FFFFFF');

  const ballInterval = Observable.interval(fps)
  .map(() => ({
    x: Number(ball.attr('cx')),
    y: Number(ball.attr('cy')),
    r: Number(ball.attr('r'))
  }));

  const ballOberservable = ballInterval
    .takeUntil(ballInterval.filter(_ => lives == 0))
    .map(() => ({
      x: Number(ball.attr('cx')),
      y: Number(ball.attr('cy')),
      r: Number(ball.attr('r'))
    }));

  ballOberservable
  .subscribe(({x,y,r}) => (Number(paddle.attr('x')) <= x && x <= Number(paddle.attr('x')) + Number(paddle.attr('width')) &&
                     Number(paddle.attr('y')) - ySpeed <= y && y < Number(paddle.attr('y')) ? (ySpeed=-1*ySpeed): (ySpeed)))

  // making ball collide with the left and right bounds
  ballOberservable
  .map(({x,r}) => ({x,r, rightBound: svg.getBoundingClientRect().right - svg.getBoundingClientRect().left}))
    // .filter(({y,r,bottomBound}) => (0 < (y - r)) && ((y + r) < bottomBound))
    .map(({x,r,rightBound}) => (rightBound <= x + r) || (x - r <= 0) ? (xSpeed=-1*xSpeed): (xSpeed))
    .subscribe(({}) => (ball.attr('cx', xSpeed+Number(ball.attr('cx')))))

    // making the ball collide the top
  ballOberservable
    .map(({y,r}) => (y - r <= 0) ? (ySpeed=-1*ySpeed): (ySpeed))
    .subscribe(({}) => (ball.attr('cy', ySpeed+Number(ball.attr('cy')))))
  
    // resetting the game if ball strikes bottom
  ballOberservable
  .map(({x,y,r}) => (y + r - ySpeed) >= svg.getBoundingClientRect().bottom - svg.getBoundingClientRect().top ? updateAndReset2(--lives, ball) : true)
  .subscribe(_ => {})

  drawRectObservable(svg)
  // .map(rect => (Number(rect.attr('y')) <= Number(ball.attr('cy')) && Number(ball.attr('cy')) <= Number(rect.attr('y')) + Number(rect.attr('height')) &&
  //               Number(rect.attr('x')) <= Number(ball.attr('cx')) && Number(ball.attr('cx')) <= Number(rect.attr('x')) + Number(rect.attr('width')) ? console.log('bhenchod') : true))
  
  .map(rect => (Number(rect.attr('y')) <= Number(ball.attr('cy')) && Number(ball.attr('cy')) <= Number(rect.attr('y')) + Number(rect.attr('height')) &&
                Number(rect.attr('x')) <= Number(ball.attr('cx')) && Number(ball.attr('cx')) <= Number(rect.attr('x')) + Number(rect.attr('width')) ? svg.removeChild(rect.elem) : true))
  .map(_ => console.log('chodi'))
  .subscribe(_ => {})


}

function endGame2(score1: Number, score2: Number){
  const score = document.getElementById("score")!
  score2 == 5 ?
    score.innerHTML = "Congratulations player2" :
    score.innerHTML = "Congratulations player1"
}

function updateAndReset2(lives: Number, ball: Elem) {
  console.log('resetted the game!')
  const livesLabel = document.getElementById("lives")!;
  livesLabel.innerHTML = `lives: ${lives}`;
  ball.attr('cx', 450).attr('cy', 300)
}

function controlPaddleObservable2(paddle: Elem): void {
  const
    svg = document.getElementById("breakout")!,
    svgLeft = svg.getBoundingClientRect().left,
    o = Observable
          .fromEvent<MouseEvent>(svg, "mousemove")
          .map(({clientX, clientY})=>({x: clientX - svgLeft - parseInt(paddle.attr('width'))/2, y: clientY}))
          .filter(({x,y}) => 0 <= x) //for upperBound
          .filter(({x,y}) => (x + parseInt(paddle.attr('width')) <= parseInt(svg.getAttribute('width')!))) //for lowerBound
          .subscribe(({x,y}) => paddle.attr('x', x));
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    breakout();
  }

  function drawRectObservable(svg: HTMLElement): Observable<Elem> {
    const
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup');
    return Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    .map(({clientX, clientY}) => ({ clientX: clientX,
      clientY: clientY,
      x0: clientX - svg.getBoundingClientRect().left,
      y0: clientY - svg.getBoundingClientRect().top,
      rect: new Elem(svg, 'rect')
      .attr('x', String(clientX - svg.getBoundingClientRect().left))
      .attr('y', String(clientY - svg.getBoundingClientRect().top))
      .attr('width', '5')
      .attr('height', '5')
      .attr('fill', '#95B3D7'),
      svgRect: svg.getBoundingClientRect()}))
    .map(({clientX, clientY, x0, y0, svgRect, rect}) => ({
        rect: rect,
        svgRect: svgRect,
        x0: x0,
        y0: y0,
        x1: clientX - svgRect.left,
        y1: clientY - svgRect.top
      }))
    .flatMap(({svgRect, x1, y1, rect}) =>
    mousemove
    .takeUntil(mouseup)
    .map(({clientX, clientY}) => ({ rect: rect,
              left: Math.min(x1, clientX - svgRect.left),
              top: Math.min(y1, clientY - svgRect.top),
              width: Math.abs(clientX - svgRect.left - x1),
              height: Math.abs(clientY - svgRect.top - y1) })))
    .map(({rect, left, top, width, height}) =>
    rect.attr('x', left)
    .attr('y', top)
    .attr('width', String(width))
    .attr('height', String(height)));
  }