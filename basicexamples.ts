/**
 * an example of traditional event driven programming style - this is what we are 
 * replacing with observable.
 * The following adds a listener for the mouse event
 * handler, sets p and adds or removes a highlight depending on x position
 */
function mousePosEvents() {
  const pos = document.getElementById("pos")!;

  document.addEventListener("mousemove", e => {
    const p = e.clientX + ', ' + e.clientY;
    pos.innerHTML = p;
    if (e.clientX > 400) {
      pos.classList.add('highlight');
    } else {
      pos.classList.remove('highlight');
    }
  });
}

/**
 * constructs an Observable event stream with three branches:
 *   Observable<x,y>
 *    |- set <p>
 *    |- add highlight
 *    |- remove highlight
 */
function mousePosObservable() {
  const 
    pos = document.getElementById("pos")!,
    o = Observable
          .fromEvent<MouseEvent>(document, "mousemove")
          .map(({clientX, clientY})=>({x: clientX, y: clientY}));

  o.map(({x,y}) => `${x},${y}`)
    .subscribe(s => pos.innerHTML = s);

  o.filter(({x}) => x > 400)
    .subscribe(_ => pos.classList.add('highlight'));

  o.filter(({x}) => x <= 400)
    .subscribe(_ => pos.classList.remove('highlight'));
}

/**
 * animates an SVG rectangle, passing a continuation to the built-in HTML5 setInterval function.
 * a rectangle smoothly moves to the right for 1 second.
 */
function animatedRectTimer() {
  const svg = document.getElementById("animatedRect")!;
  let rect = new Elem(svg, 'rect')
    .attr('x', 100).attr('y', 70)
    .attr('width', 120).attr('height', 80)
    .attr('fill', '#95B3D7');
  const animate = setInterval(()=>rect.attr('x', 1+Number(rect.attr('x'))), 10);
  const timer = setInterval(()=>{
    clearInterval(animate);
    clearInterval(timer);
  }, 1000);
}

/**
 * Demonstrates the interval method on Observable.
 * The observable stream fires every 10 milliseconds.
 * It terminates after 1 second (1000 milliseconds)
 */
function animatedRect() {
  const svg = document.getElementById("animatedRect")!;
  let rect = new Elem(svg, 'rect')
    .attr('x', 100).attr('y', 70)
    .attr('width', 120).attr('height', 80)
    .attr('fill', '#95B3D7');

  Observable.interval(10)
    .takeUntil(Observable.interval(1000))
    .subscribe(()=>rect.attr('x', 1+Number(rect.attr('x'))));
}

// an example of traditional event driven programming style - this is what we are 
// replacing with observable
// creates an SVG rectangle that can be dragged with the mouse
function dragRectEvents() {
  const svg = document.getElementById("dragRect")!,
    {left, top} = svg.getBoundingClientRect();
    
  const rect = new Elem(svg, 'rect')
    .attr('x', 100).attr('y', 70)
    .attr('width', 120).attr('height', 80)
    .attr('fill', '#95B3D7');

  rect.elem.addEventListener('mousedown', <EventListener>((e:MouseEvent)=>{
    const 
      xOffset = Number(rect.attr('x')) - e.clientX,
      yOffset = Number(rect.attr('y')) - e.clientY,
      moveListener = (e:MouseEvent)=>{
        rect
          .attr('x',e.clientX + xOffset)
          .attr('y',e.clientY + yOffset);
      },
      done = ()=>{
        svg.removeEventListener('mousemove', moveListener);
      };
    svg.addEventListener('mousemove', moveListener);
    svg.addEventListener('mouseup', done);
    svg.addEventListener('mouseout', done);
  }))
}

/**
 * Observable version of dragRectEvents:
 * Constructs an observable stream for the rectangle that
 * on mousedown creates a new stream to handle drags until mouseup
 *   O<MouseDown>
 *     | map x/y offsets
 *   O<x,y>
 *     | flatMap
 *     +---------------------+------------...
 *   O<MouseMove>          O<MouseMove>
 *     | takeUntil mouseup   |
 *   O<MouseMove>          O<MouseMove>
 *     | map x/y + offsets   |
 *     +---------------------+------------...
 *   O<x,y>
 *     | move the rect
 *    --- 
 */

