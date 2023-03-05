import * as V2D from 'view2d';
import * as V3D from 'view3d';
import * as Const from 'constants';

const kBackgroundColor = "#FFFFFF"
const colors = ["#D81B60", "#1E88E5", "#F3CD5B"];
const rotateTime = 100;

document.addEventListener("DOMContentLoaded", Init, false);

function Side() {
  this.color = undefined;
  this.neighbors = Array();
}

// Ball is the "model" for each spinny circle or hex. Display code should go
// elsewhere.
function Ball() {
  this.sides = [new Side(), new Side(), new Side()];
  this.locked = false;
}

Ball.prototype.GetColors = function() {
  return [this.sides[0].color, this.sides[1].color, this.sides[2].color];
}

Ball.prototype.Rotate = function(direction) {
  var times = 1;
  if (direction === "left") {
    const tempColor = this.sides[0].color;
    this.sides[0].color = this.sides[1].color;
    this.sides[1].color = this.sides[2].color;
    this.sides[2].color = tempColor;
  } else if (direction === "right") {
    const tempColor = this.sides[2].color;
    this.sides[2].color = this.sides[1].color;
    this.sides[1].color = this.sides[0].color;
    this.sides[0].color = tempColor;
  }
  else
    throw "Invalid direction, should be right or left: " + direction;
}

Ball.prototype.ToggleLock = function() {
  this.locked = !this.locked;
  return this.locked;
}

Ball.prototype.IsLocked = function() { return this.locked }

Ball.prototype.ColorIn = function() {
  for (var i = 0; i < this.sides.length; ++i) {
    if (this.sides[i].neighbors.length)
      this.sides[i].color = this.sides[i].neighbors[0].color;
    else
      this.sides[i].color = colors[Math.floor(3*Math.random())];
  }
}

/*
 Side index is like this:
    _____
   /     \
  /   0   \
 | \     / |
 |  \   /  |
 |   \ /   |
 | 2  V  1 |
 |    |    |
  \   |   /
   \__|__/
*/

function Board(rows, cols, seed) {
  this.balls = Array();
  for (var i = 0; i < rows; ++i) {
    this.balls[i] = Array();
    for (var j = 0; j < cols - i%2; ++j) {
      this.balls[i][j] = new Ball();
    }
  }
  // Build the neighbor graph
  var this_ = this;
  for (var i = 0; i < this.balls.length; ++i) {
    for (var j = 0; j < this.balls[i].length; ++j) {
      function addNeighbor(side, row, col, neighborIndex) {
        if (row >= 0 && row < this_.balls.length &&
            col >= 0 && col < this_.balls[row].length) {
          side.neighbors.push(this_.balls[row][col].sides[neighborIndex]);
          this_.balls[row][col].sides[neighborIndex].neighbors.push(side);
        }
      }
      // Above
      if (i % 2 === 0) { 
        addNeighbor(this.balls[i][j].sides[0], i - 1, j - 1, 1);  // Left
        addNeighbor(this.balls[i][j].sides[0], i - 1, j    , 2);  // Right
      } else {
        addNeighbor(this.balls[i][j].sides[0], i - 1, j    , 1);  // Left
        addNeighbor(this.balls[i][j].sides[0], i - 1, j + 1, 2);  // Right
      }
      // Same row, to the left.
      addNeighbor(this.balls[i][j].sides[2], i, j - 1, 1);

      this.balls[i][j].ColorIn();
    }
  }
}

Board.prototype.Shuffle = function() {
  for (var i = 0; i < this.balls.length; ++i) {
    for (var j = 0; j < this.balls[i].length; ++j) {
      var rotation = Math.floor(3*Math.random());
      for (var k = 0; k < rotation; ++k)
        this.balls[i][j].Rotate("right");
    }
  }
}

