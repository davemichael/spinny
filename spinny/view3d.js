import * as THREE from 'three';

function makeCubeGeometry(edgeLength, colors) {
  const h = edgeLength/2.0;  // half length
  const geometry = new THREE.BufferGeometry();
  // The a cube face and adjacent triangles on faces behind it, extending from
  // the bottom-left.
  const vertices = new Float32Array( [
      // color 0
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

      // color 1
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

      // color 2
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
  const norms = new Float32Array( [
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
  const color0_r = colors[0] >>> 16;
  const color1_r = colors[1] >>> 16;
  const color2_r = colors[2] >>> 16;
  const color0_g = (colors[0] >>> 8) & 0xff;
  const color1_g = (colors[1] >>> 8) & 0xff;
  const color2_g = (colors[2] >>> 8) & 0xff;
  const color0_b = colors[0] & 0xff;
  const color1_b = colors[1] & 0xff;
  const color2_b = colors[2] & 0xff;
  const color_buff = new Uint8Array([
      // color 0
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,
      color0_r, color0_g, color0_b,

      // color 1
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,
      color1_r, color1_g, color1_b,

      // color 2
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
      color2_r, color2_g, color2_b,
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(norms, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(color_buff, 3));
  return geometry;
}

function makeCube(colors) {
  const geometry = makeCubeGeometry(1.0, colors);
  const material = new THREE.MeshBasicMaterial({vertexColors: true});
  // material.wireframe = true;
  // material.opacity = 0.2;
  const mesh = new THREE.Mesh( geometry, material );
  return mesh;
}

function makeLines(lineColor, colors) {
  const edges = new THREE.EdgesGeometry(makeCubeGeometry(1.3, colors));
  const material = new THREE.LineBasicMaterial({ color: lineColor });
  material.wireframe = true;
  const lines = new THREE.LineSegments(edges, material);
  return lines;
}

function animate3d() {
  const canvas = document.querySelector('#c');
  canvas.width = 500;
  canvas.height = 500;
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

  const fov = 75;
  const aspect = 1;  // the canvas default
  const near = 0.1;
  const far = 5;
  // const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, near, far);
  // camera.position.z = 2;

  const scene = new THREE.Scene();
  const light = new THREE.PointLight( 0x808080, 5, 100 );
  light.position.set( 10, 10, 10 );
  scene.add( light );
  const colors = [0x800000, 0x008000, 0x000080]
  const cube = makeCube(colors);
  scene.add(cube);
  const lines = makeLines(0xffffff, colors);
  // scene.add(lines);

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
     lines.rotation.x = time * rotation_speed;
     lines.rotation.y = time * rotation_speed;
    cube.rotation.x = xRotation;
    cube.rotation.y = yRotation;
    cube.rotation.z = zRotation;
    lines.rotation.x = xRotation;
    lines.rotation.y = yRotation;
    lines.rotation.z = zRotation;

    camera.position.x = xCamera;
    camera.position.y = yCamera;
    camera.position.z = zCamera;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

window.animate3d = animate3d;