function dragRectObservable() {
  const 
    svg = document.getElementById("dragRect")!
    const
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup'),
    rect = new Elem(svg, 'rect')
            .attr('x', 100)    .attr('y', 70)
            .attr('width', 120).attr('height', 80)
            .attr('fill', '#95B3D7');
    // rect.observe<MouseEvent>('mousedown') // Observable<MouseEvent>
    // .map(({clientX, clientY}) => ({ xOffset: Number(rect.attr('x')) - clientX,
    //                                 yOffset: Number(rect.attr('y')) - clientY })) // Observable<{xOffset, yOffset}>
    // .flatMap(({xOffset, yOffset}) =>
    //   mousemove
    //     .takeUntil(mouseup)
    //     .map(({clientX, clientY}) => ({ x: clientX + xOffset, y: clientY + yOffset })))
    // .subscribe(({x, y}) =>
    //   rect.attr('x', x)
    //       .attr('y', y));
    
    // dragMyRect(svg);
    let x = dragRect(svg,rect);
    console.log(x);
    x.subscribe(() => {});
}

function dragRect(svg: HTMLElement, rect: Elem): Observable<Elem> {
  const
    mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup');
  return rect.observe<MouseEvent>('mousedown')
    .map(event => {event.stopPropagation(); return event;})
    .map(({clientX, clientY}) => ({ xOffset: Number(rect.attr('x')) - clientX,
                                    yOffset: Number(rect.attr('y')) - clientY }))
    .flatMap(({xOffset, yOffset}) =>
      mousemove
        .takeUntil(mouseup)
        .map(({clientX, clientY}) => ({ x: clientX + xOffset, y: clientY + yOffset })))
    .map(({x, y}) => 
      rect.attr('x', x)
      .attr('y', y));
}

/**
 * An example of traditional event driven programming style - this is what we are 
 * replacing with observable.
 * It allows the user to draw SVG rectangles by dragging with the mouse
 */
function drawRectsEvents() {
  const svg = document.getElementById("drawRects")!;

  svg.addEventListener('mousedown', e => {
    const 
      svgRect = svg.getBoundingClientRect(),
      x0 = e.clientX - svgRect.left,
      y0 = e.clientY - svgRect.top,
      rect = new Elem(svg, 'rect')
        .attr('x', String(x0))
        .attr('y', String(y0))
        .attr('width', '5')
        .attr('height', '5')
        .attr('fill', '#95B3D7');

    function moveListener(e: any) {
      const x1 = e.clientX - svgRect.left,
        y1 = e.clientY - svgRect.top,
        left = Math.min(x0, x1),
        top = Math.min(y0, y1),
        width = Math.abs(x0 - x1),
        height = Math.abs(y0 - y1);
        rect.attr('x', String(left))
            .attr('y', String(top))
            .attr('width', String(width))
            .attr('height', String(height));
    }

    function cleanup() {
      svg.removeEventListener('mousemove', moveListener);
      svg.removeEventListener('mouseup', cleanup);
    }

    svg.addEventListener('mouseup', cleanup);
    svg.addEventListener('mousemove', moveListener);
  });
}

/**
 * Observable version of the above
 */

