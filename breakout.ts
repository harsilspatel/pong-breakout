// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing

function breakout() {

  var speed = 1,
    lives = 3,
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
    
    
    


  const paddleArea = new Elem(svg, 'rect')
    .attr('width', svg.getBoundingClientRect().width)
    .attr('height', 100)
    .attr('x', 0)
    .attr('y', svg.getBoundingClientRect().height - 100)
    .attr('fill', '#444444')

  let paddle = new Elem(svg, 'rect')
    .attr('x', 30)
    .attr('y', 580)
    .attr('width', 120)
    .attr('height', 3)
    .attr('fill', '#FFFFFF');

  Observable
    .fromEvent<MouseEvent>(svg, "mousemove")
    .map(({clientX, clientY})=>({x: Math.floor(clientX - svg.getBoundingClientRect().left - parseInt(paddle.attr('width'))/2), y: Math.floor(clientY - svg.getBoundingClientRect().top - parseInt(paddle.attr('height'))/2)}))
    .filter(({x}) => 0 <= x && x + parseInt(paddle.attr('width')) <= svg.getBoundingClientRect().width) //for left and right bounds
    .filter(({y}) => isBetween(y, svg.getBoundingClientRect().height - 100, 100, 0))
    .subscribe(({x,y}) => paddle.attr('x', x).attr('y', y));

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
    .takeUntil(mainInterval.filter(_ => bricks.length == 0 || lives == 0 ))
    .map(() => ({
      x: parseInt(ball.attr('cx')),
      y: parseInt(ball.attr('cy')),
      r: parseInt(ball.attr('r')),
      xSpeed: parseInt(ball.attr('xSpeed')),
      ySpeed: parseInt(ball.attr('ySpeed')),
    }));


  // making the ball collide with the paddle
  mainObservable
  .filter(({x,y,r,xSpeed,ySpeed}) => (isBetween(x, parseInt(paddle.attr('x')), parseInt(paddle.attr('width')), xSpeed) && isCollision(y+r, parseInt(paddle.attr('y')), 2*ySpeed))) //Please note that error here is 2*ySpeed, so that when paddle is being moving towards the ball it can hit it. However, as it is twice the normal error, it may look like the ball is not touching the paddle when striking.  
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
  .subscribe(_ => updateAndReset(--lives, ball))

mainObservable
  .map(({x,y,r, xSpeed, ySpeed}) => bricks.map((brick:Elem) => ({ brick, brickX:parseInt(brick.attr('x')), brickY:parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height'))}))
  .filter(({brick, brickX, brickY, brickWidth, brickHeight}) => (
    (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y+r, brickY, ySpeed)) || //top
    (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y-r, brickY + brickHeight, ySpeed)) //bottom
  )).map(({brick}) => removeAndReverse(bricks, brick, ball,'ySpeed')))
  .filter(_ => bricks.length == 0)
  .subscribe(_ => document.getElementById("lives")!.innerHTML = "Awesome, you won! 🤩")

mainObservable
  .map(({x,y,r, xSpeed, ySpeed}) => bricks.map((brick:Elem) => ({ brick, brickX:parseInt(brick.attr('x')), brickY:parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height'))}))
  .filter(({brick, brickX, brickY, brickWidth, brickHeight}) => (
    (isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x+r, brickX, xSpeed)) ||  //left
    (isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x-r, brickX + brickWidth, xSpeed)) //right
  )).map(({brick}) => removeAndReverse(bricks, brick, ball,'xSpeed')))
  .filter(_ => bricks.length == 0)
  .subscribe(_ => document.getElementById("lives")!.innerHTML = "Awesome, you won! 🤩")

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

function updateAndReset(lives: number, ball: Elem) {
  console.log('resetted the game!')
  const livesLabel = document.getElementById("lives")!;
  livesLabel.innerHTML = `Lives: ${"❤️".repeat(lives)}`;
  ball.attr('cx', getRandomBetween(400,500)).attr('cy', getRandomBetween(250,350)).attr('xSpeed', -1*parseInt(ball.attr('xSpeed')))
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    breakout();
  }

