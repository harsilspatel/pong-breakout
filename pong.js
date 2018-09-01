"use strict";
function pong() {
    const svg = document.getElementById("canvas");
    let leftPaddle = new Elem(svg, 'rect')
        .attr('x', 30).attr('y', 70)
        .attr('width', 20).attr('height', 120)
        .attr('fill', '#FFFFFF');
    Observable.interval(10)
        .takeUntil(Observable.interval(1000))
        .subscribe(() => leftPaddle.attr('y', 1 + Number(leftPaddle.attr('y'))));
    let rightPaddle = new Elem(svg, 'rect')
        .attr('x', 900 - 30 - 20).attr('y', 70)
        .attr('width', 20).attr('height', 120)
        .attr('fill', '#FFFFFF');
    controlPaddleObservable(rightPaddle);
}
function controlPaddleObservable(paddle) {
    const svg = document.getElementById("canvas"), o = Observable
        .fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))
        .filter(({ x, y }) => (y + parseInt(paddle.attr('height')) <= parseInt(svg.getAttribute('height'))))
        .subscribe(({ x, y }) => paddle.attr('y', y));
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map