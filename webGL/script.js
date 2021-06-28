// Vertex shader program
let VSHADER_SOURCE = null;

// Fragment shader program
let FSHADER_SOURCE = null;

function main() {
    // Retrieve <canvas> element
    const canvas = document.getElementById('webgl2');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
    gl.clear
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

    const eyeZRange = document.getElementById('eye-z');

    const eyeX = 2;
    const eyeY = 2;
    let eyeZ = eyeZRange.value;

    // Set the matrix to be used for to set the camera view
    const viewMatrix = new Matrix4();
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
//  viewMatrix.setLookAt(0.0, 0.0, 0.0, 0, 0, -1, 0, 1, 0);

    // Calculate object matrix
    const modelMatrix = new Matrix4();

    // Multiply model matrix to view matrix
    let modelViewMatrix = viewMatrix.multiply(modelMatrix);

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
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    // Pass the projection matrix
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    window.onresize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    eyeZRange.onchange = function () {
        eyeZ = eyeZRange.value;
        viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
        modelViewMatrix = viewMatrix.multiply(modelMatrix);
        gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    const sagCheckbox = document.getElementById('sag');
    const u_SagV = gl.getUniformLocation(gl.program, 'u_SagV');
    if (!u_SagV) {
        console.log('Failed to get the storage locations of u_SagV');
        return;
    }
    gl.uniform1f(u_SagV, sagCheckbox.checked);
    const u_SagF = gl.getUniformLocation(gl.program, 'u_SagF');
    if (!u_SagF) {
        console.log('Failed to get the storage locations of u_SagF');
        return;
    }
    gl.uniform1f(u_SagF, sagCheckbox.checked);
    sagCheckbox.onchange = function () {
        gl.uniform1f(u_SagV, sagCheckbox.checked);
        gl.uniform1f(u_SagF, sagCheckbox.checked);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    const apertureRange = document.getElementById('aperture');
    const u_FocalApertureV = gl.getUniformLocation(gl.program, 'u_FocalApertureV');
    if (!u_FocalApertureV) {
        console.log('Failed to get the storage locations of u_FocalApertureV');
        return;
    }
    gl.uniform1f(u_FocalApertureV, Number(apertureRange.value));
    const u_FocalApertureF = gl.getUniformLocation(gl.program, 'u_FocalApertureF');
    if (!u_FocalApertureF) {
        console.log('Failed to get the storage locations of u_FocalApertureF');
        return;
    }
    gl.uniform1f(u_FocalApertureF, Number(apertureRange.value));
    apertureRange.onchange = function () {
        gl.uniform1f(u_FocalApertureV, Number(apertureRange.value));
        gl.uniform1f(u_FocalApertureF, Number(apertureRange.value));
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    const distanceRange = document.getElementById('distance');
    const u_FocusDistanceV = gl.getUniformLocation(gl.program, 'u_FocusDistanceV');
    if (!u_FocusDistanceV) {
        console.log('Failed to get the storage locations of u_FocusDistanceV');
        return;
    }
    gl.uniform1f(u_FocusDistanceV, Number(distanceRange.value));
    const u_FocusDistanceF = gl.getUniformLocation(gl.program, 'u_FocusDistanceF');
    if (!u_FocusDistanceF) {
        console.log('Failed to get the storage locations of u_FocusDistanceF');
        return;
    }
    gl.uniform1f(u_FocusDistanceF, Number(distanceRange.value));
    distanceRange.onchange = function () {
        gl.uniform1f(u_FocusDistanceV, Number(distanceRange.value));
        gl.uniform1f(u_FocusDistanceF, Number(distanceRange.value));
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    const maxblurRange = document.getElementById('maxblur');
    const u_MaxBlurV = gl.getUniformLocation(gl.program, 'u_MaxBlurV');
    if (!u_MaxBlurV) {
        console.log('Failed to get the storage locations of u_MaxBlurV');
        return;
    }
    gl.uniform1i(u_MaxBlurV, Number(maxblurRange.value));
    const u_MaxBlurF = gl.getUniformLocation(gl.program, 'u_MaxBlurF');
    if (!u_MaxBlurF) {
        console.log('Failed to get the storage locations of u_MaxBlurF');
        return;
    }
    gl.uniform1i(u_MaxBlurF, Number(maxblurRange.value));
    maxblurRange.onchange = function () {
        gl.uniform1i(u_MaxBlurV, Number(maxblurRange.value));
        gl.uniform1i(u_MaxBlurF, Number(maxblurRange.value));
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    const hyperbolicCheckbox = document.getElementById('hyperbolic');
    const u_HyperbolicV = gl.getUniformLocation(gl.program, 'u_HyperbolicV');
    if (!u_HyperbolicV) {
        console.log('Failed to get the storage locations of u_HyperbolicV');
        return;
    }
    gl.uniform1i(u_HyperbolicV, hyperbolicCheckbox.checked);
    const u_HyperbolicF = gl.getUniformLocation(gl.program, 'u_HyperbolicF');
    if (!u_HyperbolicF) {
        console.log('Failed to get the storage locations of u_HyperbolicF');
        return;
    }
    gl.uniform1i(u_HyperbolicF, hyperbolicCheckbox.checked);
    hyperbolicCheckbox.onchange = function () {
        gl.uniform1i(u_HyperbolicV, hyperbolicCheckbox.checked);
        gl.uniform1i(u_HyperbolicF, hyperbolicCheckbox.checked);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    const squaredCheckbox = document.getElementById('squared');
    const u_SquaredV = gl.getUniformLocation(gl.program, 'u_SquaredV');
    if (!u_SquaredV) {
        console.log('Failed to get the storage locations of u_SquaredV');
        return;
    }
    gl.uniform1i(u_SquaredV, squaredCheckbox.checked);
    const u_SquaredF = gl.getUniformLocation(gl.program, 'u_SquaredF');
    if (!u_SquaredF) {
        console.log('Failed to get the storage locations of u_SquaredF');
        return;
    }
    gl.uniform1i(u_SquaredF, squaredCheckbox.checked);
    squaredCheckbox.onchange = function () {
        gl.uniform1i(u_SquaredV, squaredCheckbox.checked);
        gl.uniform1i(u_SquaredF, squaredCheckbox.checked);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };
}

function initVertexBuffers(gl) {
    const verticesTexCoords = new Float32Array([
        // Vertex coordinates, texture coordinate

        //first cube

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

        //second cube

        //FRONT FACE
        -0.5, 0.5, 8.0, 0.0, 1.0, //v0
        -0.5, -0.5, 8.0, 0.0, 0.0, //v1
        0.5, 0.5, 8.0, 1.0, 1.0, //v2
        0.5, -0.5, 8.0, 1.0, 0.0, //v3
        0.5, 0.5, 8.0, 1.0, 1.0, //v2
        -0.5, -0.5, 8.0, 0.0, 0.0, //v1

        //RIGHT FACE
        0.5, 0.5, 8.0, 0.0, 1.0, //v2
        0.5, -0.5, 8.0, 0.0, 0.0, //v3
        0.5, 0.5, 7.0, 1.0, 1.0, //v4
        0.5, -0.5, 7.0, 1.0, 0.0, //v5
        0.5, 0.5, 7.0, 1.0, 1.0, //v4
        0.5, -0.5, 8.0, 0.0, 0.0, //v3

        //BACK FACE
        0.5, 0.5, 7.0, 0.0, 1.0, //v4
        0.5, -0.5, 7.0, 0.0, 0.0, //v5
        -0.5, 0.5, 7.0, 1.0, 1.0, //v6
        -0.5, -0.5, 7.0, 1.0, 0.0, //v7
        -0.5, 0.5, 7.0, 1.0, 1.0, //v6
        0.5, -0.5, 7.0, 0.0, 0.0, //v5

        //LEFT FACE
        -0.5, 0.5, 7.0, 0.0, 1.0, //v6
        -0.5, -0.5, 7.0, 0.0, 0.0, //v7
        -0.5, 0.5, 8.0, 1.0, 1.0, //v0
        -0.5, -0.5, 8.0, 1.0, 0.0, //v1
        -0.5, 0.5, 8.0, 1.0, 1.0, //v0
        -0.5, -0.5, 7.0, 0.0, 0.0, //v7

        //TOP FACE
        -0.5, 0.5, 7.0, 0.0, 1.0, //v6
        -0.5, 0.5, 8.0, 0.0, 0.0, //v0
        0.5, 0.5, 7.0, 1.0, 1.0, //v4
        0.5, 0.5, 8.0, 1.0, 0.0, //v2
        0.5, 0.5, 7.0, 1.0, 1.0, //v4
        -0.5, 0.5, 8.0, 0.0, 0.0, //v0

        //BOTTOM FACE
        -0.5, -0.5, 8.0, 0.0, 1.0, //v1
        -0.5, -0.5, 7.0, 0.0, 0.0, //v7
        0.5, -0.5, 8.0, 1.0, 1.0, //v3
        0.5, -0.5, 7.0, 1.0, 0.0, //v5
        0.5, -0.5, 8.0, 1.0, 1.0, //v3
        -0.5, -0.5, 7.0, 0.0, 0.0, //v7
    ]);
    const n = 72; // The number of vertices

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
    image.src = 'textures/sky.jpg';

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
    // Get the storage location of u_TexResolution
    const u_TexResolution = gl.getUniformLocation(gl.program, 'u_TexResolution');
    if (!u_TexResolution) {
        console.log('Failed to get the storage locations of u_TexResolution');
        return;
    }
    gl.uniform2fv(u_TexResolution, [image.width, image.height]);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
