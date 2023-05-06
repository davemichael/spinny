import * as THREE from 'three';
import * as Const from "constants";

function makeCubeGeometry(edgeLength) {
  const h = edgeLength/2.0;
  const geometry0 = new THREE.BufferGeometry();
  const geometry1 = new THREE.BufferGeometry();
  const geometry2 = new THREE.BufferGeometry();
  const vertices0 = new Float32Array( [
      -h, h, h, // front-face, bottom-left
      -h, -h, h,
      h, -h, h,

      h, -h, h, // front-face, upper-right
      h, h, h,
      -h, h, h,

      h, -h, h, // bottom-face, forward-left
      -h, -h, h,
      -h, -h, -h,

      -h, -h, -h, // left-face, front-bottom
      -h, -h, h,
      -h, h, h,
  ]);

  const vertices1 = new Float32Array( [
      h, h, h, // right-face, front-bottom
      h, -h, h,
      h, -h, -h,

      h, -h, -h, // right-face, back-top
      h, h, -h,
      h, h, h,

      -h, -h, -h, // bottom-face, back-right
      h, -h, -h,
      h, -h, h,

      h, h, -h, // back-face, bottom-right
      h, -h, -h,
      -h, -h, -h,
  ]);
  const vertices2 = new Float32Array( [
      -h, h, h, // top-face, front-right
      h, h, h,
      h, h, -h,

      h, h, -h, // top-face, back-left
      -h, h, -h,
      -h, h, h,

      -h, h, h, // left-face, back-top
      -h, h, -h,
      -h, -h, -h,

      -h, -h, -h, // back-face, top-left
      -h, h, -h,
      h, h, -h,
  ] );

  const norms0 = new Float32Array( [
      // color 0
      0, 0, -1,  // front-face, bottom-left
      0, 0, -1,
      0, 0, -1,

      0, 0, -1,  // front-face, upper-right
      0, 0, -1,
      0, 0, -1,

      0, -1, 0,  // bottom-face, forward-left
      0, -1, 0,
      0, -1, 0,

      -1, 0, 0,  // left-face, front-bottom
      -1, 0, 0,
      -1, 0, 0,
  ]);
  const norms1 = new Float32Array( [
      // color 1
      1, 0, 0, // right-face, front-bottom
      1, 0, 0,
      1, 0, 0,

      1, 0, 0, // right-face, back-top
      1, 0, 0,
      1, 0, 0,

      0, -1, 0, // bottom-face, back-right
      0, -1, 0,
      0, -1, 0,
	  
      0, 0, 1, // back-face, bottom-right
      0, 0, 1,
      0, 0, 1,
  ]);
  const norms2 = new Float32Array( [
      // color 2
      0, 1, 0, // top-face, front-right
      0, 1, 0,
      0, 1, 0,

      0, 1, 0, // top-face, back-left
      0, 1, 0,
      0, 1, 0,

      -1, 0, 0, // left-face, back-top
      -1, 0, 0,
      -1, 0, 0,

      0, 0, 1, // back-face, top-left
      0, 0, 1,
      0, 0, 1,
  ]);
  geometry0.setAttribute('position', new THREE.BufferAttribute(vertices0, 3));
  geometry0.setAttribute('normal', new THREE.BufferAttribute(norms0, 3));
  geometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
  geometry1.setAttribute('normal', new THREE.BufferAttribute(norms1, 3));
  geometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
  geometry2.setAttribute('normal', new THREE.BufferAttribute(norms2, 3));
  return [geometry0, geometry1, geometry2];
}

function makeSphere(radius, colors, translation) {
  // Sweep out three thirds of a sphere about the Z axis.
  const geometry_top = new THREE.SphereGeometry(radius, 32, 16,
      0, 2*Math.PI / 3, 0, 2 * Math.PI);
  const geometry_right = new THREE.SphereGeometry(radius, 32, 16,
      4*Math.PI / 3, 2 * Math.PI / 3, 0, 2 * Math.PI);
  const geometry_left = new THREE.SphereGeometry(radius, 32, 16,
      2 * Math.PI / 3, 2 * Math.PI / 3, 0, 2 * Math.PI);
  const material_top = new THREE.MeshPhongMaterial( { color: colors[0] } );
  const material_right = new THREE.MeshPhongMaterial( { color: colors[1] } );
  const material_left = new THREE.MeshPhongMaterial( { color: colors[2] } );
  const sphere_top = new THREE.Mesh(geometry_top, material_top);
  const sphere_right = new THREE.Mesh(geometry_right, material_right);
  const sphere_left = new THREE.Mesh(geometry_left, material_left);
  sphere_top.rotation.x = Math.PI / 2;
  sphere_right.rotation.x = Math.PI / 2;
  sphere_left.rotation.x = Math.PI / 2;
  sphere_top.rotation.y = -5 * Math.PI / 6;
  sphere_right.rotation.y = -5 * Math.PI / 6;
  sphere_left.rotation.y = -5 * Math.PI / 6;
  sphere_top.eulerOrder = 'YXZ';
  sphere_left.eulerOrder = 'YXZ';
  sphere_right.eulerOrder = 'YXZ';
  var pivot = new THREE.Object3D();
  pivot.position.x += translation[0];
  pivot.position.y += translation[1];
  pivot.position.z += translation[2];

  pivot.add(sphere_top);
  pivot.add(sphere_right);
  pivot.add(sphere_left);
  return pivot;
}

