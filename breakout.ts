// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing

function breakout() {

  var speed = 1,
    lives = 1,
    fps = 5,
    bricks: Elem[] = [];
    const svg = document.getElementById("breakout")!;


  const bricksObservable = Observable.interval(1);
  bricksObservable
    .takeUntil(bricksObservable.filter(i => i == 11))
    // .forEach((i) => console.log(i))
    .forEach(i => (
      bricks.push(
      new Elem(svg, 'rect')
      .attr('x',((i-1)*90))
      .attr('y', 20)
      .attr('width', 90)
      .attr('height', 30)
      .attr('fill', ('#' + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16))) //16777215 being FFFFFF
    )))
    .forEach(i => (
      bricks.push(
      new Elem(svg, 'rect')
      .attr('x',((i-1)*90))
      .attr('y', 50)
      .attr('width', 90)
      .attr('height', 30)
      .attr('fill', ('#' + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16))) //16777215 being FFFFFF
    )))
    .forEach(i => (
      bricks.push(
      new Elem(svg, 'rect')
      .attr('x',((i-1)*90))
      .attr('y', 80)
      .attr('width', 90)
      .attr('height', 30)
      .attr('fill', ('#' + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16))) //16777215 being FFFFFF
    )))
    .subscribe(_ => {})

    // bricks.push(
    //   new Elem(svg, 'rect')
    //   .attr('x',500)
    //   .attr('y', 300)
    //   .attr('width', 200)
    //   .attr('height', 300)
    //   .attr('fill', ('#' + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16) + getRandomBetween(0+30,255-30).toString(16)))
    // )
    
    
    

  let paddle = new Elem(svg, 'rect')
    .attr('x', 30)
    .attr('y', 580)
    .attr('width', 120)
    .attr('height', 3)
    .attr('fill', '#FFFFFF');

  controlPaddleObservable2(paddle);

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
    .takeUntil(mainInterval.filter(_ => lives == 0))
    .map(() => ({
      x: parseInt(ball.attr('cx')),
      y: parseInt(ball.attr('cy')),
      r: parseInt(ball.attr('r')),
      xSpeed: parseInt(ball.attr('xSpeed')),
      ySpeed: parseInt(ball.attr('ySpeed')),
    }));

  // making the ball collide with the paddle
  mainObservable
  .filter(({x,y,r,xSpeed,ySpeed}) => (isBetween(x, parseInt(paddle.attr('x')), parseInt(paddle.attr('width')), xSpeed) && isCollision(y+r, parseInt(paddle.attr('y')), ySpeed)))
  .subscribe(({ySpeed}) =>  ball.attr('ySpeed', -1*ySpeed))

  // making ball collide with the left and right bounds
  mainObservable
    .filter(({x,r}) => isCollision(x+r, Math.floor(svg.getBoundingClientRect().width), parseInt(ball.attr('xSpeed'))) || isCollision(x-r, 0, parseInt(ball.attr('xSpeed'))))
    .subscribe(({xSpeed}) => ball.attr('xSpeed', -1*xSpeed))

    // making the ball collide the top
  mainObservable
    .filter(({y,r}) => isCollision(y-r, 0, parseInt(ball.attr('ySpeed'))))
    .subscribe(({ySpeed}) => (ball.attr('ySpeed', -1*ySpeed)))

    // making the ball move
  mainObservable.subscribe(({x, y, xSpeed, ySpeed}) => ball.attr('cx', x+xSpeed).attr('cy',y+ySpeed))
  
    // resetting the game if ball strikes bottom
  mainObservable
  .filter(({x,y,r}) => isCollision(y+r, Math.floor(svg.getBoundingClientRect().height), parseInt(ball.attr('ySpeed'))))
  .subscribe(_ => updateAndReset2(--lives, ball))

//   mainObservable
//   .map(({x,y,r, xSpeed, ySpeed}) => bricks.map((brick:Elem) => ({ brick, brickX:parseInt(brick.attr('x')), brickY:parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height'))}))
//   .filter(({brick, brickX, brickY, brickWidth, brickHeight}) => (
//     (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y-r, brickY + brickHeight, ySpeed)) || //bottom
//     (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y+r, brickY, ySpeed)) || //top
//     (isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x+r, brickX, xSpeed))
//   )).map(({brick}) => removeAndReverse(bricks, brick, ball))
// ).subscribe(_ => {})

mainObservable
  .map(({x,y,r, xSpeed, ySpeed}) => bricks.map((brick:Elem) => ({ brick, brickX:parseInt(brick.attr('x')), brickY:parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height'))}))
  .filter(({brick, brickX, brickY, brickWidth, brickHeight}) => (
    (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y+r, brickY, ySpeed)) || //top
    (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y-r, brickY + brickHeight, ySpeed)) //bottom
  )).map(({brick}) => removeAndReverse(bricks, brick, ball,'ySpeed')))
.subscribe(_ => {})

mainObservable
  .map(({x,y,r, xSpeed, ySpeed}) => bricks.map((brick:Elem) => ({ brick, brickX:parseInt(brick.attr('x')), brickY:parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height'))}))
  .filter(({brick, brickX, brickY, brickWidth, brickHeight}) => (
    (isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x+r, brickX, xSpeed)) ||  //left
    (isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x-r, brickX + brickWidth, xSpeed)) //right
  )).map(({brick}) => removeAndReverse(bricks, brick, ball,'xSpeed')))
.subscribe(_ => {})

}

function removeAndReverse(bricks:Elem[], brick: Elem, ball: Elem, attributeLabel:string) {
  brick.elem.remove();
  // console.log('before' ,bricks.length)
  let x = bricks.indexOf(brick)
  // console.log(x)

  bricks.splice(x,1);
  // console.log('after' ,bricks.length)

  ball.attr(attributeLabel, -1*parseInt(ball.attr(attributeLabel)))
}

function endGame2(score1: number, score2: number){
  const score = document.getElementById("score")!
  score2 == 5 ?
    score.innerHTML = "Congratulations player2" :
    score.innerHTML = "Congratulations player1"
}

function updateAndReset2(lives: number, ball: Elem) {
  console.log('resetted the game!')
  const livesLabel = document.getElementById("lives")!;
  livesLabel.innerHTML = `lives: ${lives}`;
  ball.attr('cx', getRandomBetween(400,500)).attr('cy', getRandomBetween(250,350))
}

function controlPaddleObservable2(paddle: Elem): void {
  const
    svg = document.getElementById("breakout")!,
    svgLeft = Math.floor(svg.getBoundingClientRect().left),
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
