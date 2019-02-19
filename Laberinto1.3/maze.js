// ColoredCube.js (c) 2012 matsuda
// Vertex shader program
var canvas = document.getElementById('webgl');
var gl = getWebGLContext(canvas);
var cubeTexture;




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
  'attribute vec3 a_VertexPosition;\n' +
  'attribute vec2 a_TextureCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying highp vec2 v_TextureCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * vec4(a_VertexPosition, 1.0);\n' +
  '  v_TextureCoord = a_TextureCoord;\n' +
  '}\n';

var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying highp vec2 v_TextureCoord;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, vec2(v_TextureCoord.s, v_TextureCoord.t));\n' +
  '}\n';

//--------------------------HANDLER DE TEXTURAS--------------------------------//


function handleTextureLoaded(image, texture) {
  console.log("handleTextureLoaded, image = ", image);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

//------------------------------------$----------------------------------------//

function render() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //initVertexBuffers();
  //initTextures();
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
  var o = wallarray[0];
  var n = o.initVertexBuffers(gl);
  console.log(n);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }


  //console.log(despx);

  viewMatrix.setLookAt(cam.pos.x,cam.pos.y, cam.pos.z,
                      cam.view.x, cam.view.y, cam.view.z,
                      cam.heig.x, cam.heig.y, cam.heig.z);


  projMatrix.setPerspective(80, canvas.width/canvas.height, 0.2, 100);//ultimo near-far
  //mvpMatrix.set(pMatrix).multiply(vMatrix).multiply(mMatrix);

  modelMatrix.setTranslate(1, 1, 0.0).scale(1,1,1);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);


  //o.initTextures();
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);



  var vertexPositionAttribute = gl.getAttribLocation(gl.program, "a_VertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  var textureCoordAttribute = gl.getAttribLocation(gl.program, "a_TextureCoord");
  gl.enableVertexAttribArray(textureCoordAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, o.cubeVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, o.cubeVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.uniform1i(gl.getUniformLocation(gl.program, "u_Sampler"), 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.cubeVerticesIndexBuffer);



  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  console.log("jajaj");

  requestAnimationFrame(render, gl, cubeTexture);

}

function Wall(x,y,z) {

  this.pos = {x1 : x,
              y1 : y,
              z1 : z};

  this.scale = {x3 : 1,
                y3 : 1,
                z3 : 1};


  this.cubeVerticesBuffer;
  this.cubeVerticesTextureCoordBuffer;
  this.cubeVerticesIndexBuffer;
  //this.cubeTexture;

  this.initVertexBuffers = function (gl) {



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
    this.cubeVerticesBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesBuffer);


    var vertices = new Float32Array([   // Vertex coordinates
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0, 0.0,   1.0, 1.0, 0.0,  // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
     -1.0, 1.0, 1.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
     -1.0,-1.0, 0.0,   1.0,-1.0, 0.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
      1.0,-1.0, 0.0,  -1.0,-1.0, 0.0,  -1.0, 1.0, 0.0,   1.0, 1.0, 0.0   // v4-v7-v6-v5 back
       ]);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.cubeVerticesTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);

    var textureCoordinates = new Float32Array([
      0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,  // Front
      0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,  // Back
      0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,  // Top
      0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,  // Bottom
      0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,  // Right
      0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0   // Left
      ]);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);

    this.cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);

    var indices = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
      ]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indices.length;
  }

  this.initTextures = function () {
    cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
    var cubeImage = new Image();
    cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
    cubeImage.src = "resources/wall.png";

  }


}


function Placewall() {
    ;
}

function Makewall() {

  wallarray.push(new Wall(1,1,0));
  var o = wallarray[0];
  console.log(o);
  //modelMatrix = 0;
  // Set the vertex information
  var n = o.initVertexBuffers(gl);
  console.log(n);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  console.log(gl.program);
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    console.log(u_MvpMatrix);
    if (!u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
    }




    modelMatrix.setTranslate(1, 1, 0.0).scale(1,1,1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

    o.initTextures();
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);



    var vertexPositionAttribute = gl.getAttribLocation(gl.program, "a_VertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    var textureCoordAttribute = gl.getAttribLocation(gl.program, "a_TextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, o.cubeVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, o.cubeVerticesTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.uniform1i(gl.getUniformLocation(gl.program, "u_Sampler"), 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.cubeVerticesIndexBuffer);



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




function initFloorVertexBuffers(gl) {

  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0,  // v0-v1-v2-v3 front
  ]);

  var textureCoordinates = new Float32Array([
    0.0,  0.0,     1.0,  0.0,     1.0,  1.0,     0.0,  1.0,  // Front

  ]);
  gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);

  cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
  ]);

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

//------------------------------PROGRAM_MAIN----------------------------------//

function main() {
  // Retrieve <canvas> element
  wallarray.push(new Wall(1,1,1));
  //modelMatrix.setTranslate(0, 0, 0.0);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  wallarray[0].initTextures();
  if(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things



    document.addEventListener('keydown', keyHandler)

    requestAnimationFrame(render);
  }
}

//learnopengl.com/camera
