textureShader = function (gl) {
	var vertex_shader = "\
		uniform   mat4 uModelViewMatrix;	\n\
		uniform   mat4 uProjectionMatrix;	\n\
		attribute vec3 aPosition;					\n\
		attribute vec2 aTextureCoords;		\n\
		varying vec2 vTextureCoords;			\n\
		void main(void)										\n\
		{																	\n\
			vTextureCoords = aTextureCoords;				\n\
			gl_Position = uProjectionMatrix *				\n\
 			uModelViewMatrix * vec4(aPosition, 1.0);\n\
		}";
	var fragment_shader = "\
		precision highp float;					\n\
		uniform sampler2D uTexture;			\n\
		uniform vec4 uColor;						\n\
		varying vec2 vTextureCoords;		\n\
		void main(void)									\n\
		{																\n\
			gl_FragColor = texture2D(uTexture, vTextureCoords);	\n\
		} ";  


	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertex_shader);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragment_shader);
	gl.compileShader(fragmentShader);

	// Create the shader program

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	shaderProgram.aPositionIndex = 0;
	shaderProgram.aTextureCoordIndex = 3;

	shaderProgram.vertex_shader = vertex_shader;
	shaderProgram.fragment_shader = fragment_shader;

	gl.bindAttribLocation(shaderProgram, shaderProgram.aPositionIndex, "aPosition");
	gl.bindAttribLocation(shaderProgram, shaderProgram.aTextureCoordIndex, "aTextureCoords");
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
		str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}

	shaderProgram.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
	shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
	shaderProgram.uTextureLocation = gl.getUniformLocation(shaderProgram, "uTexture");

	return shaderProgram;
};

lambertianSingleColorShader2 = function (gl) {

 var shaderProgram = gl.createProgram();
    
shaderProgram.vertex_shader = "\
precision highp float;     \n\
   \n\
uniform mat4 uProjectionMatrix;     \n\
uniform mat4 uModelViewMatrix;   \n\
uniform mat3 uViewSpaceNormalMatrix;   \n\
attribute vec3 aPosition;  \n\
attribute vec3 aNormal;    \n\
varying vec3 vpos;   \n\
varying vec3 vnormal;\n\
   \n\
void main()    \n\
{  \n\
  // vertex normal (in view space)     \n\
  vnormal = normalize(uViewSpaceNormalMatrix * aNormal); \n\
   \n\
  \n\
// vertex position (in view space)   \n\
  vec4 position = vec4(aPosition, 1.0);\n\
  vpos = vec3(uModelViewMatrix *  position);  \n\
   \n\
   \n\
   \n\
  // output    \n\
  gl_Position = uProjectionMatrix *uModelViewMatrix * position;   \n\
}  \n\
"; 

shaderProgram.fragment_shader = "\
precision highp float;     \n\
   \n\
varying vec3 vnormal;\n\
varying vec3 vpos;   \n\
uniform vec4 uLightDirection;\n\
   \n\
// positional light: position and color\n\
uniform vec3 uLightColor;  \n\
uniform vec4 uColor;    \n\
   \n\
void main()    \n\
{  \n\
  // normalize interpolated normal     \n\
  vec3 N = normalize(vnormal);     \n\
   \n\
  // light vector (positional light)   \n\
  vec3 L = normalize(-uLightDirection.xyz); \n\
   \n\
  // diffuse component     \n\
  float NdotL = max(0.0, dot(N, L));   \n\
  vec3 lambert = (uColor.xyz * uLightColor) * NdotL * 0.3 + uColor.xyz * 0.7;    \n\
   \n\
  gl_FragColor  = vec4(lambert, 1.0);     \n\
  }  \n\
";


  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
   gl.shaderSource(vertexShader, shaderProgram.vertex_shader);
  gl.compileShader(vertexShader);
  
  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, shaderProgram.fragment_shader);
  gl.compileShader(fragmentShader);
  

  // Create the shader program
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  shaderProgram.aPositionIndex = 0;
  shaderProgram.aNormalIndex = 2;  
  gl.bindAttribLocation(shaderProgram, shaderProgram.aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, shaderProgram.aNormalIndex, "aNormal");
  gl.linkProgram(shaderProgram);
      
shaderProgram.vertexShader = vertexShader;
shaderProgram.fragmentShader = fragmentShader;
    
  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
    var str = "";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }
  

  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
  shaderProgram.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
  shaderProgram.uViewSpaceNormalMatrixLocation = gl.getUniformLocation(shaderProgram,"uViewSpaceNormalMatrix");
  shaderProgram.uLightDirectionLocation = gl.getUniformLocation(shaderProgram,"uLightDirection");
  shaderProgram.uLightColorLocation = gl.getUniformLocation(shaderProgram,"uLightColor");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram,"uColor");
  
  return shaderProgram;
};
