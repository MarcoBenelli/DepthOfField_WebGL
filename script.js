// Vertex shader program
let VSHADER_SOURCE = null;

// Fragment shader program
let FSHADER_SOURCE = null;

function main() {
    // Retrieve <canvas> element
    const canvas = document.getElementById('webgl2');

    // Get the rendering context for WebGL
    //var gl = getWebGLContext(canvas);
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Read shader from file
    loadShaderFile(gl, canvas, 'solid.vert', 'v');
    loadShaderFile(gl, canvas, 'color.frag', 'f');
}

function start(gl, canvas) {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex information
    const n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Set texture
    if (!initTextures(gl, n)) {
        console.log('Failed to intialize the texture.');
        return;
    }

    // Get the storage location of u_ModelViewMatrix
    const u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
    if (!u_ModelViewMatrix) {
        console.log('Failed to get the storage locations of u_ModelViewMatrix');
        return;
    }

    const eyeX = 2;
    const eyeY = 2;
    const eyeZ = 3;

    // Set the matrix to be used for to set the camera view
    const viewMatrix = new Matrix4();
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
//  viewMatrix.setLookAt(0.0, 0.0, 0.0, 0, 0, -1, 0, 1, 0);

    // Calculate object matrix
    const modelMatrix = new Matrix4();

    // Multiply model matrix to view matrix
    const modelViewMatrix = viewMatrix.multiply(modelMatrix);

    // Pass the model view matrix
    gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);

    // Get the storage location of u_ProjMatrix
    const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ProjMatrix) {
        console.log('Failed to get the storage locations of u_ProjMatrix');
        return;
    }

    // Set the matrix to be used for projection
    const projMatrix = new Matrix4();
    projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);

    // Pass the projection matrix
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

}

function initVertexBuffers(gl) {
    const verticesTexCoords = new Float32Array([
        // Vertex coordinates, texture coordinate

        //FRONT FACE
        -0.5, 0.5, 0.0, 0.0, 1.0, //v0
        -0.5, -0.5, 0.0, 0.0, 0.0, //v1
        0.5, 0.5, 0.0, 1.0, 1.0, //v2
        0.5, -0.5, 0.0, 1.0, 0.0, //v3
        0.5, 0.5, 0.0, 1.0, 1.0, //v2
        -0.5, -0.5, 0.0, 0.0, 0.0, //v1

        //RIGHT FACE
        0.5, 0.5, 0.0, 0.0, 1.0, //v2
        0.5, -0.5, 0.0, 0.0, 0.0, //v3
        0.5, 0.5, -1.0, 1.0, 1.0, //v4
        0.5, -0.5, -1.0, 1.0, 0.0, //v5
        0.5, 0.5, -1.0, 1.0, 1.0, //v4
        0.5, -0.5, 0.0, 0.0, 0.0, //v3

        //BACK FACE
        0.5, 0.5, -1.0, 0.0, 1.0, //v4
        0.5, -0.5, -1.0, 0.0, 0.0, //v5
        -0.5, 0.5, -1.0, 1.0, 1.0, //v6
        -0.5, -0.5, -1.0, 1.0, 0.0, //v7
        -0.5, 0.5, -1.0, 1.0, 1.0, //v6
        0.5, -0.5, -1.0, 0.0, 0.0, //v5

        //LEFT FACE
        -0.5, 0.5, -1.0, 0.0, 1.0, //v6
        -0.5, -0.5, -1.0, 0.0, 0.0, //v7
        -0.5, 0.5, 0.0, 1.0, 1.0, //v0
        -0.5, -0.5, 0.0, 1.0, 0.0, //v1
        -0.5, 0.5, 0.0, 1.0, 1.0, //v0
        -0.5, -0.5, -1.0, 0.0, 0.0, //v7

        //TOP FACE
        -0.5, 0.5, -1.0, 0.0, 1.0, //v6
        -0.5, 0.5, 0.0, 0.0, 0.0, //v0
        0.5, 0.5, -1.0, 1.0, 1.0, //v4
        0.5, 0.5, 0.0, 1.0, 0.0, //v2
        0.5, 0.5, -1.0, 1.0, 1.0, //v4
        -0.5, 0.5, 0.0, 0.0, 0.0, //v0

        //BOTTOM FACE
        -0.5, -0.5, 0.0, 0.0, 1.0, //v1
        -0.5, -0.5, -1.0, 0.0, 0.0, //v7
        0.5, -0.5, 0.0, 1.0, 1.0, //v3
        0.5, -0.5, -1.0, 1.0, 0.0, //v5
        0.5, -0.5, 0.0, 1.0, 1.0, //v3
        -0.5, -0.5, -1.0, 0.0, 0.0, //v7

    ]);
    const n = 36; // The number of vertices

    // Create the buffer object
    const vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
    const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
    }
    // Assign the buffer object to a_TexCoord variable
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

    return n;
}

function initTextures(gl, n) {
    const texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Get the storage location of u_Sampler
    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }
    const image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function () {
        loadTexture(gl, n, texture, u_Sampler, image);
    };
    // Tell the browser to load an image
    image.src = 'resources/checker.jpg';

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}

// Read shader from file
function loadShaderFile(gl, canvas, fileName, shader) {
    const request = new XMLHttpRequest();

    // Create a request to acquire the file
    request.open('GET', fileName, true);

    // Send the request
    request.send();

    // the file read is handled with a XMLHttpRequest and a subsequent event
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404)
            onLoadShader(gl, canvas, request.responseText, shader);
    }
}

// The shader is loaded from file
function onLoadShader(gl, canvas, fileString, shader) {
    if (shader === 'v')
        // Vertex shader
        VSHADER_SOURCE = fileString;
    else if (shader === 'f')
        // Fragment shader
        FSHADER_SOURCE = fileString;

    // When both are available, call start().
    if (VSHADER_SOURCE && FSHADER_SOURCE) {
        console.log(VSHADER_SOURCE);
        console.log(FSHADER_SOURCE);

        start(gl, canvas);
    }
}