function drawRectsObservable() {
  // implement this function!
  const
  svg = document.getElementById("drawRects")!
  drawRect(svg).subscribe(() => {})
  // const
  // mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
  // mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup');
  // Observable.fromEvent<MouseEvent>(svg, 'mousedown')
  // .map(({clientX, clientY}) => ({ clientX: clientX,
  //   clientY: clientY,
  //   x0: clientX - svg.getBoundingClientRect().left,
  //   y0: clientY - svg.getBoundingClientRect().top,
  //   rect: new Elem(svg, 'rect')
  //   .attr('x', String(clientX - svg.getBoundingClientRect().left))
  //   .attr('y', String(clientY - svg.getBoundingClientRect().top))
  //   .attr('width', '5')
  //   .attr('height', '5')
  //   .attr('fill', '#95B3D7'),
  //   svgRect: svg.getBoundingClientRect()}))
  // .map(({clientX, clientY, x0, y0, svgRect, rect}) => ({
  //     rect: rect,
  //     svgRect: svgRect,
  //     x0: x0,
  //     y0: y0,
  //     x1: clientX - svgRect.left,
  //     y1: clientY - svgRect.top
  //   }))
  // .flatMap(({svgRect, x1, y1, rect}) =>
  // mousemove
  // .takeUntil(mouseup)
  // .map(({clientX, clientY}) => ({ rect: rect,
  //           left: Math.min(x1, clientX - svgRect.left),
  //           top: Math.min(y1, clientY - svgRect.top),
  //           width: Math.abs(clientX - svgRect.left - x1),
  //           height: Math.abs(clientY - svgRect.top - y1) })))
  // .subscribe(({rect, left, top, width, height}) =>
  // rect.attr('x', left)
  // .attr('y', top)
  // .attr('width', String(width))
  // .attr('height', String(height)));

  // drawMyRect(svg);
  

  // .map(({clientX, clientY}) => ({ clientX: clientX,
  //                                 clientY: clientY,
  //                                 svgRect: svg.getBoundingClientRect()}))
  // .map(({clientX, clientY, svgRect}) => ({   
  //                                 // clientX: clientX,
  //                                 // clientY: clientY,
  //                                 svgRect: svgRect,
  //                                 x0: clientX - svgRect.left,
  //                                 y0: clientY - svgRect.top,
  //                                 rect: new Elem(svg, 'rect')
  //                                 .attr('x', String(clientX - svgRect.left))
  //                                 .attr('y', String(clientY - svgRect.top))
  //                                 .attr('width', '5')
  //                                 .attr('height', '5')
  //                                 .attr('fill', '#95B3D7') }))
  // .flatMap(({svgRect, x0, y0, rect}) =>
  //   mousemove
  //       .takeUntil(mouseup)
  //       .map(({clientX, clientY}) => ({ rect: rect,
  //                                       left: Math.min(x0, clientX - svgRect.left),
  //                                       top: Math.min(y0, clientY - svgRect.top),
  //                                       width: Math.abs(x0 - clientX - svgRect.left),
  //                                       height: Math.abs(y0 - clientY - svgRect.top) })))
  // .subscribe(({rect, left, top, width, height}) =>
  //     rect.attr('x', String(left))
  //         .attr('y', String(top))
  //         .attr('width', String(width))
  //         .attr('height', String(height)));      
}

function drawRect(svg: HTMLElement): Observable<Elem> {
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

/**
 * dragging on an empty spot on the canvas should draw a new rectangle.
 * dragging on an existing rectangle should drag its position.
 */
function drawAndDragRectsObservable() {
  // implement this function!
  // A problem to solve is how to drag a rectangle without starting to draw another rectangle?
  // Two possible solutions: 
  //  (1) introduce a "drag state" by mutating a top level variable at mousedown on the rectangle 
  //  (2) add a parallel subscription to mousedown that calls the "stopPropagation" method on the MouseEvent
  // Which one is better and why?
  // See if you can refactor the code from dragRectObservable and drawRectsObservable into reusable functions
  // that can be composed together to make drawAndDragRectsObservable almost trivial.
  const svg = document.getElementById("drawAndDragRects")!;
  drawRect(svg)
    // .map(elem => dragRect(svg, elem).subscribe(() => {}))
    // .subscribe(() => {})
    .flatMap(elem => dragRect(svg, elem))
    .subscribe(() => {})


}

if (typeof window != 'undefined')
  window.onload = ()=>{
    // old fashioned continuation spaghetti implementations:
    // mousePosEvents();
    // animatedRectTimer();
    // dragRectEvents();
    // drawRectsEvents();

    // when your observable is working replace the above four functions with the following:
    mousePosObservable();
    animatedRect()
    dragRectObservable();
    drawRectsObservable();

    // you'll need to implement the following function yourself:
    drawAndDragRectsObservable();
  }