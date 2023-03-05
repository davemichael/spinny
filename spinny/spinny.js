const radius = 22;
const horizontalSpacing = 2 * radius;
const hex_edge = Math.sqrt(4.0/3.0) * radius;
const verticalSpacing = hex_edge * 1.5;
const maxRows = 40;
const maxCols = 40;

// The circle is embedded in the hexagon; each edge of the hexagon
// is a tangent line segment whose center is on the circle.
//          1 ^ b
//          / | \ a       ca is r long
//        /   |  /\       Lcab is a right angle
//    0 /     |r/   \     A regular hexagon is made up of 6 equilateral
//     |      |/     |    triangles, so ab is half the length of cb.
//     |      c------|a   Use the pythagorean theorem to get...
//     |          r  |    cb = sqrt(4/3) * r
//    5 \           / 3
//        \       /
//          \   /
//            v 4
var kBackgroundColor = "#FFFFFF"
var colors = ["#D81B60", "#1E88E5", "#F3CD5B"];
var rotateTime = 100;

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

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.Add = function(dx, dy) {
  return new Point(this.x + dx, this.y + dy);
}

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
  numRows = Math.min(Math.max(numRows, 1), maxRows);
  numCols = Math.min(Math.max(numCols, 1), maxCols);
}
function setParams(numRows,numCols) {
  document.getElementById('numRows').value = numRows
  document.getElementById('numCols').value = numCols;
}

function View2d(view_div, numRows, numCols) {
  const oldView = document.getElementById("canvasId");
  if (oldView) oldView.remove();

  this.canvas_ = document.createElement('canvas');
  this.canvas_.id = "canvasId";
  this.view_div_ = view_div
  this.context_ = this.canvas_.getContext("2d");
  this.view_div_.appendChild(this.canvas_);

  const canvasHeight = (numRows - 1) * verticalSpacing + hex_edge * 2;
  const canvasWidth = (numCols - 1) * horizontalSpacing + hex_edge * 2;
  this.canvas_.width = canvasWidth;
  this.canvas_.height = canvasHeight;
  this.context_.clearRect(0, 0, canvasWidth, canvasHeight);
}

View2d.prototype.CenterPoint = function(row, column) {
  return new Point(
      horizontalSpacing * (column) + (row % 2) * (horizontalSpacing/2) + radius,
      verticalSpacing * (row) + radius
  );
}

// Get the ball at (x,y), or undefined if there is none. Note that the inputs
// are clientX/clientY and do not yet account for scrolling or scaling.
// x and y range from 0 to 1.0, as a fraction of the drawing area.
View2d.prototype.PointToBall = function(x, y, board) {
  x *= this.context_.canvas.width;
  y *= this.context_.canvas.height
  // TODO(dmichael): Could compute this directly instead of searching.
  for (var i = 0; i < board.balls.length; ++i) {
    for (var j = 0; j < board.balls[i].length; ++j) {
      center = this.CenterPoint(i, j);
      dx = center.x - x; dy = center.y - y;
      if (dx * dx + dy * dy <= radius * radius)
        return {"row": i, "col": j};
    }
  }
  return undefined;
}

View2d.prototype.DrawBall = function(row, column, colors, rotation) {
  if (!rotation)
    rotation = 0;
  this.context_.save();
  var center = this.CenterPoint(row, column);
  var startAngle = (-1.0/6.0)*Math.PI + rotation;
  
  // Full circle with first color.
  this.context_.beginPath();
  this.context_.strokeStyle = colors[0];
  this.context_.fillStyle = colors[0];
  this.context_.moveTo(center.x, center.y);
  this.context_.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
  this.context_.lineTo(center.x, center.y);
  this.context_.closePath();
  this.context_.fill();

  // Pie piece with 2nd and 3rd color.
  const oneThird = (2*Math.Pi)/3.0;
  this.context_.beginPath(); 
  this.context_.strokeStyle = colors[1];
  this.context_.fillStyle = colors[1];
  this.context_.moveTo(center.x, center.y);
  this.context_.arc(center.x, center.y, radius, startAngle, startAngle + Math.PI*(2.0/3.0), false);
  this.context_.lineTo(center.x, center.y);
  this.context_.closePath();
  this.context_.fill();

  this.context_.beginPath(); 
  this.context_.strokeStyle = colors[2];
  this.context_.fillStyle = colors[2];
  this.context_.moveTo(center.x, center.y);
  this.context_.arc(center.x, center.y, radius, startAngle + Math.PI*(2.0/3.0), startAngle + Math.PI*(4.0/3.0), false);
  this.context_.lineTo(center.x, center.y);
  this.context_.closePath();
  this.context_.fill();

  this.context_.restore();
}