Board.prototype.Check = function() {
  for (var i = 0; i < this.balls.length; ++i) {
    for (var j = 0; j < this.balls[i].length; ++j) {
      for (var k = 0; k < this.balls[i][j].sides.length; ++k) {
        for (var m = 0; m < this.balls[i][j].sides[k].neighbors.length; ++m) {
          if (this.balls[i][j].sides[k].color !== this.balls[i][j].sides[k].neighbors[m].color) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

var numRows = undefined;
var numCols = undefined;
function getParams() {
  numRows = document.getElementById('numRows').value;
  numCols = document.getElementById('numCols').value;
  numRows = Math.min(Math.max(numRows, 1), Const.kMaxRows);
  numCols = Math.min(Math.max(numCols, 2), Const.kMaxCols);
}
function setParams(numRows,numCols) {
  document.getElementById('numRows').value = numRows
  document.getElementById('numCols').value = numCols;
}

function Controller() {
  this.canvas_ = undefined;
  this.view_ = undefined;
  this.view3d_ = false;
  this.board_ = undefined;
  this.clickHandler_ = undefined;
  this.viewDiv_ = document.getElementById('viewDiv');
  var timeOfLastClick_ = 0;
  var singleClickTimer_ = undefined;
}

var controller;
function Init() {
  controller = new Controller();
  controller.newGame();
}

// sets the difficulty to easy
window.makeEasy = function() {
  setParams(3, 3);
  controller.newGame()
}
// sets difficulty to medium
window.makeMedium = function() {
  setParams(6, 5);
    controller.newGame()
}
// sets difficulty to hard
window.makeHard = function() {
  setParams(10, 10);
  controller.newGame();
}
window.newGame = function() {
  controller.newGame();
}
window.toggleView = function() {
  controller.toggleView();
}

Controller.prototype.newGame = function() {
  getParams();
  // getParams clamps to the min/max; update the fields on the page.
  setParams(numRows, numCols);

  this.board_ = new Board(numRows, numCols, /* seed=*/ 0);
  this._ResetView();

  if (this.clickHandler_)
    this.viewDiv_.removeEventListener("click", this.clickHandler_, false);
  this.clickHandler_ = this.makeClickHandler();
  this.viewDiv_.addEventListener("click", this.clickHandler_, false);

  this.board_.Shuffle();
  this.DrawInitial();
}

Controller.prototype._ResetView = function() {
  if (this.view3d_) {
    this.view_ = new V3D.View3d(this.viewDiv_, numRows, numCols);
  } else {
    this.view_ = new V2D.View2d(this.viewDiv_, numRows, numCols);
  }
  // The view constructor might re-create the canvas, so we must fetch after.
  this.canvas_ = document.getElementById('canvasId');
}

Controller.prototype.toggleView = function() {
  this.view3d_ = !this.view3d_;
  this._ResetView();
  this.DrawInitial();
}

// Get the ball at (x,y), or undefined if there is none. Note that the inputs
// are clientX/clientY and do not yet account for scrolling or scaling.
// x and y range from 0 to 1.0, as a fraction of the drawing area.
Controller.prototype.PointToBall = function(clientX, clientY) {
  // Convert from clientX/clientY to page x/y. We don't worry about what the
  // canvas thinks its width is internally; we assume the view drew the balls in
  // an evenly spaced fashion.
  var rect = this.canvas_.getBoundingClientRect();
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const horizontalSpacing = width / numCols;
  const radius = horizontalSpacing / 2.0;
  // We have to account for the margin left at the top & bottom that makes sure
  // the hex can be fully drawn.
  //   height = numRows * verticalSpacing + 2 * kMarginCoefficient * radius
  // so
  const verticalSpacing = (height - 2 * Const.kMarginCoefficient * radius) / numRows;
  const x = clientX - rect.left;
  const y = clientY - rect.top - radius * Const.kMarginCoefficient;

  // return the row/col if in the ball, undefined otherwise.
  function ContainingBall(row) {
    const column = Math.floor((x - (row % 2) * radius) / horizontalSpacing);
    if (row < 0 || row >= numRows || column < 0 || column >= numCols)
      return undefined;
    const centerX = horizontalSpacing * (column) +
                    (row % 2) * radius +  // Account for odd rows
		    radius;  // Move from edge to center
    // our Y coordinates are after subtracting the margin.
   const centerY = verticalSpacing * (row) + radius;

    const dx = centerX - x; const dy = centerY - y;
    if (dx * dx + dy * dy <= radius * radius)
      return {"row": row, "col": column};
    return undefined;
  }

  // There are rows of pixels that interesect two rows of balls; test both.
  const approxRow = y / verticalSpacing;
  var maybeBall = ContainingBall(Math.floor(approxRow));
  if (maybeBall) return maybeBall;
  maybeBall = ContainingBall(Math.ceil(approxRow));
  if (maybeBall) return maybeBall;
}


Controller.prototype.makeClickHandler = function() {
  const this_ = this;
  const doubleClickTime = 200;
  return function onClick(mouse_event) {
    const rowCol = this_.PointToBall(mouse_event.clientX, mouse_event.clientY);
    if (!rowCol) {
      // No ball was clicked; ignore.
      return;
    }
    if (mouse_event.ctrlKey || mouse_event.metaKey) {
      this_.ToggleLock(rowCol.row, rowCol.col);
      return;
    }
    var timeSinceLastClick = mouse_event.timeStamp - this_.timeOfLastClick_;
    this_.timeOfLastClick_ = mouse_event.timeStamp;
    if (timeSinceLastClick < doubleClickTime) {
      // Cancel the single-click timer:
      if (this_.singleClickTimer_) {
        window.clearTimeout(this_.singleClickTimer_);
        this_.singleClickTimer_ = undefined;
      }
      // Rotate left:
      this_.RotateBall(rowCol.row, rowCol.col, "left");
    } else {
      this_.singleClickTimer_ =
          window.setTimeout(function() {
		  this_.RotateBall(rowCol.row, rowCol.col, "right")
	  }, doubleClickTime);
    }
  }
}

Controller.prototype.RotateBall = function(row, col, direction) {
  const ball = this.board_.balls[row][col];
  if (ball.IsLocked()) return;
  var oldColors = ball.GetColors();
  ball.Rotate(direction);
  const this_ = this;
  this.Animate(row, col, oldColors, direction, function() {
    // Make sure we get a correctly drawn last frame...  and effectively resets
    // the rotation to 0.
    this_.view_.MakeBall(row, col, ball.GetColors());
    this_.view_.Render();
  });
}

Controller.prototype.ToggleLock = function(row, col) {
  const ball = this.board_.balls[row][col];
  const colors = ball.GetColors();
  const is_locked = ball.ToggleLock();
  if (is_locked) {
    this.view_.MakeLock(row, col, colors);
  } else {
    this.view_.Clear(row, col, kBackgroundColor);
    this.view_.MakeBall(row, col, colors);
  }
  this.view_.Render();
}

Controller.prototype.DrawInitial = function() {
  for (var i = 0; i < this.board_.balls.length; ++i)
    for (var j = 0; j < this.board_.balls[i].length; ++j)
      if (this.board_.balls[i][j].IsLocked()) {
        this.view_.MakeLock(i, j, this.board_.balls[i][j].GetColors());
      } else {
        this.view_.MakeBall(i, j, this.board_.balls[i][j].GetColors());
      }
  this.view_.Render();
}

Controller.prototype.Animate = function(row, column, oldColors, direction,
	                                complete_fn) {
  var startTime = window.performance.now();
  var this_ = this;
  function drawFrame(time) {
    if ((time - startTime) >= rotateTime) {
      window.cancelAnimationFrame(id);
      percent = 1.0;
      complete_fn();
      if (this_.board_.Check())
        window.setTimeout(this_.Solved, 0)
      return;
    }
    else {
      var percent = (time - startTime) / rotateTime;
      requestAnimationFrame(drawFrame);
    }
    if (direction === "left")
      percent = -percent;
    const rotation = percent * 2 * Math.PI / 3
    this_.view_.Rotate(row, column, oldColors, rotation);
    this_.view_.Render();
  }
  const id = window.requestAnimationFrame(drawFrame);
}

Controller.prototype.Solved = function() {
  const win_messages = [
    "Winner!!!1!!",
    "Congratulations, you won!!",
    "Good work",
    "Nice job",
    "Thank you for playing",
    "Great job"
  ];
  alert(win_messages[Math.floor(Math.random() * win_messages.length)]);
}


