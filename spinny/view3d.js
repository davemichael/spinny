import * as THREE from 'three';

function makeCubeGeometry(edgeLength) { //, colors) {
  const h = edgeLength/2.0;  // half length
  const geometry0 = new THREE.BufferGeometry();
  const geometry1 = new THREE.BufferGeometry();
  const geometry2 = new THREE.BufferGeometry();
  // The a cube face and adjacent triangles on faces behind it, extending from
  // the bottom-left.
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

function makeCube(colors, translation) {
  const geometry = makeCubeGeometry(1.0);
  const material0 = new THREE.MeshPhongMaterial({  wireframe: false, color: colors[0]});
  const material1 = new THREE.MeshPhongMaterial({  wireframe: false, color: colors[1]});
  const material2 = new THREE.MeshPhongMaterial({  wireframe: false, color: colors[2]});

  const mesh0 = new THREE.Mesh( geometry[0], material0);
  const mesh1 = new THREE.Mesh( geometry[1], material1);
  const mesh2 = new THREE.Mesh( geometry[2], material2);
  /*mesh0.rotation.x = Math.Pi / 4.0;
  mesh0.rotation.y = Math.Pi / 4.0;
  mesh1.rotation.x = Math.Pi / 4.0;
  mesh1.rotation.y = Math.Pi / 4.0;
  mesh2.rotation.x = Math.Pi / 4.0;
  mesh2.rotation.y = Math.Pi / 4.0;*/

  var pivot = new THREE.Object3D();
  pivot.position.x += translation[0];
  pivot.position.y += translation[1];
  pivot.position.z += translation[2];

  pivot.add(mesh0);
  pivot.add(mesh1);
  pivot.add(mesh2);
  pivot.rotation.x =  Math.Pi / 4.0;
  pivot.rotation.y =  Math.Pi / 4.0;
  return pivot;
}

/*function makeLines() {
  const geometry = makeCubeGeometry(1.0, [0xffffff, 0xffffff, 0xffffff]);
  const material = new THREE.MeshBasicMaterial();
  material.wireframe = true;
  const mesh = new THREE.Mesh( geometry, material );
  return mesh;
}*/

function animate3d() {
  const canvas = document.querySelector('#c');
  canvas.width = 500;
  canvas.height = 500;
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

  const near = 0.1;
  const far = 50;
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, near, far);
  // camera.position.z = 2;

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  scene.add(directionalLight);
  const colors = [0xff0000, 0x00ff00, 0x0000ff]
  const cube = makeCube(colors, [2, 2, 0]);
  scene.add(cube);
  scene.add(makeCube(colors, [0, 0, 0]));

  function render(time) {
    time *= 0.001;  // convert time to seconds

    const xRotation = document.getElementById('xRotation').value;
    const yRotation = document.getElementById('yRotation').value;
    const zRotation = document.getElementById('zRotation').value;
    const xCamera = document.getElementById('xCamera').value;
    const yCamera = document.getElementById('yCamera').value;
    const zCamera = document.getElementById('zCamera').value;
     const rotation_speed = 1;
    // cube.rotation.x = time * rotation_speed;
    // cube.rotation.y = time * rotation_speed;
    // lines.rotation.x = time * rotation_speed;
    // lines.rotation.y = time * rotation_speed;
    cube.rotation.x = xRotation;
    cube.rotation.y = yRotation;
    cube.rotation.z = zRotation;
    // lines.rotation.x = xRotation;
    // lines.rotation.y = yRotation;
    // lines.rotation.z = zRotation;

    camera.position.x = xCamera;
    camera.position.y = yCamera;
    camera.position.z = zCamera;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

window.animate3d = animate3d;


