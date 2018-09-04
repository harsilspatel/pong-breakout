"use strict";
function breakout() {
    var bricks = 0, ySpeed = 2, xSpeed = 2, lives = 3, fps = 10;
    const svg = document.getElementById("breakout");
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
        .subscribe(({ x, y, r }) => (Number(paddle.attr('x')) <= x && x <= Number(paddle.attr('x')) + Number(paddle.attr('width')) &&
        Number(paddle.attr('y')) - ySpeed <= y && y < Number(paddle.attr('y')) ? (ySpeed = -1 * ySpeed) : (ySpeed)));
    ballOberservable
        .map(({ x, r }) => ({ x, r, rightBound: svg.getBoundingClientRect().right - svg.getBoundingClientRect().left }))
        .map(({ x, r, rightBound }) => (rightBound <= x + r) || (x - r <= 0) ? (xSpeed = -1 * xSpeed) : (xSpeed))
        .subscribe(({}) => (ball.attr('cx', xSpeed + Number(ball.attr('cx')))));
    ballOberservable
        .map(({ y, r }) => (y - r <= 0) ? (ySpeed = -1 * ySpeed) : (ySpeed))
        .subscribe(({}) => (ball.attr('cy', ySpeed + Number(ball.attr('cy')))));
    ballOberservable
        .map(({ x, y, r }) => (y + r - ySpeed) >= svg.getBoundingClientRect().bottom - svg.getBoundingClientRect().top ? updateAndReset2(--lives, ball) : true)
        .subscribe(_ => { });
    drawRectObservable(svg)
        .map(rect => (Number(rect.attr('y')) <= Number(ball.attr('cy')) && Number(ball.attr('cy')) <= Number(rect.attr('y')) + Number(rect.attr('height')) &&
        Number(rect.attr('x')) <= Number(ball.attr('cx')) && Number(ball.attr('cx')) <= Number(rect.attr('x')) + Number(rect.attr('width')) ? svg.removeChild(rect.elem) : true))
        .map(_ => console.log('chodi'))
        .subscribe(_ => { });
}
function endGame2(score1, score2) {
    const score = document.getElementById("score");
    score2 == 5 ?
        score.innerHTML = "Congratulations player2" :
        score.innerHTML = "Congratulations player1";
}
function updateAndReset2(lives, ball) {
    console.log('resetted the game!');
    const livesLabel = document.getElementById("lives");
    livesLabel.innerHTML = `lives: ${lives}`;
    ball.attr('cx', 450).attr('cy', 300);
}
function controlPaddleObservable2(paddle) {
    const svg = document.getElementById("breakout"), svgLeft = svg.getBoundingClientRect().left, o = Observable
        .fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX - svgLeft - parseInt(paddle.attr('width')) / 2, y: clientY }))
        .filter(({ x, y }) => 0 <= x)
        .filter(({ x, y }) => (x + parseInt(paddle.attr('width')) <= parseInt(svg.getAttribute('width'))))
        .subscribe(({ x, y }) => paddle.attr('x', x));
}
if (typeof window != 'undefined')
    window.onload = () => {
        breakout();
    };
function drawRectObservable(svg) {
    const mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup');
    return Observable.fromEvent(svg, 'mousedown')
        .map(({ clientX, clientY }) => ({ clientX: clientX,
        clientY: clientY,
        x0: clientX - svg.getBoundingClientRect().left,
        y0: clientY - svg.getBoundingClientRect().top,
        rect: new Elem(svg, 'rect')
            .attr('x', String(clientX - svg.getBoundingClientRect().left))
            .attr('y', String(clientY - svg.getBoundingClientRect().top))
            .attr('width', '5')
            .attr('height', '5')
            .attr('fill', '#95B3D7'),
        svgRect: svg.getBoundingClientRect() }))
        .map(({ clientX, clientY, x0, y0, svgRect, rect }) => ({
        rect: rect,
        svgRect: svgRect,
        x0: x0,
        y0: y0,
        x1: clientX - svgRect.left,
        y1: clientY - svgRect.top
    }))
        .flatMap(({ svgRect, x1, y1, rect }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientX, clientY }) => ({ rect: rect,
        left: Math.min(x1, clientX - svgRect.left),
        top: Math.min(y1, clientY - svgRect.top),
        width: Math.abs(clientX - svgRect.left - x1),
        height: Math.abs(clientY - svgRect.top - y1) })))
        .map(({ rect, left, top, width, height }) => rect.attr('x', left)
        .attr('y', top)
        .attr('width', String(width))
        .attr('height', String(height)));
}
//# sourceMappingURL=breakout.js.map