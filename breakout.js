"use strict";
function breakout() {
    var speed = 1, lives = 3, fps = 5, bricks = [];
    const svg = document.getElementById("breakout");
    const bricksObservable = Observable.interval(1);
    bricksObservable
        .takeUntil(bricksObservable.filter(i => i == 11))
        .forEach(i => (bricks.push(new Elem(svg, 'rect')
        .attr('x', ((i - 1) * 90))
        .attr('y', 20)
        .attr('width', 90)
        .attr('height', 30)
        .attr('fill', ('#' + getRandomBetween(0 + 30, 255 - 30).toString(16) + getRandomBetween(0 + 30, 255 - 30).toString(16) + getRandomBetween(0 + 30, 255 - 30).toString(16))))))
        .forEach(i => (bricks.push(new Elem(svg, 'rect')
        .attr('x', ((i - 1) * 90))
        .attr('y', 50)
        .attr('width', 90)
        .attr('height', 30)
        .attr('fill', ('#' + getRandomBetween(0 + 30, 255 - 30).toString(16) + getRandomBetween(0 + 30, 255 - 30).toString(16) + getRandomBetween(0 + 30, 255 - 30).toString(16))))))
        .forEach(i => (bricks.push(new Elem(svg, 'rect')
        .attr('x', ((i - 1) * 90))
        .attr('y', 80)
        .attr('width', 90)
        .attr('height', 30)
        .attr('fill', ('#' + getRandomBetween(0 + 30, 255 - 30).toString(16) + getRandomBetween(0 + 30, 255 - 30).toString(16) + getRandomBetween(0 + 30, 255 - 30).toString(16))))))
        .subscribe(_ => { });
    const paddleArea = new Elem(svg, 'rect')
        .attr('width', svg.getBoundingClientRect().width)
        .attr('height', 100)
        .attr('x', 0)
        .attr('y', svg.getBoundingClientRect().height - 100)
        .attr('fill', '#444444');
    let paddle = new Elem(svg, 'rect')
        .attr('x', 30)
        .attr('y', 580)
        .attr('width', 120)
        .attr('height', 3)
        .attr('fill', '#FFFFFF');
    Observable
        .fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({ x: Math.floor(clientX - svg.getBoundingClientRect().left - parseInt(paddle.attr('width')) / 2), y: Math.floor(clientY - svg.getBoundingClientRect().top - parseInt(paddle.attr('height')) / 2) }))
        .filter(({ x }) => 0 <= x && x + parseInt(paddle.attr('width')) <= svg.getBoundingClientRect().width)
        .filter(({ y }) => isBetween(y, svg.getBoundingClientRect().height - 100, 100, 0))
        .subscribe(({ x, y }) => paddle.attr('x', x).attr('y', y));
    let ball = new Elem(svg, 'circle')
        .attr('cx', getRandomBetween(400, 500))
        .attr('cy', getRandomBetween(250, 350))
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
        .takeUntil(mainInterval.filter(_ => bricks.length == 0 || lives == 0))
        .map(() => ({
        x: parseInt(ball.attr('cx')),
        y: parseInt(ball.attr('cy')),
        r: parseInt(ball.attr('r')),
        xSpeed: parseInt(ball.attr('xSpeed')),
        ySpeed: parseInt(ball.attr('ySpeed')),
    }));
    mainObservable
        .filter(({ x, y, r, xSpeed, ySpeed }) => (isBetween(x, parseInt(paddle.attr('x')), parseInt(paddle.attr('width')), xSpeed) && isCollision(y + r, parseInt(paddle.attr('y')), 2 * ySpeed)))
        .subscribe(({ ySpeed }) => ball.attr('ySpeed', -1 * ySpeed));
    mainObservable
        .filter(({ x, r }) => isCollision(x + r, Math.floor(svg.getBoundingClientRect().width), parseInt(ball.attr('xSpeed'))) || isCollision(x - r, 0, parseInt(ball.attr('xSpeed'))))
        .subscribe(({ xSpeed }) => ball.attr('xSpeed', -1 * xSpeed));
    mainObservable
        .filter(({ y, r }) => isCollision(y - r, 0, parseInt(ball.attr('ySpeed'))))
        .subscribe(({ ySpeed }) => (ball.attr('ySpeed', -1 * ySpeed)));
    mainObservable.subscribe(({ x, y, xSpeed, ySpeed }) => ball.attr('cx', x + xSpeed).attr('cy', y + ySpeed));
    mainObservable
        .filter(({ x, y, r }) => isCollision(y + r, Math.floor(svg.getBoundingClientRect().height), parseInt(ball.attr('ySpeed'))))
        .subscribe(_ => updateAndReset(--lives, ball));
    mainObservable
        .map(({ x, y, r, xSpeed, ySpeed }) => bricks.map((brick) => ({ brick, brickX: parseInt(brick.attr('x')), brickY: parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height')) }))
        .filter(({ brick, brickX, brickY, brickWidth, brickHeight }) => ((isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y + r, brickY, ySpeed)) ||
        (isBetween(x, brickX, brickWidth, xSpeed) && isCollision(y - r, brickY + brickHeight, ySpeed)))).map(({ brick }) => removeAndReverse(bricks, brick, ball, 'ySpeed')))
        .filter(_ => bricks.length == 0)
        .subscribe(_ => document.getElementById("lives").innerHTML = "Awesome, you won! 🤩");
    mainObservable
        .map(({ x, y, r, xSpeed, ySpeed }) => bricks.map((brick) => ({ brick, brickX: parseInt(brick.attr('x')), brickY: parseInt(brick.attr('y')), brickWidth: parseInt(brick.attr('width')), brickHeight: parseInt(brick.attr('height')) }))
        .filter(({ brick, brickX, brickY, brickWidth, brickHeight }) => ((isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x + r, brickX, xSpeed)) ||
        (isBetween(y, brickY, brickHeight, ySpeed) && isCollision(x - r, brickX + brickWidth, xSpeed)))).map(({ brick }) => removeAndReverse(bricks, brick, ball, 'xSpeed')))
        .filter(_ => bricks.length == 0)
        .subscribe(_ => document.getElementById("lives").innerHTML = "Awesome, you won! 🤩");
}
function removeAndReverse(bricks, brick, ball, attributeLabel) {
    brick.elem.remove();
    let x = bricks.indexOf(brick);
    bricks.splice(x, 1);
    ball.attr(attributeLabel, -1 * parseInt(ball.attr(attributeLabel)));
}
function updateAndReset(lives, ball) {
    console.log('resetted the game!');
    const livesLabel = document.getElementById("lives");
    livesLabel.innerHTML = `Lives: ${"❤️".repeat(lives)}`;
    ball.attr('cx', getRandomBetween(400, 500)).attr('cy', getRandomBetween(250, 350)).attr('xSpeed', -1 * parseInt(ball.attr('xSpeed')));
}
if (typeof window != 'undefined')
    window.onload = () => {
        breakout();
    };
//# sourceMappingURL=breakout.js.map