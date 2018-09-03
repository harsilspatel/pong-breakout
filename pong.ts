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

  const svg = document.getElementById("canvas")!;
  let leftPaddle = new Elem(svg, 'rect')
    .attr('x', 30).attr('y', 70)
    .attr('width', 10).attr('height', 120)
    .attr('fill', '#FFFFFF');

  Observable.interval(10)
    .takeUntil(Observable.interval(1000))
    .subscribe(() => leftPaddle.attr('y', 1+Number(leftPaddle.attr('y'))));

  let rightPaddle = new Elem(svg, 'rect')
    .attr('x', 900-30-10) //canvas - distanceFromCanvas - width
    .attr('y', 70)
    .attr('width', 10)
    .attr('height', 120)
    .attr('fill', '#FFFFFF');

  controlPaddleObservable(rightPaddle);

  let ball = new Elem(svg, 'circle')
  .attr('cx', 500)
  .attr('cy', 300)
  .attr('r', 7)
  .attr('fill', '#FFFFFF');

  const ballOberservable = Observable.interval(1)
    .takeUntil(Observable.interval(2000))
    .map(() => ({
      x: Number(ball.attr('cx')),
      y: Number(ball.attr('cy')),
      r: Number(ball.attr('r'))
    }));

  // ballOberservable.filter(({x}) => Number(ball.attr('cx')) + 2*Number(ball.attr('r')) <= Number(svg.getBoundingClientRect().right))
  //   .subscribe(({xSpeed}) => ball.attr('cx', xSpeed+Number(ball.attr('cx'))));

  ballOberservable.filter(({x,r}) => ((x+r) < svg.getBoundingClientRect().right))
    .subscribe(({x}) => (ball.attr('cx', 2+x)))

  let score1 = 0,
    score2 = 0;


}

function controlPaddleObservable(paddle: Elem): void {
  const
    svg = document.getElementById("canvas")!,
    svgTop = svg.getBoundingClientRect().top,
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
  }

 

 