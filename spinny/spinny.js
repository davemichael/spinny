var canvasHeight = 400;
var canvasWidth = 400;
var radius = 22;
var centerRadius = 8;
var holeRadius = 10;
var horizontalSpacing = 44;
var verticalSpacing = 38;
//var numCols = Math.floor(canvasWidth / horizontalSpacing) - 1;
//var numRows = Math.floor(canvasHeight / verticalSpacing) - 1;
var colors = ["FCAF3E", "729FCF", "8AE234"];
var rotateTime = 100;

document.addEventListener("DOMContentLoaded", Init, false);

function Side() {
  this.color = undefined;
  this.neighbors = Array();
}

function Ball() {
  this.sides = [new Side(), new Side(), new Side()];
}

Ball.prototype.Colors = function() {
  return [this.sides[0].color, this.sides[1].color, this.sides[2].color];
}

Ball.prototype.Rotate = function(direction) {
  var times = 1;
  if (direction === "left") {
    tempColor = this.sides[0].color;
    this.sides[0].color = this.sides[1].color;
    this.sides[1].color = this.sides[2].color;
    this.sides[2].color = tempColor;
  } else if (direction === "right") {
    tempColor = this.sides[2].color;
    this.sides[2].color = this.sides[1].color;
    this.sides[1].color = this.sides[0].color;
    this.sides[0].color = tempColor;
  }
  else
    throw "Invalid direction, should be right or left: " + direction;
}

Ball.prototype.Color = function() {
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

function Board(rows, cols, seed, context) {
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

      this.balls[i][j].Color();
    }
  }
  this.context = context;
}

Board.prototype.RotateBall = function(row, col, direction) {
  var ball = this_.balls[rowCol.row][rowCol.col];
  var oldColors = ball.Colors();
  ball.Rotate(direction);
  this_.Animate(rowCol.row, rowCol.col, oldColors, direction);
}

// TODO: Move to prototype
var timeOfLastClick = 0;
var singleClickTimer = undefined;
Board.prototype.makeClickHandler = function() {
  this_ = this;
  var doubleClickTime = 200;
  return function onClick(mouse_event) {
    // First, compute which ball (if any) was clicked.
    var topOffset = 10;  // TODO(dmichael): Compute properly
    var leftOffset = 10;  // this too
    rowCol = this_.PointToBall(mouse_event.clientX - leftOffset,
                               mouse_event.clientY - topOffset);
    if (!rowCol)
      return;
    var timeSinceLastClick = mouse_event.timeStamp - timeOfLastClick;
    timeOfLastClick = mouse_event.timeStamp;
    if (timeSinceLastClick < doubleClickTime) {
      // Cancel the single-click timer:
      if (singleClickTimer) {
        window.clearTimeout(singleClickTimer);
        singleClickTimer = undefined;
      }
      // Rotate left:
      this_.RotateBall(rowCol.row, rowCol.col, "left");
    } else {
      singleClickTimer = window.setTimeout(this_.RotateBall, doubleClickTime,
                                           rowCol.row, rowCol.col, "right");
    }
  }
}

Board.prototype.DrawBall_ = function(row, column, colors, rotation) {
  if (!rotation)
    rotation = 0;
  this.context.save();
  var center = this.CenterPoint(row, column);
  var startAngle = (-1.0/6.0)*Math.PI + rotation;

  // Full circle with first color.
  this.context.beginPath();
  this.context.moveTo(center.x, center.y);
  this.context.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
  this.context.lineTo(center.x, center.y);
  this.context.closePath();
  this.context.fillStyle = colors[0];
  this.context.fill();

  // Pie piece with 2nd and 3rd color.
  var oneThird = (2*Math.Pi)/3.0;
  this.context.beginPath(); 
  this.context.moveTo(center.x, center.y);
  this.context.arc(center.x, center.y, radius, startAngle, startAngle + Math.PI*(2.0/3.0), false);
  this.context.lineTo(center.x, center.y);
  this.context.closePath();
  this.context.fillStyle = colors[1];
  this.context.fill();

  this.context.beginPath(); 
  this.context.moveTo(center.x, center.y);
  this.context.arc(center.x, center.y, radius, startAngle + Math.PI*(2.0/3.0), startAngle + Math.PI*(4.0/3.0), false);
  this.context.lineTo(center.x, center.y);
  this.context.closePath();
  this.context.fillStyle = colors[2];
  this.context.fill();

  this.context.restore();
}

Board.prototype.Draw = function() {
  for (var i = 0; i < this.balls.length; ++i)
    for (var j = 0; j < this.balls[i].length; ++j)
      this.DrawBall_(i, j, this.balls[i][j].Colors());
}

Board.prototype.Animate = function(row, column, oldColors, direction) {
  var startTime = window.performance.now();
  var this_ = this;
  function drawFrame(time) {
    if ((time - startTime) >= rotateTime) {
      window.cancelAnimationFrame(id);
      percent = 1.0;
      if (this_.Check())
        window.setTimeout(this_.Solved, 0)
    }
    else {
      percent = (time - startTime) / rotateTime;
      requestAnimationFrame(drawFrame);
    }
    if (direction === "left")
      percent = -percent;
    rotation = percent * 2 * Math.PI / 3
    this_.DrawBall_(row, column, oldColors, rotation);
  }
  var id = window.requestAnimationFrame(drawFrame);
}

Board.prototype.Solved = function() {
  alert("Winner!!!1!!");
  // TODO(dmichael): Make an animation
}

Board.prototype.CenterPoint = function(row, column) {
  var center = new Object;
  center.x = horizontalSpacing * (column) + (row % 2) * (horizontalSpacing/2) + radius;
  center.y = verticalSpacing * (row) + radius;
  return center;
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

// Get the ball at (x,y), or undefined if there is none.
Board.prototype.PointToBall = function(x, y) {
  // TODO(dmichael): Could compute this directly instead of searching.
  for (var i = 0; i < this.balls.length; ++i) {
    for (var j = 0; j < this.balls[i].length; ++j) {
      center = this.CenterPoint(i, j);
      dx = center.x - x; dy = center.y - y;
      if (dx * dx + dy * dy <= radius * radius)
        return {"row": i, "col": j};
    }
  }
  return undefined;
}

var numRows = undefined;
var numCols = undefined;
function getParams() {
  numRows = document.getElementById('numRows').value;
  numCols = document.getElementById('numCols').value;
}


function Init() {
  var canvas = document.getElementById('canvasId');
  var context = canvas.getContext("2d");
  newGame();
}

var board = undefined;
var clickHandler = undefined;
function newGame() {
  canvasDiv = document.getElementById('canvasDiv');
  if (board && clickHandler)
    canvasDiv.removeEventListener("click", clickHandler, false);
  getParams();
  var canvasWidth = (numCols - 1) * horizontalSpacing + radius * 2;
  var canvasHeight = (numRows - 1) * verticalSpacing + radius * 2;
  var canvas = document.getElementById('canvasId');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  var context = canvas.getContext("2d");
  board = new Board(numRows, numCols, 0, context);
  clickHandler = board.makeClickHandler();
  canvasDiv.addEventListener("click", clickHandler, false);
  board.Shuffle();
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  board.Draw();
}
