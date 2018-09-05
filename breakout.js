"use strict";
function breakout() {
    var ySpeed = 2, xSpeed = 2, lives = 1, fps = 5, bricks = [];
    const bricksObservable = Observable.interval(1);
    bricksObservable
        .takeUntil(bricksObservable.filter(i => i == 11))
        .forEach(i => (bricks.push(new Elem(svg, 'rect')
        .attr('x', ((i - 1) * 90))
        .attr('y', 20)
        .attr('width', 90)
        .attr('height', 30)
        .attr('fill', ('#' + getRandomBetween2(0 + 30, 255 - 30).toString(16) + getRandomBetween2(0 + 30, 255 - 30).toString(16) + getRandomBetween2(0 + 30, 255 - 30).toString(16))))))
        .forEach(i => (bricks.push(new Elem(svg, 'rect')
        .attr('x', ((i - 1) * 90))
        .attr('y', 50)
        .attr('width', 90)
        .attr('height', 30)
        .attr('fill', ('#' + getRandomBetween2(0 + 30, 255 - 30).toString(16) + getRandomBetween2(0 + 30, 255 - 30).toString(16) + getRandomBetween2(0 + 30, 255 - 30).toString(16))))))
        .forEach(i => (bricks.push(new Elem(svg, 'rect')
        .attr('x', ((i - 1) * 90))
        .attr('y', 80)
        .attr('width', 90)
        .attr('height', 30)
        .attr('fill', ('#' + getRandomBetween2(0 + 30, 255 - 30).toString(16) + getRandomBetween2(0 + 30, 255 - 30).toString(16) + getRandomBetween2(0 + 30, 255 - 30).toString(16))))))
        .subscribe(_ => { });
    const svg = document.getElementById("breakout");
    let paddle = new Elem(svg, 'rect')
        .attr('x', 30)
        .attr('y', 580)
        .attr('width', 120)
        .attr('height', 3)
        .attr('fill', '#FFFFFF');
    controlPaddleObservable2(paddle);
    let ball = new Elem(svg, 'circle')
        .attr('cx', getRandomBetween2(400, 500))
        .attr('cy', getRandomBetween2(250, 350))
        .attr('r', 7)
        .attr('fill', '#FFFFFF')
        .attr('xSpeed', 1)
        .attr('ySpeed', 1);
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
        Number(paddle.attr('y')) - parseInt(ball.attr('ySpeed')) + 2 <= y + r && y + r < Number(paddle.attr('y')) + 2 ? ball.attr('ySpeed', -1 * parseInt(ball.attr('ySpeed'))) : (parseInt(ball.attr('ySpeed')))));
    ballOberservable
        .map(({ x, r }) => ({ x, r, rightBound: svg.getBoundingClientRect().right - svg.getBoundingClientRect().left }))
        .map(({ x, r, rightBound }) => (rightBound <= x + r) || (x - r <= 0) ? ball.attr('xSpeed', -1 * parseInt(ball.attr('xSpeed'))) : (parseInt(ball.attr('xSpeed'))))
        .subscribe(({}) => (ball.attr('cx', parseInt(ball.attr('xSpeed')) + Number(ball.attr('cx')))));
    ballOberservable
        .map(({ y, r }) => (y - r <= 0) ? (ball.attr('ySpeed', -1 * parseInt(ball.attr('ySpeed')))) : (parseInt(ball.attr('ySpeed'))))
        .subscribe(({}) => (ball.attr('cy', parseInt(ball.attr('ySpeed')) + Number(ball.attr('cy')))));
    ballOberservable
        .map(({ x, y, r }) => (y + r - parseInt(ball.attr('ySpeed'))) >= svg.getBoundingClientRect().bottom - svg.getBoundingClientRect().top ? updateAndReset2(--lives, ball) : true)
        .subscribe(_ => { });
    ballOberservable
        .map(({ x, y, r }) => bricks.forEach(brick => (parseInt(brick.attr('y')) + parseInt(brick.attr('height')) == y - r + parseInt(ball.attr('ySpeed')) && parseInt(brick.attr('x')) <= x && x <= parseInt(brick.attr('x')) + parseInt(brick.attr('width')) ? removeAndReverse(bricks, brick, ball) : true)))
        .subscribe(_ => { });
}
function removeAndReverse(bricks, brick, ball) {
    brick.elem.remove();
    console.log('before', bricks.length);
    let x = bricks.indexOf(brick);
    console.log(x);
    bricks.splice(x, 1);
    console.log('after', bricks.length);
    ball.attr('ySpeed', -1 * parseInt(ball.attr('ySpeed')));
}
function endGame2(score1, score2) {
    const score = document.getElementById("score");
    score2 == 5 ?
        score.innerHTML = "Congratulations player2" :
        score.innerHTML = "Congratulations player1";
}
function getRandomBetween2(x, y) {
    return Math.floor(Math.random() * (Math.abs(x - y) + 1)) + x;
}
function updateAndReset2(lives, ball) {
    console.log('resetted the game!');
    const livesLabel = document.getElementById("lives");
    livesLabel.innerHTML = `lives: ${lives}`;
    ball.attr('cx', getRandomBetween2(400, 500)).attr('cy', getRandomBetween2(250, 350));
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
//# sourceMappingURL=breakout.js.map