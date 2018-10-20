# pong-breakout
An exercise to understand the difference between observer pattern and event-driven approach 🏓


## Overview 📜

The purpose of this assignment was to program a simple pong game applying the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) and abiding by paradigms of [functional programming](https://en.wikipedia.org/wiki/Functional_programming). In addition to the pong game, I have also implemented the atari breakout to exercise and improve my functional programming skills. An ideal functionally programmed game is possible to implement, however, in order to achieve such game one would have to make all the functions pure, even the functions dealing with user input. Furthermore, the whole state of pong would have to be passed around in functions in order to make it completely pure.

Both the games that have been implemented are not completely pure as have variables and objects (in the respective main functions) that other functions can access and mutate. Although having some impurity simplifies the implementation of the game but one of the cons of impurities, for instance having global variables, is that other functions may modify their state and program may have unexpectedly side effects. However, efforts have been made to minimise impurities in both the games.

Both the games have mainObservable that can be thought of as real world clock that `tick`. Besides animating the ball, mainObservable has many parallel task being carried out, for example checking if ball hits the paddle and checking if ball hits the svg boundary. An interesting thing that I noted while implementing the mainObservable was that if we execute Observable.interval(1).takeUntil(Observable.interval(100)).subscribe(x => console.log(x)) it does not print all the way till 99, it stops midway at a random number. To the best of my knowledge, I believe it happens because the inner interval that counts till 100 executes faster than the outer interval can count and print till 100. Hence, a workaround has been implemented in both the games. 
Additionally as both game use many common functions they have been implemented in helper.js


## Pong 🏓

In my pong implementation, when the ball strikes the paddle, its angles does not change does and neither does its speed. Consequently, the ball keeps on striking the bounds and paddles at a fixed angle (45 degrees) and follows a specific trajectory. In order to prevent that and make the game more interesting, the user controllable paddle is tweaked so that it can also move in the x direction (movable only in a certain region which is highlighted by another rectangle element named paddleArea). Because of that implementation, the error to detect collision between ball and paddle was doubled so that it can conclude their interaction as a collision when paddle is moving towards the ball. However, as a consequent of that is it may look like the ball is not striking the paddle surface when collision happens and the paddle is stationary. Having said that, to prevent unexpected behaviour it is recommended to keep the paddle stationary when ball is about to strike it.

## Breakout 👾

Since both the games are quite similar, as breakout can be thought of as vertical version of pong where instead of paddle there are bricks, many of the implementations are also quite similar in both the games. Even here, the paddle can move in x and y directions (but only in a certain region). The game initiates with 3 lives and 30 bricks. While playing the game you may find that the ball does not collide extreme corners of the brick and in some cases it may pass through the brick. The is because, my implementation checks whether the topmost edge of the ball collides the bottom edge of the brick (this is one example, there are other three checks for other three sides of the brick).


Described above is a high-level introduction of how the games have been implemented. For a more comprehensive documentation on functions please checkout the code documentation. 



## Credits 👏🏻
Assignment base by [Dr. Tim Dwyer](https://github.com/tgdwyer)

</br>
</br>
</br>

P.S. had nailed the assignment. 💯
