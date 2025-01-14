/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog4/triangles.json"; // triangles file loc
var defaultEye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(-0.5,1.5,-0.5); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var triangleTextures = [];
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var viewDelta = 0; // how much to displace view with each key press
var triangleBuffers = [];
var textureBuffers = [];

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader

//added by me
var vNormAttribLoc; // where to put normal for vertex shader
var vTextureAttribLoc; // where to put texture for vertex shader
var sampler2dULoc; // where to put sampler for fragment shader
var lighting_Loc; // where to put lighting model for fragment shader
var alphaULoc; // where to put alpha value for fragment shader
var viewDelta = 0; // how much to displace view with each key press
var lighting_modes = 0; // which light texture blend mode to use

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file
let spaceship_projectile = null;
const canvasLeft = -0.9;
const canvasRight = 1.6;
const canvasTop = 2.0;
//does stuff when keys are pressed
function handleKeyDown(event) {
    
    const modelEnum = {TRIANGLES: "triangles"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction
    
    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel]; 
        handleKeyDown.modelOn.on = true; 
    } // end highlight model
    
    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model

    function rotateModel(axis,direction) {
        if (handleKeyDown.modelOn != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    
    const spaceship = inputTriangles[spaceship_index_position];
    const spaceship_projectile = inputTriangles[spaceshipshot_index_position];
    const projectile = true;
    if (!spaceship) return;

    switch (event.code) {
        case "ArrowRight": // select next triangle set
            // highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn+1) % numTriangleSets);
            // break;
            if (spaceship) {
                vec3.add(spaceship.translation, spaceship.translation, vec3.fromValues(-0.1, 0, 0));
                if (spaceship.translation[0] + spaceship.vertices[0][0] < canvasLeft) {
                    vec3.add(spaceship.translation, spaceship.translation, vec3.fromValues(canvasRight - canvasLeft, 0, 0));
                }
                if(spaceship_projectile.translation[1] <= spaceship.translation[1])
                    {
                    spaceship_projectile.translation[0] = spaceship.translation[0];
                    spaceship_projectile.translation[1] = spaceship.translation[1];}
            }
            break;
        case "ArrowLeft": // select previous triangle set
            // highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numTriangleSets-1);
            // break;
            if (spaceship) {
                vec3.add(spaceship.translation, spaceship.translation, vec3.fromValues(0.1, 0, 0));

                // Wrap-around logic for the right edge
                if (spaceship.translation[0] + spaceship.vertices[2][0] > 1.9) {
                    vec3.add(spaceship.translation, spaceship.translation, vec3.fromValues(canvasLeft - canvasRight, 0, 0));
                }
                if(spaceship_projectile.translation[1] <= spaceship.translation[1])
                    {
                    spaceship_projectile.translation[0] = spaceship.translation[0];
                    spaceship_projectile.translation[1] = spaceship.translation[1];
                }
            }
            break;

        case "Space":
            fireProjectile();
            break;

        case "KeyB":
            lighting_modes = lighting_modes === 6 ? 0 : lighting_modes + 1;
            break;
    } // end switch
} // end handleKeyDown

// set up the webGL environment
function setupWebGL(y) {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed
    //document.addEventListener("keydown", handleKeyDown);

    var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
      var cw = imageCanvas.width, ch = imageCanvas.height; 
      imageContext = imageCanvas.getContext("2d"); 
      var bkgdImage = new Image(); 
      bkgdImage.crossOrigin = "Anonymous";
      
      bkgdImage.src = "space_bg.png";
      
      bkgdImage.onload = function(){
          var iw = bkgdImage.width, ih = bkgdImage.height;
          imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
     }

     
    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        //gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read models in, load them into webgl buffers
function loadModels(x) {
    
    // make an ellipsoid, with numLongSteps longitudes.
    // start with a sphere of radius 1 at origin
    // Returns verts, tris and normals
    inputTriangles = x; // read in the triangle data

    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the coord array
            var normToAdd; // vtx normal to add to the coord array
            var uvToAdd; // uv coords to add to the uv array
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
            
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = inputTriangles.length; // remember how many tri sets
            for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set
                
                // set up hilighting, modeling translation and rotation
                inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
                inputTriangles[whichSet].on = false; // not highlighted
                inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
                inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
                inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex and normal arrays, define model center and axes
                inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
                inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
                inputTriangles[whichSet].glTexCoords = [];  // texel list for webgl

                var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
                    normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
                    uvToAdd = inputTriangles[whichSet].uvs[whichSetVert];       // get uv to add

                    inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
                    inputTriangles[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
                    inputTriangles[whichSet].glTexCoords.push(1 - uvToAdd[0], 1 - uvToAdd[1]);

                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum
                } // end for vertices in set
                vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum

                // send the vertex coords and normals to webGL
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
                textureBuffers[whichSet] = gl.createBuffer();// init empty webgl set texture coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].glTexCoords), gl.STATIC_DRAW); // data in

                // set up the triangle index array, adjusting indices across sets
                inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
                    inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set 

        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aTextureCoord; // texture coordinates

        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying vec2 vTextureCoord; // texture coordinates for frag shader

        void main(void) {

            //vec2 flippedUV = vec2(aTextureCoord.y,aTextureCoord.x);
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 

            // set texture coordinates to send to fragment shader
            vTextureCoord = aTextureCoord;
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        uniform int ulighting_modes; // the lighting mode
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform float ualpha; // the transparency alpha
        uniform sampler2D usampler2d; // the sampler

        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        varying vec2 vTextureCoord; // texture coordinate
        
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            //vec2 flippedUV = vec2( vTextureCoord.y, vTextureCoord.x);

            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet

            //adding texture
            vec4 texture_output = texture2D(usampler2d, vTextureCoord);
            vec4 finalColor;
            // Mode 1: Use texture output directly
            if (ulighting_modes == 1) { 
                finalColor = texture_output;
            } else if (ulighting_modes == 2) {
                // Mode 2: Modulate color with texture output (RGB), keep texture alpha
                finalColor = vec4(colorOut * texture_output.rgb, texture_output.a);
            } else if (ulighting_modes == 3) {
                finalColor = vec4(0.5 * texture_output.rgb, texture_output.a); // Dim the texture slightly
            } else if (ulighting_modes == 4) {
                // Mode 4: Invert texture colors and use its alpha
                finalColor = vec4(1.0 - texture_output.rgb, texture_output.a);
            } else if (ulighting_modes == 5) {
                // Mode 5: Apply a grayscale filter to the texture
                float gray = dot(texture_output.rgb, vec3(0.3, 0.59, 0.11)); // Convert to grayscale using luminance
                finalColor = vec4(vec3(gray), texture_output.a);
            } else if (ulighting_modes == 6) {
                // Mode 6: Apply a color shift effect to the texture
                finalColor = vec4(texture_output.rgb + vec3(0.2, -0.2, 0.0), texture_output.a);
            } else {
                 // default: Modulate color with texture output (RGB) and alpha
                //finalColor = vec4(colorOut * texture_output.rgb, ualpha * texture_output.a);    
                finalColor = texture_output;       
            }
            
            gl_FragColor = finalColor;
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                vTextureAttribLoc = gl.getAttribLocation(shaderProgram, "aTextureCoord"); // ptr to texture coord attrib
                gl.enableVertexAttribArray(vTextureAttribLoc); // connect attrib to array

                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                sampler2dULoc = gl.getUniformLocation(shaderProgram, "usampler2d"); // ptr to sampler
                lighting_Loc = gl.getUniformLocation(shaderProgram, "ulighting_modes"); // ptr to lighting mode
                alphaULoc = gl.getUniformLocation(shaderProgram, "ualpha"); // ptr to alpha

                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// Add a variable to store previous positions of the projectiles
let prevPositions = new Array(inputTriangles.length).fill(null);
// Define a small threshold to detect movement for projectiles
const movementThreshold = 0.0001;
// render the loaded model
function renderModels() { 
    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
        
        // scale for highlighting if needed
        if (currModel.on)
            mat4.multiply(mMatrix,mat4.fromScaling(temp,vec3.fromValues(1.2,1.2,1.2)),mMatrix); // S(1.2) * T(-ctr)
        
        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
        
        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
        
    } // end make model transform
    for (let i = 0; i < numTriangleSets; i++) {
        if (!inputTriangles[i]){continue;}
        triangleTextures[i] = gl.createTexture();
        const image = new Image();
        image.crossOrigin = "Anonymous";
        //image.src = `https://ncsucgclass.github.io/prog4/${inputTriangles[i].material.texture}`;
        image.src = `${inputTriangles[i].material.texture}`;
        triangleTextures[i].image = image;
        gl.bindTexture(gl.TEXTURE_2D, triangleTextures[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    gl.uniform1i(lighting_Loc, lighting_modes); // pass in the lighting mode
    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
    
    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view
    var transparent_triangles = [];
    // render each triangle set
    var currSet; // the tri set and its material properties
    // Check if the projectile has moved
    for (let i = 17; i < inputTriangles.length; i++) {
        const projectile = inputTriangles[i];
        if (!projectile) continue;
        const prevPos = prevPositions[i];
        // If the position hasn't changed, skip the rendering of this projectile
        if ((prevPos && Math.abs(prevPos - projectile.translation[1]))) {
            console.log(prevPos - projectile.translation[1])
            continue; // Do not render if the position is the same as before
        }
        // Store the current position as the previous one for the next frame
        prevPositions[i] = projectile.translation[1];
    }
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
        currSet = inputTriangles[whichTriSet];
        if (!currSet) continue;
        currSet.index = whichTriSet;

        // Only render projectiles that have moved (this condition is checked above)
        if (whichTriSet >= 17) {
            const prevPos = prevPositions[whichTriSet];
            if (!(prevPos && Math.abs(prevPos - currSet.translation[1]))) {
                continue; // Skip rendering this projectile if it's stationary
            }
        }

        if(currSet.material.alpha == 1.0){
        // make model transform, add to view project
        makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
        gl.uniform1f(alphaULoc, currSet.material.alpha); // pass in the alpha

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffers[currSet.index]); // activate
        gl.vertexAttribPointer(vTextureAttribLoc, 2, gl.FLOAT, false, 0, 0); // feed
        gl.bindTexture(gl.TEXTURE_2D, triangleTextures[currSet.index]);
        gl.activeTexture(gl.TEXTURE0);
        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
        }
        else{
            transparent_triangles.push(currSet);
        }
    } // end for each triangle set
    
    // render transparent models
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);
    gl.depthMask(false);

    // Sort transparent models based on their z-coordinate (center[2]) in descending order
    transparent_triangles.sort(function(triangle1, triangle2) {
        return triangle2.center[2] - triangle1.center[2];
    });

    // render models in order of depth
    for(var whichModel=0; whichModel < transparent_triangles.length; whichModel++){
        var currSet = transparent_triangles[whichModel];
        makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix

        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
        gl.uniform1f(alphaULoc, currSet.material.alpha); // pass in the alpha

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[currSet.index]); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[currSet.index]); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffers[currSet.index]); // activate
        gl.vertexAttribPointer(vTextureAttribLoc, 2, gl.FLOAT, false, 0, 0); // feed

        gl.bindTexture(gl.TEXTURE_2D, triangleTextures[currSet.index]);
        gl.activeTexture(gl.TEXTURE0);

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[currSet.index]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[currSet.index],gl.UNSIGNED_SHORT,0); // render
    }
} // end render model

