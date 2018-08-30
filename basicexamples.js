"use strict";
function mousePosEvents() {
    const pos = document.getElementById("pos");
    document.addEventListener("mousemove", e => {
        const p = e.clientX + ', ' + e.clientY;
        pos.innerHTML = p;
        if (e.clientX > 400) {
            pos.classList.add('highlight');
        }
        else {
            pos.classList.remove('highlight');
        }
    });
}
function mousePosObservable() {
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
function animatedRectTimer() {
    const svg = document.getElementById("animatedRect");
    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    const animate = setInterval(() => rect.attr('x', 1 + Number(rect.attr('x'))), 10);
    const timer = setInterval(() => {
        clearInterval(animate);
        clearInterval(timer);
    }, 1000);
}
function animatedRect() {
    const svg = document.getElementById("animatedRect");
    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    Observable.interval(10)
        .takeUntil(Observable.interval(1000))
        .subscribe(() => rect.attr('x', 1 + Number(rect.attr('x'))));
}
function dragRectEvents() {
    const svg = document.getElementById("dragRect"), { left, top } = svg.getBoundingClientRect();
    const rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    rect.elem.addEventListener('mousedown', ((e) => {
        const xOffset = Number(rect.attr('x')) - e.clientX, yOffset = Number(rect.attr('y')) - e.clientY, moveListener = (e) => {
            rect
                .attr('x', e.clientX + xOffset)
                .attr('y', e.clientY + yOffset);
        }, done = () => {
            svg.removeEventListener('mousemove', moveListener);
        };
        svg.addEventListener('mousemove', moveListener);
        svg.addEventListener('mouseup', done);
        svg.addEventListener('mouseout', done);
    }));
}
function dragRectObservable() {
    const svg = document.getElementById("dragRect");
    const mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup'), rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    let x = dragRect(svg, rect);
    console.log(x);
    x.subscribe(() => { });
}
function dragRect(svg, rect) {
    const mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup');
    return rect.observe('mousedown')
        .map(event => { event.stopPropagation(); return event; })
        .map(({ clientX, clientY }) => ({ xOffset: Number(rect.attr('x')) - clientX,
        yOffset: Number(rect.attr('y')) - clientY }))
        .flatMap(({ xOffset, yOffset }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientX, clientY }) => ({ x: clientX + xOffset, y: clientY + yOffset })))
        .map(({ x, y }) => rect.attr('x', x)
        .attr('y', y));
}
function drawRectsEvents() {
    const svg = document.getElementById("drawRects");
    svg.addEventListener('mousedown', e => {
        const svgRect = svg.getBoundingClientRect(), x0 = e.clientX - svgRect.left, y0 = e.clientY - svgRect.top, rect = new Elem(svg, 'rect')
            .attr('x', String(x0))
            .attr('y', String(y0))
            .attr('width', '5')
            .attr('height', '5')
            .attr('fill', '#95B3D7');
        function moveListener(e) {
            const x1 = e.clientX - svgRect.left, y1 = e.clientY - svgRect.top, left = Math.min(x0, x1), top = Math.min(y0, y1), width = Math.abs(x0 - x1), height = Math.abs(y0 - y1);
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
function drawRectsObservable() {
    const svg = document.getElementById("drawRects");
    drawRect(svg).subscribe(() => { });
}
function drawRect(svg) {
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
function drawAndDragRectsObservable() {
    const svg = document.getElementById("drawAndDragRects");
    drawRect(svg)
        .map(elem => dragRect(svg, elem).subscribe(() => { }))
        .subscribe(() => { });
}
if (typeof window != 'undefined')
    window.onload = () => {
        mousePosObservable();
        animatedRect();
        dragRectObservable();
        drawRectsObservable();
        drawAndDragRectsObservable();
    };
//# sourceMappingURL=basicexamples.js.map