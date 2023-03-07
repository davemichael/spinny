import * as Const from 'constants';

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.Add = function(dx, dy) {
  return new Point(this.x + dx, this.y + dy);
}

class View2d {
  constructor(view_div, numRows, numCols) {
    this.radius = 22;
    this.hex_edge = Const.kHexRatio * this.radius;
    this.horizontalSpacing = 2 * this.radius;
    this.verticalSpacing = this.radius * Const.kVerticalSpacingCoefficient;
    
    const oldView = document.getElementById("canvasId");
    if (oldView) oldView.remove();
  
    this.canvas_ = document.createElement('canvas');
    this.canvas_.id = "canvasId";
    this.view_div_ = view_div
    this.context_ = this.canvas_.getContext("2d");
    this.view_div_.appendChild(this.canvas_);
  
    const canvasHeight = numRows * this.verticalSpacing +
                         2 * Const.kMarginCoefficient * this.radius;
    const canvasWidth = numCols * this.horizontalSpacing;
    this.canvas_.width = canvasWidth;
    this.canvas_.height = canvasHeight;
    this.context_.clearRect(0, 0, canvasWidth, canvasHeight);
  }
}

View2d.prototype._CenterPoint = function(row, column) {
  return new Point(
      this.horizontalSpacing * column +
	  (row % 2) * (this.horizontalSpacing/2) +
	  this.radius,
      this.verticalSpacing * row + this.radius * (1 + Const.kMarginCoefficient)
  );
}

View2d.prototype.Render = function() {
  // Rendering is already done when the drawing functions return.
}

View2d.prototype.Rotate = function(row, column, colors, rotation) {
  if (!rotation)
    rotation = 0;
  this.context_.save();
  var center = this._CenterPoint(row, column);
  var startAngle = (-1.0/6.0)*Math.PI + rotation;
  
  // Full circle with first color.
  this.context_.beginPath();
  this.context_.strokeStyle = colors[0];
  this.context_.fillStyle = colors[0];
  this.context_.moveTo(center.x, center.y);
  this.context_.arc(center.x, center.y, this.radius, 0, 2*Math.PI, false);
  this.context_.lineTo(center.x, center.y);
  this.context_.closePath();
  this.context_.fill();

  // Pie piece with 2nd and 3rd color.
  const oneThird = (2*Math.Pi)/3.0;
  this.context_.beginPath(); 
  this.context_.strokeStyle = colors[1];
  this.context_.fillStyle = colors[1];
  this.context_.moveTo(center.x, center.y);
  this.context_.arc(center.x, center.y, this.radius, startAngle, startAngle + Math.PI*(2.0/3.0), false);
  this.context_.lineTo(center.x, center.y);
  this.context_.closePath();
  this.context_.fill();

  this.context_.beginPath(); 
  this.context_.strokeStyle = colors[2];
  this.context_.fillStyle = colors[2];
  this.context_.moveTo(center.x, center.y);
  this.context_.arc(center.x, center.y, this.radius, startAngle + Math.PI*(2.0/3.0), startAngle + Math.PI*(4.0/3.0), false);
  this.context_.lineTo(center.x, center.y);
  this.context_.closePath();
  this.context_.fill();

  this.context_.restore();
}

View2d.prototype.MakeBall = function(row, column, colors) {
  this.Rotate(row, column, colors, 0);
}

View2d.prototype.MakeLock = function(row, column, colors) {
  this.context_.save();
  var center = this._CenterPoint(row, column);
  
  var points = [
	  center.Add(-this.radius, -this.hex_edge/2.0),
	  center.Add(0, -this.hex_edge),
	  center.Add(this.radius, -this.hex_edge/2.0),
	  center.Add(this.radius, this.hex_edge/2.0),
	  center.Add(0, this.hex_edge),
	  center.Add(-this.radius, this.hex_edge/2.0)
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
  this.MakeLock(row, column, [color, color, color]);
}

export { View2d };
