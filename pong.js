"use strict";
function pong() {
    var speed = 1, fps = 2, score1 = 0, score2 = 0, gameRounds = 1;
    const svg = document.getElementById("canvas");
    let leftPaddle = new Elem(svg, 'rect')
        .attr('x', 10)
        .attr('y', 80)
        .attr('width', 3)
        .attr('height', 120)
        .attr('fill', '#FFFFFF');
    let rightPaddle = new Elem(svg, 'rect')
        .attr('x', 900 - 10 - 3)
        .attr('y', 70)
        .attr('width', 3)
        .attr('height', 120)
        .attr('fill', '#FFFFFF');
    controlPaddleObservable(rightPaddle);
    let ball = new Elem(svg, 'circle')
        .attr('cx', getRandomBetween(400, 500))
        .attr('cy', getRandomBetween(250, 350))
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
        .takeUntil(ballInterval.filter(({ x, y, r }) => score1 == gameRounds || score2 == gameRounds))
        .map(() => ({
        x: parseInt(ball.attr('cx')),
        y: parseInt(ball.attr('cy')),
        r: parseInt(ball.attr('r'))
    }));
    ballOberservable
        .map(({ x, y, r }) => (isBetween(x + r, parseInt(rightPaddle.attr('x')), 0, parseInt(ball.attr('xSpeed'))) &&
        (isBetween(y, parseInt(rightPaddle.attr('y')), parseInt(rightPaddle.attr('height')), parseInt(ball.attr('ySpeed'))))) ||
        (isBetween(x - r, parseInt(leftPaddle.attr('x')) + parseInt(leftPaddle.attr('width')), 0, parseInt(ball.attr('xSpeed'))) &&
            (isBetween(y, parseInt(leftPaddle.attr('y')), parseInt(leftPaddle.attr('height')), parseInt(ball.attr('ySpeed'))))) ?
        ball.attr('xSpeed', reverseDirection(ball, 'xSpeed')) : (parseInt(ball.attr('xSpeed'))))
        .subscribe(() => (ball.attr('cx', parseInt(ball.attr('xSpeed')) + parseInt(ball.attr('cx')))));
    ballOberservable
        .filter(({ y }) => 0 <= y - parseInt(leftPaddle.attr('height')) / 2 && y + parseInt(leftPaddle.attr('height')) / 2 <= Math.floor(svg.getBoundingClientRect().bottom) - Math.floor(svg.getBoundingClientRect().top))
        .map(({ y }) => leftPaddle.attr('y', y - parseInt(leftPaddle.attr('height')) / 2));
    ballOberservable.map(({ y, r }) => ({ y, r,
        bottomBound: Math.floor(svg.getBoundingClientRect().bottom) - Math.floor(svg.getBoundingClientRect().top) }))
        .map(({ y, r, bottomBound }) => isBetween(y - r, 0, 0, parseInt(ball.attr('ySpeed'))) || isBetween(y + r, bottomBound, 0, parseInt(ball.attr('ySpeed'))) ? ball.attr('ySpeed', reverseDirection(ball, 'ySpeed')) : (parseInt(ball.attr('ySpeed'))))
        .subscribe(({}) => (ball.attr('cy', parseInt(ball.attr('ySpeed')) + parseInt(ball.attr('cy')))));
    ballOberservable
        .map(({ x, y, r }) => isBetween(x - r, 0, 0, parseInt(ball.attr('xSpeed'))) ? updateAndReset(score1, ++score2, ball) : true)
        .map(() => ({
        x: parseInt(ball.attr('cx')),
        y: parseInt(ball.attr('cy')),
        r: parseInt(ball.attr('r'))
    }))
        .map(({ x, y, r }) => isBetween(x + r, Math.floor(svg.getBoundingClientRect().right) - Math.floor(svg.getBoundingClientRect().left), 0, parseInt(ball.attr('xSpeed'))) ? updateAndReset(++score1, score2, ball) : true)
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
    score.innerHTML = `${score1} ${score2}`;
    ball.attr('cx', getRandomBetween(400, 500)).attr('cy', getRandomBetween(250, 350));
}
function controlPaddleObservable(paddle) {
    const svg = document.getElementById("canvas"), svgTop = Math.floor(svg.getBoundingClientRect().top), o = Observable
        .fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX, y: clientY - svgTop - parseInt(paddle.attr('height')) / 2 }))
        .filter(({ x, y }) => 0 <= y)
        .filter(({ x, y }) => (y + parseInt(paddle.attr('height')) <= parseInt(svg.getAttribute('height'))))
        .subscribe(({ x, y }) => paddle.attr('y', y));
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map