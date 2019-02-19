// ColoredCube.js (c) 2012 matsuda
// Vertex shader program
var canvas = document.getElementById('webgl');
var gl = getWebGLContext(canvas);

var gamesize = {x: 100, y: 100};

var modelMatrix = new Matrix4(); // Model matrix
var viewMatrix = new Matrix4();  // View matrix
var projMatrix = new Matrix4();  // Projection matrix
var mvpMatrix = new Matrix4();
var wallarray = [];
var vfront = 30;
var vrot = 1;
var despx = 0;
var despy = 0;

var angle = 0;

var cam = {
  pos : {x : 0,
         y : 0,
         z : 1},

  view : {x : 0,
          y : 0,
          z : 1},

  heig : {x : 0,
          y : 0,
          z : 1}
};

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function render() {


  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }


  // Set the clear color and enable the depth test
  gl.clearColor(0.3, 0.5, 0.8, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




  //console.log(despx);

  viewMatrix.setLookAt(cam.pos.x,cam.pos.y, cam.pos.z,
                      cam.view.x, cam.view.y, cam.view.z,
                      cam.heig.x, cam.heig.y, cam.heig.z);


  projMatrix.setPerspective(80, canvas.width/canvas.height, 0.2, 100);//ultimo near-far




  Makewall();

  drawFloor();

function Wall(x1,y1,z1,x2,y2,z2,x3,y3,z3) {

  this.pos = {x1 : 0,
              y1 : 0,
              z1 : 0};

  this.rot = {x2 : 0,
              y2 : 0,
              z2 : 0};

  this.scale = {x3 : 0,
                y3 : 0,
                z3 : 1};

}


function Placewall() {
    ;
}

function Makewall() {
    //modelMatrix = 0;
    // Set the vertex information
    var n = initVertexBuffers(gl);
    if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
    }



    modelMatrix.setTranslate(1, 1, 0.0).scale(1,1,1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    console.log("jajaj");
  }

function drawFloor() {
    // Set the vertex information
    var n = initFloorVertexBuffers(gl);
    if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
    }
    modelMatrix.setTranslate(0, 0, 0.0).scale(2,2,1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

}


function main() {
  // Retrieve <canvas> element

  //modelMatrix.setTranslate(0, 0, 0.0);

  render();

  document.addEventListener('keydown', keyHandler)

  //requestAnimationFrame(render);
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  // Create a cube

  //        v0
  //      /   |v8
  //    v/6---|-- v5
  //   //|    |  /|
  //  v0------v3|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v1------v2


  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0, 0.0,   1.0, 1.0, 0.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0, 0.0,   1.0,-1.0, 0.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0, 0.0,  -1.0,-1.0, 0.0,  -1.0, 1.0, 0.0,   1.0, 1.0, 0.0   // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer)
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initFloorVertexBuffers(gl) {

  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0,  // v0-v1-v2-v3 front
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 0.4, 0.0,  0.4, 0.4, 0.0,  0.4, 0.4, 0.0,  0.4, 0.4, 0.0,  // v0-v1-v2-v3 front(blue)
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer)
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}


function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  gl.clear(buffer);
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function keyHandler(event) {

  switch(event.key) {

    case "ArrowUp":
      Movement(0);
      break;
    case "ArrowDown":
      Movement(1);
      break;
    case "ArrowRight":
      Movement(2);
      break;
    case "ArrowLeft":
      Movement(3);
      break;
    default:
      //console.log("Key not handled");
  }
  requestAnimationFrame(render);
}
function Movement(move) {
  var camvector = {x: Math.cos(angle), y: Math.sin(angle)}

    //var deg_angle = (angle*180)/Math.PI;
    console.log(angle);
    switch (move) {
      //Avanzar
      case 0:
        cam.pos.x += camvector.x * 0.3
        cam.pos.y += camvector.y * 0.3
        break;
      //Retroceder
      case 1:
        cam.pos.x -= camvector.x * 0.3
        cam.pos.y -= camvector.y * 0.3
        break;
      //Right
      case 2:
        angle -= 0.2;


        break;
      //Left
      case 3:
        angle += 0.2


        break;

      default:

    }
    camvector = {x: Math.cos(angle), y: Math.sin(angle)}
    cam.view.x = camvector.x + cam.pos.x;
    cam.view.y = camvector.y + cam.pos.y;

    //console.log(angle);
}
/*
// Orientación de la cámara en eje horizontal (hacia dónde miramos)
var camvector = [Math.cos(deg_angle), Math.sin(deg_angle)];
cam.view.x = camvector[0] + cam.pos.x;
cam.view.y = camvector[1] + cam.pos.y;
cam.view.z = 1.80; // Altura de la cámara respecto del suelo
// Orientación de la cámara en eje vertical
cam.heig.x = 0;
cam.heig.y = 0;
cam.heig.z = 1; // Eje Z fijo
*/

//learnopengl.com/camera
