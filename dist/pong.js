"use strict";
function pong() {
    const pongStats = {
        score1: 0,
        score2: 0,
        maxScore: 11
    }, svg = document.getElementById("canvas");
    let divider = new Elem(svg, 'line')
        .attr('x1', svg.getBoundingClientRect().width / 2)
        .attr('y1', 0)
        .attr('x2', svg.getBoundingClientRect().width / 2)
        .attr('y2', svg.getBoundingClientRect().height)
        .attr('stroke', '#444444')
        .attr('stroke-width', 4)
        .attr('stroke-dasharray', 20);
    let leftPaddle = new Elem(svg, 'rect')
        .attr('x', 10)
        .attr('y', 80)
        .attr('width', 3)
        .attr('height', 120)
        .attr('fill', '#FFFFFF');
    let paddleArea = new Elem(svg, 'rect')
        .attr('width', 100)
        .attr('height', svg.getBoundingClientRect().height)
        .attr('x', svg.getBoundingClientRect().width - 100)
        .attr('y', 0)
        .attr('fill', '#444444');
    let rightPaddle = new Elem(svg, 'rect')
        .attr('x', 900 - 10 - 3)
        .attr('y', 70)
        .attr('width', 3)
        .attr('height', 120)
        .attr('fill', '#FFFFFF');
    let ball = new Elem(svg, 'circle')
        .attr('cx', getRandomBetween(400, 500))
        .attr('cy', getRandomBetween(250, 350))
        .attr('r', 7)
        .attr('fill', '#FFFFFF')
        .attr('xSpeed', 3)
        .attr('ySpeed', 3);
    Observable
        .fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({ x: Math.floor(clientX - svg.getBoundingClientRect().left - parseInt(rightPaddle.attr('width')) / 2), y: Math.floor(clientY - svg.getBoundingClientRect().top - parseInt(rightPaddle.attr('height')) / 2) }))
        .filter(({ x, y }) => 0 <= y && (y + parseInt(rightPaddle.attr('height')) <= (svg.getBoundingClientRect().height)))
        .filter(({ x, y }) => isBetween(x, svg.getBoundingClientRect().width - 100, 100, 0))
        .subscribe(({ x, y }) => rightPaddle.attr('x', x).attr('y', y));
    const mainInterval = Observable.interval(10)
        .map(() => ({
        pongStats,
    }));
    const mainObservable = mainInterval
        .takeUntil(mainInterval.filter(_ => pongStats.score1 == pongStats.maxScore ||
        pongStats.score2 == pongStats.maxScore))
        .map(_ => ({
        x: parseInt(ball.attr('cx')),
        y: parseInt(ball.attr('cy')),
        r: parseInt(ball.attr('r')),
        xSpeed: parseInt(ball.attr('xSpeed')),
        ySpeed: parseInt(ball.attr('ySpeed')),
        pongStats
    }));
    mainObservable
        .map(({ x, y, r, xSpeed, ySpeed }) => ({ x, y, r, xSpeed, ySpeed,
        paddleHeight: parseInt(rightPaddle.attr('height')),
        paddleWidth: parseInt(rightPaddle.attr('width')) }))
        .filter(({ x, y, r, xSpeed, ySpeed, paddleHeight, paddleWidth }) => (isCollision(x + r, parseInt(rightPaddle.attr('x')), 2 * xSpeed) &&
        (isBetween(y, parseInt(rightPaddle.attr('y')), paddleHeight, ySpeed))) ||
        (isCollision(x - r, parseInt(leftPaddle.attr('x')) + paddleWidth, xSpeed) &&
            (isBetween(y, parseInt(leftPaddle.attr('y')), paddleHeight, ySpeed))))
        .subscribe(({ xSpeed }) => ball.attr('xSpeed', -1 * xSpeed));
    mainObservable.subscribe(({ x, y, xSpeed, ySpeed }) => ball.attr('cx', x + xSpeed).attr('cy', y + ySpeed));
    mainObservable
        .filter(({ y, r, ySpeed }) => isCollision(y - r, 0, ySpeed) ||
        isCollision(y + r, Math.floor(svg.getBoundingClientRect().height), ySpeed))
        .subscribe(({ ySpeed }) => ball.attr('ySpeed', -1 * ySpeed));
    mainObservable
        .map(({ y }) => ({ y, paddleHeight: parseInt(rightPaddle.attr('height')) }))
        .filter(({ y, paddleHeight }) => isBetween(y, Math.floor(0 + paddleHeight / 2), Math.floor(svg.getBoundingClientRect().height - paddleHeight), 0))
        .subscribe(({ y, paddleHeight }) => leftPaddle.attr('y', y - Math.floor(paddleHeight / 2)));
    mainObservable
        .filter(({ x, xSpeed, r }) => isCollision(x - r, 0, xSpeed) ||
        isCollision(x + r, Math.floor(svg.getBoundingClientRect().width), xSpeed))
        .forEach(({ x, pongStats }) => (x < svg.getBoundingClientRect().width / 2 ? scored(pongStats.score1, ++pongStats.score2, pongStats.maxScore) : scored(++pongStats.score1, pongStats.score2, pongStats.maxScore)))
        .subscribe(({ xSpeed, ySpeed }) => ball.attr('cx', getRandomBetween(400, 500)).attr('cy', getRandomBetween(250, 350)).attr('xSpeed', -1 * xSpeed).attr('ySpeed', -1 * ySpeed));
}
function scored(score1, score2, maxScore) {
    const score = document.getElementById("score");
    score.innerHTML = `${getEmojiNumber(score1)} : ${getEmojiNumber(score2)}`;
    const result = document.getElementById("result");
    if (score2 == maxScore) {
        result.innerHTML = "Congratulations Player 2 🎉";
    }
    else if (score1 == maxScore) {
        result.innerHTML = "Congratulations Player 1 ✨";
    }
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map