function alien(){
    return [{
        vertices: [[0.00, 1.5, 0.7],[0.05, 1.4 , 0.8],[0.10, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]

    },
    {
        vertices: [[0.15, 1.5, 0.7],[0.2, 1.4 , 0.8],[0.25, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]

    },
    {
        vertices: [[0.3, 1.5, 0.7],[0.35, 1.4 , 0.8],[0.4, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.45, 1.5, 0.7],[0.5, 1.4 , 0.8],[0.55, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien2.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.60, 1.5, 0.7],[0.65, 1.4 , 0.8],[0.7, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.75, 1.5, 0.7],[0.8, 1.4 , 0.8],[0.85, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien2.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.90, 1.5, 0.7],[0.95, 1.4 , 0.8],[1.00, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[1.05, 1.5, 0.7],[1.10, 1.4 , 0.8],[1.15, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.1, 1.25, 0.7],[0.15, 1.15 , 0.8],[0.2, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien2.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]

    },
    {
        vertices: [[0.25, 1.25, 0.7],[0.3, 1.15 , 0.8],[0.35, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.4, 1.25, 0.7],[0.45, 1.15 , 0.8],[0.5, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.55, 1.25, 0.7],[0.6, 1.15 , 0.8],[0.65, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien2.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
     {
        vertices: [[0.7, 1.25, 0.7],[0.75, 1.15 , 0.8],[0.8, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien2.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
     {
        vertices: [[0.85, 1.25, 0.7],[0.9, 1.15 , 0.8],[0.95, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien2.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
     {
        vertices: [[1.0, 1.25, 0.7],[1.05, 1.15 , 0.8],[1.1, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien1.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
    {
        vertices: [[0.55, -0.5, 0.7],[0.55, -0.4, 0.7],[0.75, -0.5, 0.7],[0.75, -0.4, 0.7]],
        triangles:[[0,1,2],[1,2,3]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "spaceship.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1],[0, 0, -1]],
        uvs: [[0, 0], [0, 1], [1, 0],[1,1]]
    }
    ]
}

function projectile(){
    return[ {
        vertices: [[0.55, -0.5, 0.7],[0.55, -0.4, 0.7],[0.75, -0.5, 0.7],[0.75, -0.4, 0.7]],
        triangles:[[0,1,2],[1,2,3]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1],[0, 0, -1]],
        uvs: [[0, 0], [0, 1], [1, 0],[1,1]]
    },
    {
        vertices: [[0.00, 1.5, 0.7],[0.05, 1.4 , 0.8],[0.10, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]

    },
    {
        vertices: [[0.15, 1.5, 0.7],[0.2, 1.4 , 0.8],[0.25, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]

    },
    {
        vertices: [[0.3, 1.5, 0.7],[0.35, 1.4 , 0.8],[0.4, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.45, 1.5, 0.7],[0.5, 1.4 , 0.8],[0.55, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.60, 1.5, 0.7],[0.65, 1.4 , 0.8],[0.7, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.75, 1.5, 0.7],[0.8, 1.4 , 0.8],[0.85, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.90, 1.5, 0.7],[0.95, 1.4 , 0.8],[1.00, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[1.05, 1.5, 0.7],[1.10, 1.4 , 0.8],[1.15, 1.5, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.1, 1.25, 0.7],[0.15, 1.15 , 0.8],[0.2, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]

    },
    {
        vertices: [[0.25, 1.25, 0.7],[0.3, 1.15 , 0.8],[0.35, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.4, 1.25, 0.7],[0.45, 1.15 , 0.8],[0.5, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
    },
    {
        vertices: [[0.55, 1.25, 0.7],[0.6, 1.15 , 0.8],[0.65, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
     {
        vertices: [[0.7, 1.25, 0.7],[0.75, 1.15 , 0.8],[0.8, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
     {
        vertices: [[0.85, 1.25, 0.7],[0.9, 1.15 , 0.8],[0.95, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     },
     {
        vertices: [[1.0, 1.25, 0.7],[1.05, 1.15 , 0.8],[1.1, 1.25, 0.7]],
        triangles:[[0,1,2]],
        material:{
            ambient: [0.1, 0.1, 0.1],
                diffuse: [0.6, 0.4, 0.4],
                specular: [0.3, 0.3, 0.3],
                n: 11,
                alpha: 0.9,
                texture: "alien_bullet.png"
        },
        normals:[[0, 0, -1], [0, 0, -1], [0, 0, -1]],
        uvs: [[0, 0], [0.5, 1], [1, 0]]
     }
    ]
}

let alienGroupPosition = 0; // Track the current horizontal position of the group
let alienDirection = 1; // 1 for right, -1 for left
let stepCount = 0; // Track steps in current direction
const maxSteps = 100; // Maximum steps in one direction
const stepSize = 0.005; // Size of each step
const alienspeed = 0.01;

let descendingAliens = []; // Track descending aliens
const descendingSpeed = 0.01; // Speed of descending
const amplitude = 0.1; // Amplitude of sinusoidal motion

//finding bounding box using aabb method
// Compute the 3D bounding box for an object
function computeBoundingBox3D(model, scaleFactor) {
    const min = vec3.create();
    const max = vec3.create();
    vec3.set(min, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    vec3.set(max, -Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

    // Calculate bounds from vertices
    for (const vertex of model.vertices) {
        const translatedVertex = vec3.create();
        vec3.add(translatedVertex, vertex, model.translation); // Apply translation
        vec3.min(min, min, translatedVertex); // Update minimum bounds
        vec3.max(max, max, translatedVertex); // Update maximum bounds
    }

    // Shrink the bounding box by scaling it towards the center
    const center = vec3.create();
    vec3.add(center, min, max);
    vec3.scale(center, center, 0.5); // Compute center of the bounding box

    const reducedMin = vec3.create();
    const reducedMax = vec3.create();
    vec3.lerp(reducedMin, center, min, scaleFactor); // Shrink min towards center
    vec3.lerp(reducedMax, center, max, scaleFactor); // Shrink max towards center

    return { min: reducedMin, max: reducedMax };
}
// Check for collision between two 3D bounding boxes
function checkCollision3D(box1, box2) {
    return (
        box1.min[0] <= box2.max[0] && box1.max[0] >= box2.min[0] && // X-axis overlap
        box1.min[1] <= box2.max[1] && box1.max[1] >= box2.min[1] // Y-axis overlap
        //box1.min[2] <= box2.max[2] && box1.max[2] >= box2.min[2]    // Z-axis overlap
    );
}
let isProjectileActive = false;
spaceship_index_position = 15;
spaceshipshot_index_position = 16;
let x = false;
// Updated descending alien handler for 3D collision
function handleDescendingAliens() {
    const spaceship = inputTriangles[spaceship_index_position]; // Last object is the spaceship
    const spaceship_projectile = inputTriangles[spaceshipshot_index_position];
    if (!spaceship) return;

    const canvasLeft = -2.0; // Left boundary in NDC
    const canvasRight = 2.0; // Right boundary in NDC
    const canvasBottom = -2.5; // Bottom boundary in NDC

    // Initialize eligibleAliens list if not already initialized
    if (typeof eligibleAliens === "undefined") {
        eligibleAliens = Array.from({ length: total_aliens }, (_, i) => i); // All 8 aliens are initially eligible
    }

    // Randomly select aliens to descend from the eligible list
    if (Math.random() < 0.01 && descendingAliens.length < 2 && eligibleAliens.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligibleAliens.length); // Random eligible alien index
        const selectedAlienIndex = eligibleAliens[randomIndex]; // Get alien index from eligible list
        descendingAliens.push(selectedAlienIndex); // Add to descending list
        eligibleAliens.splice(randomIndex, 1); // Remove from eligible list
        console.log(`Alien ${selectedAlienIndex} starts descending.`);
    }

    // Move the projectile if it's active
    if (isProjectileActive) {
        spaceship_projectile.translation[1] += 0.05; // Move projectile upwards

        // Check if the projectile goes out of the canvas
        if (spaceship_projectile.translation[1] > canvasTop) {
            console.log("Projectile left the canvas. Resetting.");
            isProjectileActive = false; // Deactivate projectile
            spaceship_projectile.translation[0] = spaceship.translation[0];
            spaceship_projectile.translation[1] = spaceship.translation[1];
        }
    }

    // Update the position of descending aliens and check for collisions
    for (let i = 0; i < descendingAliens.length; i++) {
        const alienIndex = descendingAliens[i];
        const alien = inputTriangles[alienIndex];
        const alienProjectile = inputTriangles[alienIndex + 17];
        if (!alien) continue;

        // Calculate the horizontal movement direction towards the spaceship
        const horizontalDirection = spaceship.translation[0] - alien.translation[0];
        const horizontalStep = Math.sign(horizontalDirection) * Math.min(Math.abs(horizontalDirection), 0.02); // Limit step size

        vec3.add(alien.translation, alien.translation, vec3.fromValues(horizontalStep, -0.02, 0));
        //alienProjectile.isActive = false;
        // Fire the projectile if the alien reaches a certain point
        if (!alienProjectile.isActive ) {
            alienProjectile.translation[0] = alien.translation[0];
            alienProjectile.translation[1] = alien.translation[1];
            alienProjectile.isActive = true; // Activate the projectile
            x = true;
            console.log(`Alien ${alienIndex} fired a projectile.`);
        }
            // Move the projectile downward if active
        if (alienProjectile.isActive) {
            alienProjectile.translation[1] -= 0.05; // Projectile speed
            if (alienProjectile.translation[1] < -2.0) {
                alienProjectile.isActive = false; // Deactivate if out of canvas
                x = false;
                console.log(`Alien projectile ${alienIndex + 17} left the canvas.`);
            }
        }
        // Check collision with spaceship using aabb method
        const alienBox = computeBoundingBox3D(alien,0.5);
        const spaceshipBox = computeBoundingBox3D(spaceship,0.5);
        const spaceshipprojectileBox = computeBoundingBox3D(spaceship_projectile,0.5);
        const alienProjectileBox = computeBoundingBox3D(alienProjectile, 0.5);
        // //console.log(spaceshipBox)
        if (alienProjectile.isActive && checkCollision3D(alienProjectileBox, spaceshipBox)) {
            console.log(`Alien projectile ${alienIndex + 17} hit the spaceship. Game Over.`);
            alert("The spaceship was hit by an alien projectile! Game Over.");
            stopGame(); // End the game
            return;
        }

        if (isProjectileActive && (checkCollision3D(alienBox, spaceshipprojectileBox))) {
            console.log(`Alien ${alienIndex} removed. Position:`, alien.translation);
            inputTriangles[alienIndex] = null;
            if(alienIndex+17){
                inputTriangles[alienIndex+17] = null;
            }
            descendingAliens.splice(i, 1);
            //console.log(inputTriangles)
             // Remove alien from descending list
            i--;
            // Reset projectile position
            isProjectileActive = false;
            spaceship_projectile.translation[0] = spaceship.translation[0];
            spaceship_projectile.translation[1] = spaceship.translation[1];
            break;
        }
        
        if (checkCollision3D(alienBox, spaceshipBox)) {
            console.log(`Collision detected between Alien ${alienIndex} and Spaceship! Game Over.`);
            alert("Alien collided with the spaceship! Game Over."); // Popup message
            stopGame(); 
            //descendingAliens = []; // Stop descending aliens
            return; // End the game or trigger game over logic
        }
        // Remove the alien if it moves outside the canvas boundaries
        if (
            alien.translation[0] < canvasLeft || // Exits left
            alien.translation[0] > canvasRight || // Exits right
            alien.translation[1] < canvasBottom // Exits bottom
        ) {
            console.log(`Alien ${alienIndex} removed. Position:`, alien.translation);
            descendingAliens.splice(i, 1); // Remove alien from descending list
            i--; // Adjust index to account for removal
        }
    }

    // for (let i = 17; i < inputTriangles.length; i++) {
    //     const projectile = inputTriangles[i];
    //     if (!projectile || !projectile.isActive) continue;

    //     // Move the projectile downward
    //     projectile.translation[1] -= 0.05; // Adjust projectile speed
    //     if (projectile.translation[1] < canvasBottom) {
    //         projectile.isActive = false; // Deactivate projectile if out of bounds
    //         console.log(`Projectile ${i} left the canvas.`);
    //     }

    //     // Check for collisions with the spaceship
    //     const projectileBox = computeBoundingBox3D(projectile, 0.5);
    //     const spaceshipBox = computeBoundingBox3D(spaceship, 0.5);
    //     if (checkCollision3D(projectileBox, spaceshipBox)) {
    //         console.log(`Projectile ${i} hit the spaceship. Game Over.`);
    //         alert("The spaceship was hit by a projectile! Game Over.");
    //         stopGame(); // End the game
    //         return;
    //     }
    // }

    for (let i = 0; i < eligibleAliens.length; i++) {
        const alienIndex = eligibleAliens[i];
        const alien = inputTriangles[alienIndex];
        if (!alien) continue;

        // Compute bounding boxes
        const alienBox = computeBoundingBox3D(alien, 0.5);
        const projectileBox = computeBoundingBox3D(spaceship_projectile, 0.5);

        // Check for collisions with the projectile
        if (isProjectileActive && checkCollision3D(alienBox, projectileBox)) {
            console.log(`Eligible alien ${alienIndex} hit by projectile and removed.`);
            inputTriangles[alienIndex] = null; // Mark alien as removed
            inputTriangles[alienIndex+17] = null; // Mark alien as removed
            eligibleAliens.splice(i, 1); // Remove from eligible list
            i--;
            // Reset projectile position
            isProjectileActive = false;
            spaceship_projectile.translation[0] = spaceship.translation[0];
            spaceship_projectile.translation[1] = spaceship.translation[1];
            break;
        }
    }

}
function fireProjectile() {
    const spaceship = inputTriangles[spaceship_index_position];
    const spaceship_projectile = inputTriangles[spaceshipshot_index_position];
    if (!spaceship || !spaceship_projectile || isProjectileActive) return;
    // Activate the projectile and set its initial position
    isProjectileActive = true;
    spaceship_projectile.translation[0] = spaceship.translation[0];
    spaceship_projectile.translation[1] = spaceship.translation[1];
}
function stopGame() {
    descendingAliens = []; // Clear the list of descending aliens
    cancelAnimationFrame(animationFrameId); // Stop the animation loop
    console.log("Game stopped.");
}
function animateAliens() {
    // Move all aliens together
    for (let i = 0; i < total_aliens; i++) {
        const alien = inputTriangles[i];
        const alien_projectile = inputTriangles[i+17];
        if (!alien) continue;
        // Update position of each alien
        vec3.add(alien.translation, alien.translation, vec3.fromValues(alienDirection * stepSize, 0, 0));
        //console.log(alien.translation[1])
        // Cycle color or blend mode every few steps
        if (stepCount % 50 === 0) { // Adjust step count for timing
            lighting_modes = (lighting_modes + 1) % 7; // Cycle through available modes (0-6)
            alien.material.diffuse = [
                Math.random(), // Random red component
                Math.random(), // Random green component
                Math.random()  // Random blue component
            ]; // Update material color (optional if blending with texture)
        }
    }
    // Update group position and step count
    alienGroupPosition += alienDirection * stepSize;
    stepCount++;

    // Reverse direction or reset to center
    if (stepCount >= maxSteps) {
        if (alienGroupPosition >= maxSteps * stepSize) {
            alienDirection = -1; // Move left
            stepCount = 0;
        } else if (alienGroupPosition <= -maxSteps * stepSize) {
            alienDirection = 1; // Move right
            stepCount = 0;
        } else if (alienGroupPosition === 0) {
            alienDirection = alienDirection === 1 ? 1 : -1; // Continue current direction
            stepCount = 0;
        }
    }
    cycleAlienColors();
    handleDescendingAliens(); 
    requestAnimationFrame(animateAliens);
}

function cycleAlienColors() {
    for (let i = 0; i < 15; i++) {
        const alien = inputTriangles[i];
        if (!alien) continue;

        // Alternate between two colors randomly
        if (Math.random() < 0.05) {
            alien.material.diffuse = alien.material.diffuse[0] === 0.6
                ? [0.4, 0.6, 0.4]
                : [0.6, 0.4, 0.4];
        }
    }
}

total_aliens = 15;
// // Main Function
// function main() {
//     // Create the canvas for the splash screen
//     const splashCanvas = document.getElementById("myImageCanvas");
//     const splashContext = splashCanvas.getContext("2d");
//     // Load the background image (sky.jpg)
//     const backgroundImage = new Image();
//     backgroundImage.src = "sky.jpg";
//     backgroundImage.onload = function() {
//         // Draw the background image
//         splashContext.drawImage(backgroundImage, 0, 0, splashCanvas.width, splashCanvas.height);
//         // Display the instructions
//         splashContext.font = "30px Arial";
//         splashContext.fillStyle = "white";
//         splashContext.fillText("Hitting each alien is 5 points and missing them is 2 points", 50, splashCanvas.height / 2);
//         splashContext.fillText("Press Enter to begin the game", 50, splashCanvas.height / 2 + 40);
//     };

//     // Function to start the game
//     function startGame() {
//         // Initialize WebGL and load models
//         //setupWebGL();
//         //setupWebGL("https://ncsucgclass.github.io/prog4/sky.jpg");
//         // Set up the event listener for keydown events
//         document.onkeydown = handleKeyDown;
//         // Call the game loop function to start the game
//         gameLoop();
//     }

//     // Listen for the "Enter" key to start the game
//     document.addEventListener("keydown", function(event) {
//         if (event.key === "Enter") {
//             // Remove the splash screen and start the game
//             //splashCanvas.style.display = "none"; // Hide the splash screen canvas
//             setupWebGL("https://ncsucgclass.github.io/prog4/sky.jpg");
//             startGame();
//         }
//     });
// }

// function gameLoop() {
//     // Main game loop logic
//     // Your existing game rendering and logic go here.
//     // This function will be called after the splash screen is dismissed.
//     let projectileObjects = projectile(); // Load tree model
//     let alienObjects = alien(); // Load alien models
//     inputTriangles = alienObjects.concat(projectileObjects);
//     loadModels(inputTriangles); // Load into WebGL
//     setupShaders(); // Initialize shaders
//     animateAliens();
//     //requestAnimationFrame(animateAliens);
//     renderModels();
// }
// Main Function
function main() {
    setupWebGL("https://ncsucgclass.github.io/prog4/sky.jpg"); // Set up WebGL
    //inputTriangles = alien(); // Load alien and spaceship models
    let projectileObjects = projectile(); // Load tree model
    let alienObjects = alien(); // Load alien models
    inputTriangles = alienObjects.concat(projectileObjects);
    loadModels(inputTriangles); // Load into WebGL
    setupShaders(); // Initialize shaders
    animateAliens();
    //requestAnimationFrame(animateAliens);
    renderModels();
}