View2d.prototype.DrawLock = function(row, column, colors) {
  this.context_.save();
  var center = this.CenterPoint(row, column);
  
  var points = [
	  center.Add(-radius, -hex_edge/2.0),
	  center.Add(0, -hex_edge),
	  center.Add(radius, -hex_edge/2.0),
	  center.Add(radius, hex_edge/2.0),
	  center.Add(0, hex_edge),
	  center.Add(-radius, hex_edge/2.0)
  ];

  // Full hex with first color.
  this.context_.beginPath();
  this.context_.strokeStyle = colors[0];
  this.context_.fillStyle = colors[0];
  this.context_.moveTo(points[0].x, points[0].y);
  this.context_.lineTo(points[1].x, points[1].y);
  this.context_.lineTo(points[2].x, points[2].y);
  this.context_.lineTo(points[3].x, points[3].y);
  this.context_.lineTo(points[4].x, points[4].y);
  this.context_.lineTo(points[5].x, points[5].y);
  this.context_.closePath();
  this.context_.fill();

  // Quadrilateral with 2nd color.
  this.context_.beginPath(); 
  this.context_.strokeStyle = colors[1];
  this.context_.fillStyle = colors[1];
  this.context_.moveTo(center.x, center.y);
  this.context_.lineTo(points[2].x, points[2].y);
  this.context_.lineTo(points[3].x, points[3].y);
  this.context_.lineTo(points[4].x, points[4].y);
  this.context_.closePath();
  this.context_.fill();

  // Quadrilateral with 3rd color.
  this.context_.beginPath(); 
  this.context_.strokeStyle = colors[2];
  this.context_.fillStyle = colors[2];
  this.context_.moveTo(center.x, center.y);
  this.context_.lineTo(points[4].x, points[4].y);
  this.context_.lineTo(points[5].x, points[5].y);
  this.context_.lineTo(points[0].x, points[0].y);
  this.context_.closePath();
  this.context_.fill();

  this.context_.restore();
}

View2d.prototype.Clear = function(row, column, color) {
  this.DrawLock(row, column, [color, color, color]);
}

function Controller(view, board) {
  this.view_ = undefined;
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
function makeEasy(){
  setParams(3, 3);
  controller.newGame()
}
// sets difficulty to medium
function makeMedium(){
  setParams(6, 5);
    controller.newGame()
}
// sets difficulty to hard
function makeHard(){
  setParams(10, 10);
  controller.newGame();
}

Controller.prototype.newGame = function() {
  getParams();
  this.viewDiv_ = document.getElementById('viewDiv');
  // TODO Making new game getting too many clicks
  if (this.clickHandler_)
    this.viewDiv_.removeEventListener("click", this.clickHandler_, false);
  this.board_ = new Board(numRows, numCols, /* seed=*/ 0);
  this.view_ = new View2d(this.viewDiv_, numRows, numCols);
  this.clickHandler_ = this.makeClickHandler();
  this.viewDiv_.addEventListener("click", this.clickHandler_, false);

  this.board_.Shuffle();
  this.Draw();
}

Controller.prototype.makeClickHandler = function() {
  this_ = this;
  const doubleClickTime = 200;
  return function onClick(mouse_event) {
    // FIXME this is too wrapped up with view
    var rect = this_.view_.canvas_.getBoundingClientRect();
    const x = (mouse_event.clientX - rect.left) / (rect.right - rect.left);
    const y = (mouse_event.clientY - rect.top) / (rect.bottom - rect.top);
    rowCol = this_.view_.PointToBall(x, y, this_.board_);
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
      console.log("double-click, rotate left");
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
  this.Animate(row, col, oldColors, direction);
}

Controller.prototype.ToggleLock = function(row, col) {
  const ball = this.board_.balls[row][col];
  const colors = ball.GetColors();
  is_locked = ball.ToggleLock();
  if (is_locked) {
    this.view_.DrawLock(row, col, colors);
  } else {
    this.view_.Clear(row, col, kBackgroundColor);
    this.view_.DrawBall(row, col, colors);
  }
}

Controller.prototype.Draw = function() {
  for (var i = 0; i < this.board_.balls.length; ++i)
    for (var j = 0; j < this.board_.balls[i].length; ++j)
      this.view_.DrawBall(i, j, this.board_.balls[i][j].GetColors());
}

Controller.prototype.Animate = function(row, column, oldColors, direction) {
  var startTime = window.performance.now();
  var this_ = this;
  function drawFrame(time) {
    if ((time - startTime) >= rotateTime) {
      window.cancelAnimationFrame(id);
      percent = 1.0;
      if (this_.board_.Check())
        window.setTimeout(this_.Solved, 0)
    }
    else {
      percent = (time - startTime) / rotateTime;
      requestAnimationFrame(drawFrame);
    }
    if (direction === "left")
      percent = -percent;
    rotation = percent * 2 * Math.PI / 3
    this_.view_.DrawBall(row, column, oldColors, rotation);
  }
  var id = window.requestAnimationFrame(drawFrame);
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
  // TODO(dmichael): Make an animation
}