function makeCube(edge_length, colors, translation) {
  const geometry = makeCubeGeometry(edge_length);
  // We drew our faces front, right, top...  and then rotated so that the faces
  // are ordered bottom-left, bottom-right, top. The controller expects
  // top, bottom-right, bottom-left order.
  const material0 = new THREE.MeshPhongMaterial({  wireframe: false, color: colors[2]});
  const material1 = new THREE.MeshPhongMaterial({  wireframe: false, color: colors[1]});
  const material2 = new THREE.MeshPhongMaterial({  wireframe: false, color: colors[0]});

  const mesh0 = new THREE.Mesh( geometry[0], material0);
  const mesh1 = new THREE.Mesh( geometry[1], material1);
  const mesh2 = new THREE.Mesh( geometry[2], material2);
  mesh0.rotation.x = 0.61548; // tan(1 / sqrt(2))
  mesh0.rotation.y = -Math.PI / 4.0;
  mesh1.rotation.x = 0.61548;
  mesh1.rotation.y = -Math.PI / 4.0;
  mesh2.rotation.x = 0.61548;
  mesh2.rotation.y = -Math.PI / 4.0;

  var pivot = new THREE.Object3D();
  pivot.position.x += translation[0];
  pivot.position.y += translation[1];
  pivot.position.z += translation[2];

  pivot.add(mesh0);
  pivot.add(mesh1);
  pivot.add(mesh2);
  return pivot;
}

class Ball {
  // Construct the Ball object that holds the renderable Object3D. It does not
  // initially add anything to the scene.
  constructor(radius, centerXY, scene) {
    this.centerX_ = centerXY[0];
    this.centerY_ = centerXY[1];
    this.scene_ = scene;
    this.object_ = undefined;
    this.radius_ = radius;
    // The sphere is inscribed in the cube, and the cubes are oriented
    // edge-to-edge, not face-to-face... so it's the diagonal that has to match
    // the diameter of the circle.
    // edge^2 + edge^2 = diagonal^2
    // edge = diagonal / sqrt(2)
    this.edge_length_ =  2 * this.radius_ / Math.sqrt(2);
  }
}

Ball.prototype.MakeLock = function(colors) {
  if (this.object_) this.object_.removeFromParent();
  this.object_ = makeCube(this.edge_length_, colors,
                          [this.centerX_, this.centerY_, 0]);
  this.scene_.add(this.object_);
}

Ball.prototype.MakeSphere = function(colors) {
  if (this.object_) this.object_.removeFromParent();
  this.object_ = makeSphere(this.radius_, colors,
                            [this.centerX_, this.centerY_, 0]);
  this.scene_.add(this.object_);
}

Ball.prototype.Rotate = function(angle) {
  this.object_.rotation.z = -angle;
}

class View3d {
  constructor(view_div, numRows, numCols) {
    const oldView = document.getElementById("canvasId");
    if (oldView) oldView.remove();
  
    this.canvas_ = document.createElement('canvas');
    this.canvas_.id = "canvasId";
    this.view_div_ = view_div
    this.view_div_.appendChild(this.canvas_);

    this.radius = 22;
    this.hex_edge = Const.kHexRatio * this.radius;
    this.horizontalSpacing = 2 * this.radius;
    this.verticalSpacing = this.radius * Const.kVerticalSpacingCoefficient;
    const canvasHeight = numRows * this.verticalSpacing +
                         2 * Const.kMarginCoefficient * this.radius;
    const canvasWidth = numCols * this.horizontalSpacing;
    this.canvas_.width = canvasWidth;
    this.canvas_.height = canvasHeight;

    this.renderer_ = new THREE.WebGLRenderer({antialias: true,
	                                     canvas: this.canvas_});
  
    const near = -Const.kHexRatio * 2 * this.radius;
    const far = Const.kHexRatio * 2 * this.radius;
    this.camera_ = new THREE.OrthographicCamera(0, canvasWidth, 0, -canvasHeight, near, far);
    // Push back the camera far enough to guarantee all cubes are visible.
    this.camera_.position.z =
        this.radius * Const.kVerticalSpacingCoefficient + 1;
  
    this.scene_ = new THREE.Scene();
    this.scene_.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.x = 1;
    directionalLight.position.y = 2;
    directionalLight.position.z = 1;
    this.scene_.add(directionalLight);

    // Now build the balls / cubes. We don't know colors initially.
    this.balls = Array();
    for (var i = 0; i < numRows; ++i) {
      this.balls[i] = Array();
      for (var j = 0; j < numCols - i%2; ++j) {
	var centerPoint = this._CenterPoint(i, j);
        this.balls[i][j] =
            new Ball(this.radius, [centerPoint[0], centerPoint[1]],
                     this.scene_);
      }
    }
  }
}

View3d.prototype._CenterPoint = function(row, column) {
  return [
      this.horizontalSpacing * column +
	  (row % 2) * (this.horizontalSpacing/2) +
	  this.radius,
      -(this.verticalSpacing * row + this.radius * (1 + Const.kMarginCoefficient))
  ];
}

View3d.prototype.MakeBall = function(row, column, colors) {
  this.balls[row][column].MakeSphere(colors);
}

View3d.prototype.MakeLock = function(row, column, colors) {
  this.balls[row][column].MakeLock(colors);
}

View3d.prototype.Rotate = function(row, column, old_colors, rotation) {
  this.balls[row][column].Rotate(rotation);
}

View3d.prototype.Render = function() {
  this.renderer_.render(this.scene_, this.camera_);
}

View3d.prototype.Clear = function(row, column, color) {
  // Clearing is not required in the WebGL implementation.
}

export { View3d };

