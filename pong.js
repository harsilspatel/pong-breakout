"use strict";
function pong() {
    var score1 = 0, score2 = 0, ySpeed = 5, xSpeed = 5, gameRounds = 5;
    const svg = document.getElementById("canvas");
    let leftPaddle = new Elem(svg, 'rect')
        .attr('x', 30)
        .attr('y', 80)
        .attr('width', 10)
        .attr('height', 120)
        .attr('fill', '#FFFFFF');
    let rightPaddle = new Elem(svg, 'rect')
        .attr('x', 900 - 30 - 10)
        .attr('y', 70)
        .attr('width', 10)
        .attr('height', 120)
        .attr('fill', '#FFFFFF');
    controlPaddleObservable(rightPaddle);
    let ball = new Elem(svg, 'circle')
        .attr('cx', 650)
        .attr('cy', 300)
        .attr('r', 7)
        .attr('fill', '#FFFFFF');
    const ballInterval = Observable.interval(10)
        .map(() => ({
        x: Number(ball.attr('cx')),
        y: Number(ball.attr('cy')),
        r: Number(ball.attr('r'))
    }));
    const ballOberservable = ballInterval
        .takeUntil(ballInterval.filter(({ x, y, r }) => score1 == gameRounds || score2 == gameRounds))
        .map(() => ({
        x: Number(ball.attr('cx')),
        y: Number(ball.attr('cy')),
        r: Number(ball.attr('r'))
    }));
    ballOberservable
        .map(({ x, y, r }) => (x + r >= Number(rightPaddle.attr('x')) &&
        (Number(rightPaddle.attr('y')) <= y &&
            y <= (Number(rightPaddle.attr('y')) + Number(rightPaddle.attr('height'))))) ||
        (x - r <= Number(leftPaddle.attr('x')) + Number(leftPaddle.attr('width')) &&
            (Number(leftPaddle.attr('y')) <= y &&
                y <= (Number(leftPaddle.attr('y')) + Number(leftPaddle.attr('height'))))) ?
        (xSpeed = -1 * xSpeed) : (xSpeed))
        .subscribe(() => (ball.attr('cx', xSpeed + Number(ball.attr('cx')))));
    ballOberservable
        .filter(({ y }) => 0 <= y - Number(leftPaddle.attr('height')) / 2 && y + Number(leftPaddle.attr('height')) / 2 <= svg.getBoundingClientRect().bottom - svg.getBoundingClientRect().top)
        .map(({ y }) => leftPaddle.attr('y', y - Number(leftPaddle.attr('height')) / 2))
        .subscribe(_ => ({}));
    ballOberservable.map(({ y, r }) => ({ y, r,
        bottomBound: svg.getBoundingClientRect().bottom - svg.getBoundingClientRect().top }))
        .map(({ y, r, bottomBound }) => (bottomBound <= y + r) || (y - r <= 0) ? (ySpeed = -1 * ySpeed) : (ySpeed))
        .subscribe(({}) => (ball.attr('cy', ySpeed + Number(ball.attr('cy')))));
    ballOberservable
        .map(({ x, y, r }) => (x - r + xSpeed <= 0) ? updateAndReset(score1, ++score2, ball) : true)
        .map(() => ({
        x: Number(ball.attr('cx')),
        y: Number(ball.attr('cy')),
        r: Number(ball.attr('r'))
    }))
        .map(({ x, y, r }) => (x + r - xSpeed) >= svg.getBoundingClientRect().right - svg.getBoundingClientRect().left ? updateAndReset(++score1, score2, ball) : true)
        .map(_ => score1 == gameRounds || score2 == gameRounds ? endGame(score1, score2) : true)
        .subscribe(_ => { });
}
function endGame(score1, score2) {
    const score = document.getElementById("score");
    score2 == 5 ?
        score.innerHTML = "Congratulations player2" :
        score.innerHTML = "Congratulations player1";
}
function updateAndReset(score1, score2, ball) {
    console.log('resetted the game!');
    const score = document.getElementById("score");
    score.innerHTML = `${score1},${score2}`;
    ball.attr('cx', 450).attr('cy', 300);
}
function controlPaddleObservable(paddle) {
    const svg = document.getElementById("canvas"), svgTop = svg.getBoundingClientRect().top, o = Observable
        .fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX, y: clientY - svgTop - parseInt(paddle.attr('height')) / 2 }))
        .filter(({ x, y }) => 0 <= y)
        .filter(({ x, y }) => (y + parseInt(paddle.attr('height')) <= parseInt(svg.getAttribute('height'))))
        .subscribe(({ x, y }) => paddle.attr('y', y));
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
        mousePosObservable2();
    };
function mousePosObservable2() {
    const pos = document.getElementById("pos"), o = Observable
        .fromEvent(document, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
    o.map(({ x, y }) => `${x},${y}`)
        .subscribe(s => pos.innerHTML = s);
    o.filter(({ x }) => x > 400)
        .subscribe(_ => pos.classList.add('highlight'));
    o.filter(({ x }) => x <= 400)
        .subscribe(_ => pos.classList.remove('highlight'));
}
//# sourceMappingURL=pong.js.map