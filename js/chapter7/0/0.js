// Global NVMC Client
// ID 7.0
/***********************************************************************/
var NVMCClient = NVMCClient || {};
/***********************************************************************/
NVMCClient.n_resources_to_wait_for = 0;
NVMCClient.texture_ground = null;
NVMCClient.texture_street = null;
NVMCClient.texture_facade = [];
NVMCClient.texture_roof = null;

NVMCClient.createTexture = function (gl, data) {//line 12, Listing{
	var texture = gl.createTexture();
	texture.image = new Image();
    texture.image.crossOrigin = "anonymous"; // this line is needed only in local-noserv mode (not in the book)
    NVMCClient.n_resources_to_wait_for++;
	var that = texture;
	texture.image.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, that);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, that.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
        NVMCClient.n_resources_to_wait_for--;
	};
	texture.image.src = data;
	return texture;
}//line 31}

NVMCClient.createObjectBuffers = function (gl, obj, createColorBuffer, createNormalBuffer, createTexCoordBuffer) {
	obj.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	if (createColorBuffer) {
		obj.colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.vertex_color, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (createNormalBuffer) {
		obj.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.vertex_normal, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (createTexCoordBuffer) {
		obj.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.textureCoord, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	obj.indexBufferTriangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	// create edges
	var edges = new Uint16Array(obj.numTriangles * 3 * 2);
	for (var i = 0; i < obj.numTriangles; ++i) {
		edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
		edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
		edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
		edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
		edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
		edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
	}

	obj.indexBufferEdges = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

};

NVMCClient.drawObject = function (gl, obj, shader, fillColor, drawWire) {
	// Draw the primitive
	gl.useProgram(shader);
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(shader.aPositionIndex);
	gl.vertexAttribPointer(shader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

	if (shader.aColorIndex && obj.colorBuffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
		gl.enableVertexAttribArray(shader.aColorIndex);
		gl.vertexAttribPointer(shader.aColorIndex, 4, gl.FLOAT, false, 0, 0);
	}

	if (shader.aNormalIndex && obj.normalBuffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.enableVertexAttribArray(shader.aNormalIndex);
		gl.vertexAttribPointer(shader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);
	}

	if (shader.aTextureCoordIndex && obj.textureCoordBuffer) {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureCoordBuffer);
		gl.enableVertexAttribArray(shader.aTextureCoordIndex);
		gl.vertexAttribPointer(shader.aTextureCoordIndex, 2, gl.FLOAT, false, 0, 0);
	}

	if (fillColor && shader.uColorLocation)
		gl.uniform4fv(shader.uColorLocation, fillColor);

	gl.enable(gl.POLYGON_OFFSET_FILL);

	gl.polygonOffset(1.0, 1.0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	if (drawWire) {
		gl.disable(gl.POLYGON_OFFSET_FILL);

		gl.useProgram(this.uniformShader);
		gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixMatrixLocation, false, this.stack.matrix);

		gl.uniform4fv(this.uniformShader.uColorLocation, [0, 0, 1, 1]);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
		gl.drawElements(gl.LINES, obj.numTriangles * 3 * 2, gl.UNSIGNED_SHORT, 0);
		gl.useProgram(shader);
	}

};

NVMCClient.createObjects = function () {
	this.cube = new Cube(10);
	this.cylinder = new Cylinder(10);
	this.cone = new Cone(10);

	this.track = new TexturedTrack(this.game.race.track, 0.2);

	var bbox = this.game.race.bbox;
	var quad = [bbox[0], bbox[1] - 0.01, bbox[2],
		bbox[3], bbox[1] - 0.01, bbox[2],
		bbox[3], bbox[1] - 0.01, bbox[5],
		bbox[0], bbox[1] - 0.01, bbox[5]
	];

	var text_coords = [-200, -200, 200, -200, 200, 200, -200, 200];
	this.ground = new TexturedQuadrilateral(quad, text_coords);
	this.cabin = new Cabin();
	this.windshield = new Windshield();

	var gameBuildings = this.game.race.buildings;
	this.buildings = new Array(gameBuildings.length);
	for (var i = 0; i < gameBuildings.length; ++i) {
		this.buildings[i] = new TexturedFacades(gameBuildings[i], 1);
		this.buildings[i].roof = new TexturedRoof(gameBuildings[i], 5);
	}
  
  var resolution = 20;
  this.base1_cylinder = new Cylinder(resolution, 0.95);
  this.base1_sphere2 = new Sphere1(10);
  this.base1_sphere2_cylinder = new Cylinder(10, 1.3);
  this.base1_sphere2_cylinder2 = new Cylinder(10, 1);
  this.base1_sphere2_cylinder2_sphere = new Sphere1(10);
  this.base1_cylinder2 = new Cylinder(resolution, 0.86);
  this.base1_cylinder2_sphere = new Sphere1(6);
  this.base1_cylinder2_sphere2 = new Sphere1(6);
  this.base1_cylinder2_octa = new Octahedron();
  this.base1_cylinder2_cylinder1 = new Cylinder(10, 0.7);
  this.base1_cylinder2_cylinder1_sphere = new Sphere1(6);
  this.base1_cylinder2_cylinder2 = new Cylinder(10, 0.7);
  this.base1_cylinder2_cylinder2_sphere = new Sphere1(6);
  this.base1_cylinder3 = new Cylinder(resolution, 0.9);
  this.base1_cylinder3_sphere = new Sphere1(10);
  this.base1_cylinder3_sphere_cone1 = new Cone(10);
  this.base1_cylinder3_sphere_torus1 = new Torus(6, 0.9);
  this.base1_cylinder3_sphere2 = new Sphere1(10);
  this.base1_cylinder3_sphere3 = new Sphere1(10);
  this.base1_sphere = new Sphere1(resolution);
  this.base1_octa = new Octahedron();
  
  this.base1_foot1 = new Cylinder(8, 1.2);
  this.base1_foot2 = new Cylinder(8, 1.2);
  this.base1_foot3 = new Cylinder(8, 1.2);
  this.base1_foot1_sphere = new Sphere1(4);
  this.base1_foot2_sphere = new Sphere1(4);
  this.base1_foot3_sphere = new Sphere1(4);
  
  this.base1_foot1r = new Cylinder(8, 1.2);
  this.base1_foot2r = new Cylinder(8, 1.2);
  this.base1_foot3r = new Cylinder(8, 1.2);
  this.base1_foot1r_sphere = new Sphere1(4);
  this.base1_foot2r_sphere = new Sphere1(4);
  this.base1_foot3r_sphere = new Sphere1(4);
};

NVMCClient.initialize = function(gl, prm) {
  ComputeNormals(prm);
  this.createObjectBuffers(gl, prm, false, true, false);
}

NVMCClient.createBuffers = function (gl) {
	this.createObjectBuffers(gl, this.cube, false, false, false);

	ComputeNormals(this.cylinder);
	this.createObjectBuffers(gl, this.cylinder, false, true, false);
 

	ComputeNormals(this.cone);
	this.createObjectBuffers(gl, this.cone, false, true, false);
 

	this.createObjectBuffers(gl, this.track, false, false, true);
	this.createObjectBuffers(gl, this.ground, false, false, true);

	this.createObjectBuffers(gl, this.cabin, true, false, false);
	this.createObjectBuffers(gl, this.windshield, true, false, false);

	for (var i = 0; i < this.buildings.length; ++i) {
		this.createObjectBuffers(gl, this.buildings[i], false, false, true);
		this.createObjectBuffers(gl, this.buildings[i].roof, false, false, true);
	}

  this.initialize(gl, this.base1_cylinder);
  this.initialize(gl, this.base1_sphere2);
  this.initialize(gl, this.base1_sphere2_cylinder);
  this.initialize(gl, this.base1_sphere2_cylinder2);
  this.initialize(gl, this.base1_sphere2_cylinder2_sphere);
  this.initialize(gl, this.base1_cylinder2);
  this.initialize(gl, this.base1_cylinder2_sphere);
  this.initialize(gl, this.base1_cylinder2_sphere2);
  this.initialize(gl, this.base1_cylinder2_octa);
  this.initialize(gl, this.base1_cylinder2_cylinder1);
  this.initialize(gl, this.base1_cylinder2_cylinder1_sphere);
  this.initialize(gl, this.base1_cylinder2_cylinder2);
  this.initialize(gl, this.base1_cylinder2_cylinder2_sphere);
  this.initialize(gl, this.base1_cylinder3);
  this.initialize(gl, this.base1_cylinder3_sphere);
  this.initialize(gl, this.base1_cylinder3_sphere_cone1);
  this.initialize(gl, this.base1_cylinder3_sphere_torus1);
  this.initialize(gl, this.base1_cylinder3_sphere2);
  this.initialize(gl, this.base1_cylinder3_sphere3);
  this.initialize(gl, this.base1_sphere);
  this.initialize(gl, this.base1_octa);
  this.initialize(gl, this.base1_foot1);
  this.initialize(gl, this.base1_foot2);
  this.initialize(gl, this.base1_foot3);
  this.initialize(gl, this.base1_foot1_sphere);
  this.initialize(gl, this.base1_foot2_sphere);
  this.initialize(gl, this.base1_foot3_sphere);
  this.initialize(gl, this.base1_foot1r);
  this.initialize(gl, this.base1_foot2r);
  this.initialize(gl, this.base1_foot3r);
  this.initialize(gl, this.base1_foot1r_sphere);
  this.initialize(gl, this.base1_foot2r_sphere);
  this.initialize(gl, this.base1_foot3r_sphere);
};

NVMCClient.initializeObjects = function (gl) {
	this.createObjects();
	this.createBuffers(gl);
};

NVMCClient.drawCar = function (gl) {
	this.sgl_renderer.begin();
	this.sgl_renderer.setTechnique(this.sgl_technique);

	this.sgl_renderer.setGlobals({
		"PROJECTION_MATRIX": this.projectionMatrix,
		"WORLD_VIEW_MATRIX": this.stack.matrix,
		"VIEW_SPACE_NORMAL_MATRIX": SglMat4.to33(this.stack.matrix),
		"LIGHTS_GEOMETRY": this.sunLightDirectionViewSpace,
		"LIGHT_COLOR": [0.9, 0.9, 0.9],
	});

	this.sgl_renderer.setPrimitiveMode("FILL");

	this.sgl_renderer.setModel(this.sgl_car_model);
	this.sgl_renderer.renderModel();
	this.sgl_renderer.end();
};

NVMCClient.createCarTechnique = function (gl, shaderToUse) {
	this.sgl_renderer = new SglModelRenderer(gl);
	this.sgl_technique = new SglTechnique(gl, {
		vertexShader: shaderToUse.vertex_shader,
		fragmentShader: shaderToUse.fragment_shader,
		vertexStreams: {
			"aPosition": [0.0, 0.0, 0.0, 1.0],
			"aNormal": [0.0, 0.0, 1.0, 0.0],
			"aDiffuse": [0.0, 0.0, 0.8, 0.0]
		},
		globals: {
			"uProjectionMatrix": {
				semantic: "PROJECTION_MATRIX",
				value: this.projectionMatrix
			},
			"uModelViewMatrix": {
				semantic: "WORLD_VIEW_MATRIX",
				value: this.stack.matrix
			},
			"uViewSpaceNormalMatrix": {
				semantic: "VIEW_SPACE_NORMAL_MATRIX",
				value: SglMat4.to33(this.stack.matrix)
			},
			"uLightDirection": {
				semantic: "LIGHTS_GEOMETRY",
				value: this.lightsGeometryViewSpace
			},
			"uLightColor": {
				semantic: "LIGHT_COLOR",
				value: this.lightColor
			},
		}
	});
};

NVMCClient.cam = SglMat4.identity();
NVMCClient.camrot = SglMat4.identity();
var debug = false;
this.prevabg = 2147483647;
this.prevabg2 = 2147483647;

NVMCClient.drawScene = function (gl) {
    if(NVMCClient.n_resources_to_wait_for>0) return;
	var width = this.ui.width;
	var height = this.ui.height
	var ratio = width / height;
	var stack = this.stack;

	gl.viewport(0, 0, width, height);
	// Clear the framebuffer
	gl.clearColor(0.4, 0.6, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);

	stack.loadIdentity();

	if (this.currentCamera == 3) {
		gl.useProgram(this.perVertexColorShader);
		gl.enable(gl.STENCIL_TEST);
		gl.clearStencil(0);
		gl.stencilMask(~0);
		gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
		gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

		gl.uniformMatrix4fv(this.perVertexColorShader.uModelViewMatrixLocation, false, SglMat4.identity());
		gl.uniformMatrix4fv(this.perVertexColorShader.uProjectionMatrixLocation, false, SglMat4.identity());
		this.drawObject(gl, this.cabin, this.perVertexColorShader, [0.4, 0.8, 0.9, 1.0], [0.4, 0.8, 0.9, 1.0]);

		gl.stencilFunc(gl.GREATER, 1, 0xFF);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
		gl.stencilMask(0);

	} else
		gl.disable(gl.STENCIL_TEST);

	// Setup projection matrix
	gl.useProgram(this.uniformShader);

	this.projectionMatrix = SglMat4.perspective(3.14 / 4, ratio, 1, 1000);
	this.cameras[2].projectionMatrix = this.projectionMatrix;
	gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false, this.projectionMatrix);

	var pos = this.game.state.players.me.dynamicState.position;
	var orientation = this.game.state.players.me.dynamicState.orientation;
  //console.log(this.stack);
  
  this.stack.multiply(this.camrot);
  this.stack.multiply(this.cam);
  
	this.cameras[this.currentCamera].setView(this.stack, this.myFrame());
  
	this.sunLightDirectionViewSpace = SglMat4.mul4(this.stack.matrix, this.sunLightDirection);

	gl.useProgram(this.phongShader);
	gl.uniformMatrix4fv(this.phongShader.uProjectionMatrixLocation, false, this.projectionMatrix);
	gl.uniformMatrix4fv(this.phongShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(this.phongShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
	gl.uniform4fv(this.phongShader.uLightDirectionLocation, this.sunLightDirectionViewSpace);

	gl.uniform3fv(this.phongShader.uLightColorLocation, [0.9, 0.9, 0.9]);
	gl.uniform1f(this.phongShader.uShininessLocation, 0.2);
	gl.uniform1f(this.phongShader.uKaLocation, 0.5);
	gl.uniform1f(this.phongShader.uKdLocation, 0.5);
	gl.uniform1f(this.phongShader.uKsLocation, 1.0);

	gl.useProgram(this.lambertianSingleColorShader);
	gl.uniformMatrix4fv(this.lambertianSingleColorShader.uProjectionMatrixLocation, false, this.projectionMatrix);
	gl.uniform4fv(this.lambertianSingleColorShader.uLightDirectionLocation, this.sunLightDirectionViewSpace);
	gl.uniform3fv(this.lambertianSingleColorShader.uLightColorLocation, [1.0, 1.0, 1.0]);
	var trees = this.game.race.trees;
	for (var t in trees) {
		stack.push();
		var M_8 = SglMat4.translation(trees[t].position);
		stack.multiply(M_8);
		this.drawTree(gl, this.lambertianSingleColorShader);
		stack.pop();
	}

	gl.useProgram(this.textureShader);
	gl.uniformMatrix4fv(this.textureShader.uProjectionMatrixLocation, false, this.projectionMatrix);
	gl.uniformMatrix4fv(this.textureShader.uModelViewMatrixLocation, false, stack.matrix);
	
	gl.activeTexture(gl.TEXTURE0);//line 318,Listing 7.4
	gl.bindTexture(gl.TEXTURE_2D, this.texture_ground);
	gl.uniform1i(this.textureShader.uTextureLocation, 0);//line 320}
	
	this.drawObject(gl, this.ground, this.textureShader, [0.3, 0.7, 0.2, 1.0], [0, 0, 0, 1.0]);
	//gl.bindTexture(gl.TEXTURE_2D, this.texture_street);
	//this.drawObject(gl, this.track, this.textureShader, [0.9, 0.8, 0.7, 1.0], [0, 0, 0, 1.0]);

	
	for (var i in this.buildings) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture_facade[i%this.texture_facade.length]);
		this.drawObject(gl, this.buildings[i], this.textureShader, [0.2, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
	}

	gl.bindTexture(gl.TEXTURE_2D, this.texture_roof);
	for (var i in this.buildings) {
		this.drawObject(gl, this.buildings[i].roof, this.textureShader, [0.2, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
	}

	if (this.currentCamera != 3) {
		//gl.useProgram(this.phongShader);
		//gl.uniformMatrix4fv(this.phongShader.uProjectionMatrixLocation, false, this.projectionMatrix);
		//gl.uniformMatrix4fv(this.phongShader.uModelViewMatrixLocation, false, stack.matrix);
		stack.push();
		var M_9 = SglMat4.translation(pos);
		stack.multiply(M_9);

		var M_9bis = SglMat4.rotationAngleAxis(this.game.state.players.me.dynamicState.orientation, [0, 1, 0]);
		stack.multiply(M_9bis);
    
    var game = this.game;

		//this.drawCar(gl);
    this.drawCharacter(gl);
		stack.pop();
	}

	gl.disable(gl.DEPTH_TEST);
	if (this.currentCamera == 3) {
		gl.useProgram(this.perVertexColorShader);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(this.perVertexColorShader);
		gl.uniformMatrix4fv(this.perVertexColorShader.uModelViewMatrixLocation, false, SglMat4.identity());
		gl.uniformMatrix4fv(this.perVertexColorShader.uProjectionLocation, false, SglMat4.identity());
		this.drawObject(gl, this.windshield, this.perVertexColorShader);
		gl.disable(gl.BLEND);

	}
};
/***********************************************************************/

// NVMC Client Events
/***********************************************************************/

NVMCClient.angle = 0;
NVMCClient.angle2 = 360;
NVMCClient.trans = SglMat4.identity();

NVMCClient.foot1 = 0;
NVMCClient.foot2 = 0;
NVMCClient.rot1 = SglMat4.identity();
NVMCClient.rot2 = SglMat4.identity();
NVMCClient.rot3 = SglMat4.identity();
NVMCClient.bdtrans = SglMat4.identity();

NVMCClient.angle_e = 0;
NVMCClient.angle2_e = 360;
NVMCClient.trans_e = SglMat4.identity();

NVMCClient.foot1_e = 0;
NVMCClient.foot2_e = 0;
NVMCClient.rot1_e = SglMat4.identity();
NVMCClient.rot2_e = SglMat4.identity();
NVMCClient.rot3_e = SglMat4.identity();
NVMCClient.bdtrans_e = SglMat4.identity();

var id = SglMat4.identity();
NVMCClient.t_base1 = SglMat4.mul(SglMat4.mul(id, SglMat4.mul(SglMat4.translation([0,0.4,0]), SglMat4.scaling([0.8,0.8,0.75])))
                      , SglMat4.rotationAngleAxis(sglDegToRad(180), [0,1,0]));
                      
NVMCClient.t_base1_e = SglMat4.mul(SglMat4.mul(id, SglMat4.mul(SglMat4.translation([0,0.4,5]), SglMat4.scaling([0.8,0.8,0.75])))
                      , SglMat4.rotationAngleAxis(sglDegToRad(180), [0,1,0]));

var game_won = false;  
var one_more_iteration = false;                    
NVMCClient.drawCharacter2 = function (gl, mainShader) {
	var stack = this.stack;
  
  var tempbase1 = [].concat(this.t_base1);
  var tempangle = this.angle;
  
  var game = this.game;
  
  if(game_won) {
    if(one_more_iteration) {
      one_more_iteration = false;
    } else {
      game.change = false;
    }
  }
  
  if(game.change) {
    if(game.direction == 0) {
      this.angle = 5;
      if(this.angle > 360) this.angle -= 360;
    }
    if(game.direction == 1) {
      this.angle = -5;
      if(this.angle < 0) this.angle += 360;
    }
  } else {
    this.angle = 0;
  }
  
  
  
  this.t_base1 = SglMat4.mul(this.t_base1, SglMat4.rotationAngleAxis(sglDegToRad(this.angle), [0,1,0]));
  
  if(game.change) {
    if(game.direction != 3) {
      this.t_base1 = SglMat4.mul(this.t_base1, SglMat4.translation([0,0,-0.1]));
    } else {
      this.t_base1 = SglMat4.mul(this.t_base1, SglMat4.translation([0,0,0.1]));
      
    }

  }
  
  if(game.change2) { 
    if(game.camdir == 0) {
      this.camrot = SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-5), [0,1,0]), this.camrot);
      this.angle2 -= 5;
    } else if(game.camdir == 1) {
      this.camrot = SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(5), [0,1,0]), this.camrot);
      this.angle2 += 5;
    } else if(game.camdir == 2) {
      var trans = SglMat4.translation([-0.1*Math.sin(sglDegToRad(this.angle2)),0,0.1*Math.cos(sglDegToRad(this.angle2))]);
      this.cam = SglMat4.mul(this.cam, trans);
    } else if(game.camdir == 3) {
      var trans = SglMat4.translation([0.1*Math.sin(sglDegToRad(this.angle2)),0,-0.1*Math.cos(sglDegToRad(this.angle2))]);
      this.cam = SglMat4.mul(this.cam, trans);
    }
  }
  

  if(game.change) {
    var angle = this.foot1 % 60;
    if(angle > 30) angle = 60 - angle;
    
    this.rot1 = SglMat4.rotationAngleAxis(sglDegToRad(-angle), [1,0,0]);
    
    var angle2 = (this.foot1 + 30) % 60;
    if(angle2 > 30) angle2 = 60 - angle2;
    
    this.rot2 = SglMat4.rotationAngleAxis(sglDegToRad(-angle2), [1,0,0]);
    
    var angle3 = (this.foot1 + 15) % 30;
    this.bdtrans = SglMat4.translation([0, 0.3*Math.sin(angle3/30.0*3.1416), 0]);
    
    this.rot3 = SglMat4.rotationAngleAxis(sglDegToRad(-(angle2-15)*2.0), [0,0,1]);
    
    this.foot1 ++;
    this.foot1 = this.foot1 % 60;
  }
  
  //collision detection
  var builds = [[[-17.5, 15.9, 0], [-18.7, 0.39, 0], [-9.36, -1.38, 0], [-7.72, 14.84, 0]], [[9.21, -4.06, 0], [10.3, 11.55, 0], [20.69, 11.68, 0], [19.1, -4.87, 0]]];
  var pos2 = SglMat4.mul4(this.t_base1, [0, 0, 0, 1]);
  var pos3 = [pos2[0], pos2[2], 0];
  //game.restrict = -1; 
  if(game.change) {
    //console.log("pos: " + pos3);
    for (var i in builds) {
      var build = builds[i];
      //triangle 0, 1, 2
      var a1 = SglVec3.cross(SglVec3.sub(build[1], build[0]), SglVec3.sub(build[2], build[1]));
      var alpha1 = SglVec3.cross(SglVec3.sub(build[1],pos3), SglVec3.sub(build[2] , pos3));
      var beta1 = SglVec3.cross(SglVec3.sub(build[2], pos3), SglVec3.sub(build[0] , pos3));
      var gamma1 = SglVec3.cross(SglVec3.sub(build[0] , pos3), SglVec3.sub(build[1] , pos3));
      
      var a = SglVec3.length(a1);
      var alpha = SglVec3.length(alpha1);
      var beta = SglVec3.length(beta1);
      var gamma = SglVec3.length(gamma1);
      
      //triangle 1, 3, 4
      var a12 = SglVec3.cross(SglVec3.sub(build[2], build[0]), SglVec3.sub(build[3], build[2]));
      var alpha12 = SglVec3.cross(SglVec3.sub(build[2],pos3), SglVec3.sub(build[3] , pos3));
      var beta12 = SglVec3.cross(SglVec3.sub(build[3], pos3), SglVec3.sub(build[0] , pos3));
      var gamma12 = SglVec3.cross(SglVec3.sub(build[0] , pos3), SglVec3.sub(build[2] , pos3));
      
      var a2 = SglVec3.length(a12);
      var alpha2 = SglVec3.length(alpha12);
      var beta2 = SglVec3.length(beta12);
      var gamma2 = SglVec3.length(gamma12);
  
      if((alpha + beta + gamma <= a /*&& alpha + beta + gamma < this.prevabg*/) 
        || (alpha2 + beta2+ gamma2 <= a2 /*&&  alpha2 + beta2 + gamma2 < this.prevabg2*/)) {
         this.t_base1 = [].concat(tempbase1);
         this.angle = tempangle;
      } 
      //this.prevabg = alpha + beta + gamma;
      //this.prevabg2 = alpha2 + beta2+ gamma2;
    }
  }
  
  //enemy detection
  var pos2e = SglMat4.mul4(this.t_base1_e, [0, 0, 0, 1]);
  var pos3e = [pos2e[0], pos2e[2], 0];
  if(!game_won && SglVec3.length(SglVec3.sub(pos3e, pos3)) < 1.3) {
    NVMC.log("[Game Finished]\n");
    NVMC.log("[Refresh page to restart]\n");
    alert("Enemy caught!");
    game_won = true;
    one_more_iteration = true;
  }
  
  var t_base1 = this.t_base1;
  t_base1 = SglMat4.mul(t_base1, this.bdtrans);
  //tempPos = SglMat4.mul4(t_base1, [this.cameras[0].position[0], this.cameras[0].position[1], this.cameras[0].position[2], 1]);
  //this.cameras[0].position = [tempPos[0], tempPos[1], tempPos[2]];
  //console.log(this.cameras[0]);
  
  
  /*if(game.change) {
    var step = SglMat4.mul(SglMat4.translation([0, 0, 1]), SglMat4.rotationAngleAxis(sglDegToRad(this.angle), [0,1,0]));
    this.trans = SglMat4.mul(this.trans, step);
    t_base1 = SglMat4.mul(t_base1, this.trans);
  }*/

  //all the tranformation hierarchy is done here
  var t_base1_sphere = SglMat4.mul(t_base1, SglMat4.scaling([1,0.5,1]));
  var t_base1_octa = SglMat4.mul(t_base1, SglMat4.mul(SglMat4.translation([0,-0.2,-0.85]), SglMat4.scaling([0.4,0.4,0.2])));
  var t_base1_cylinder = SglMat4.mul(t_base1, SglMat4.mul(SglMat4.translation([0,0.1,0]), SglMat4.scaling([1,0.2,1])));
  
  var t_base1_tail = SglMat4.mul(t_base1, this.rot3);
  
  var t_base1_sphere2 = SglMat4.mul(t_base1_tail, SglMat4.mul(SglMat4.translation([0,0.2,1]), SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(35), [1,0,0]), SglMat4.scaling([0.5,0.5,0.45]))));
  var t_base1_sphere2_cylinder = SglMat4.mul(t_base1_sphere2, SglMat4.scaling([1,0.6,1]));
  var t_base1_sphere2_cylinder2 = SglMat4.mul(t_base1_sphere2_cylinder, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.3,1.6,1.3])));
  var t_base1_sphere2_cylinder2_sphere = SglMat4.mul(t_base1_sphere2_cylinder2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1,1,1])));
  
  var t_base1_cylinder2 = SglMat4.mul(t_base1_cylinder, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.95,1,0.95])));
  var t_base1_cylinder2_sphere = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([-0.1,1.8,-0.81]), SglMat4.scaling([0.16,0.9,0.12])));
  var t_base1_cylinder2_sphere2 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0.1,1.8,-0.81]), SglMat4.scaling([0.16,0.9,0.12])));
  var t_base1_cylinder2_octa = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0,2,-0.88]), SglMat4.mul(SglMat4.scaling([0.09,0.45,0.05]), SglMat4.rotationAngleAxis(sglDegToRad(30), [1,0,0]))));
  var t_base1_cylinder2_cylinder1 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([-0.8,1,0]), SglMat4.mul(SglMat4.scaling([0.15,0.7,0.12]), SglMat4.rotationAngleAxis(sglDegToRad(100), [0,0,1]))));
  var t_base1_cylinder2_cylinder1_sphere = SglMat4.mul(t_base1_cylinder2_cylinder1, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.7,0.5,0.7])));
  var t_base1_cylinder2_cylinder2 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0.8,1,0]), SglMat4.mul(SglMat4.scaling([0.15,0.7,0.12]), SglMat4.rotationAngleAxis(sglDegToRad(-100), [0,0,1]))));
  var t_base1_cylinder2_cylinder2_sphere = SglMat4.mul(t_base1_cylinder2_cylinder2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.7,0.5,0.7])));
  
  var t_base1_cylinder3 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.86,1,0.86])));
  var t_base1_cylinder3_sphere = SglMat4.mul(t_base1_cylinder3, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.9,2.2,0.9])));
  var t_base1_cylinder3_sphere_cone1 = SglMat4.mul(t_base1_cylinder3_sphere, SglMat4.mul(SglMat4.translation([0,1.2,0]), SglMat4.scaling([0.95,1,0.2])));
  var t_base1_cylinder3_sphere_torus1 = SglMat4.mul(t_base1_cylinder3_sphere, SglMat4.mul(SglMat4.translation([0,0.8,0]),  SglMat4.scaling([0.95,5,0.95])));
  
  var t_base1_cylinder3_sphere2 = SglMat4.mul(t_base1_cylinder3, SglMat4.mul(SglMat4.translation([-0.4,1,-0.8]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(2), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-3), [0,0,1])), SglMat4.scaling([0.12,0.8,0.12]))));
  var t_base1_cylinder3_sphere3 = SglMat4.mul(t_base1_cylinder3, SglMat4.mul(SglMat4.translation([0.4,1,-0.8]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(2), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(3), [0,0,1])), SglMat4.scaling([0.12,0.8,0.12]))));

  var t_base1_1 = SglMat4.mul(t_base1, this.rot1);
  
  var t_base1_foot1 = SglMat4.mul(t_base1_1, SglMat4.mul(SglMat4.translation([0.7,-0.25,-0.3]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-20), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot2 = SglMat4.mul(t_base1_1, SglMat4.mul(SglMat4.translation([0.6,-0.25,-0.4]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-18), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot3 = SglMat4.mul(t_base1_1, SglMat4.mul(SglMat4.translation([0.5,-0.25,-0.42]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-16), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));

  var t_base1_foot1_sphere = SglMat4.mul(t_base1_foot1, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot2_sphere = SglMat4.mul(t_base1_foot2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot3_sphere = SglMat4.mul(t_base1_foot3, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  
  var t_base1_1r = SglMat4.mul(t_base1, this.rot2);
  
  var t_base1_foot1r = SglMat4.mul(t_base1_1r, SglMat4.mul(SglMat4.translation([-0.7,-0.25,-0.3]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(20), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot2r = SglMat4.mul(t_base1_1r, SglMat4.mul(SglMat4.translation([-0.6,-0.25,-0.4]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(18), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot3r = SglMat4.mul(t_base1_1r, SglMat4.mul(SglMat4.translation([-0.5,-0.25,-0.42]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(16), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));

  var t_base1_foot1r_sphere = SglMat4.mul(t_base1_foot1r, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot2r_sphere = SglMat4.mul(t_base1_foot2r, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot3r_sphere = SglMat4.mul(t_base1_foot3r, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));

  gl.uniformMatrix4fv(mainShader.uProjectionMatrixLocation, false, this.projectionMatrix);
  gl.uniform4fv(mainShader.uLightDirectionLocation, this.sunLightDirectionViewSpace);
  gl.uniform3fv(mainShader.uLightColorLocation, [1.0, 1.0, 1.0]);
  
  stack.push();
  stack.multiply(t_base1_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2_cylinder);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2_cylinder, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2_cylinder2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2_cylinder2, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2_cylinder2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2_cylinder2_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_sphere, mainShader, [0.6, 0.6, 0.6, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_sphere2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_sphere2, mainShader, [0.6, 0.6, 0.6, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_octa);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_octa, mainShader, [0.6, 0.6, 0.6, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder1, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder1_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder1_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder2, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder2_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere_cone1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere_cone1, mainShader, [0.8, 0.7, 0.2, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere_torus1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere_torus1, mainShader, [0.8, 0.7, 0.2, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere2, mainShader, [0.3, 0.7, 0.9, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere3);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere3, mainShader, [0.3, 0.7, 0.9, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1r);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1r, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2r);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2r, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3r);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3r, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1r_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1r_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2r_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2r_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3r_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3r_sphere, mainShader, [0.8, 0.8, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
	/*stack.push();
	var M_1_sca = SglMat4.scaling([0.25, 0.4, 0.25]);
	stack.multiply(M_1_sca);

	gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
	this.drawObject(gl, this.base1_cylinder, mainShader, [0.6, 0.23, 0.12, 1.0], [0, 0, 0, 1]);
	stack.pop();*/
};

var randnum = Math.random() * 12;
var count = 0;
var direction = 2;
NVMCClient.drawCharacter3 = function (gl, mainShader) {
	var stack = this.stack;
  
  count ++;
  
  
  //0, 1->l,r
  //2, 3->f,b

  
  
  
  if(direction != 3) {
    if(direction != 1)
      direction = 0;
    if(randnum > 2 && direction != 0)
      direction = 1;
    if(randnum > 4)
      direction = 2;
  }
  
  
  if(count > 10 && direction != 3) {
    count = 0;
    randnum = Math.random() * 9.0;
    //console.log(randnum);
    //console.log(direction);
  }
  
  if(count > 30 && direction == 3) {
    count = 0;
    randnum = Math.random() * 12.0;
    direction = 0;
    if(randnum > 2)
      direction = 1;
    if(randnum > 4)
      direction = 2;
  }
  
  
  var tempbase1 = [].concat(this.t_base1_e);
  var tempangle = this.angle_e;
  
  var game = this.game;
  if(!game_won) {
    if(direction == 0) {
      this.angle_e = 5;
      if(this.angle_e > 360) this.angle_e -= 360;
    }
    else if(direction == 1) {
      this.angle_e = -5;
      if(this.angle_e < 0) this.angle_e += 360;
    } else {
      this.angle_e = 0;
    }
  } else {
    this.angle_e = 0;
  }
  
  
  
  this.t_base1_e = SglMat4.mul(this.t_base1_e, SglMat4.rotationAngleAxis(sglDegToRad(this.angle_e), [0,1,0]));
  
  if(!game_won) {
    if(direction != 3) {
      this.t_base1_e = SglMat4.mul(this.t_base1_e, SglMat4.translation([0,0,-0.2]));
    } else {
      this.t_base1_e = SglMat4.mul(this.t_base1_e, SglMat4.translation([0,0,0.2]));
      
    }

  }
  

  if(!game_won) {
    var angle = this.foot1_e % 60;
    if(angle > 30) angle = 60 - angle;
    
    this.rot1_e = SglMat4.rotationAngleAxis(sglDegToRad(-angle), [1,0,0]);
    
    var angle2 = (this.foot1_e + 30) % 60;
    if(angle2 > 30) angle2 = 60 - angle2;
    
    this.rot2_e = SglMat4.rotationAngleAxis(sglDegToRad(-angle2), [1,0,0]);
    
    var angle3 = (this.foot1_e + 15) % 30;
    this.bdtrans_e = SglMat4.translation([0, 0.3*Math.sin(angle3/30.0*3.1416), 0]);
    
    this.rot3_e = SglMat4.rotationAngleAxis(sglDegToRad(-(angle2-15)*2.0), [0,0,1]);
    
    this.foot1_e += 2;
    this.foot1_e = this.foot1_e % 60;
  }
  
  //collision detection
  var builds = [[[-17.5, 15.9, 0], [-18.7, 0.39, 0], [-9.36, -1.38, 0], [-7.72, 14.84, 0]], [[9.21, -4.06, 0], [10.3, 11.55, 0], [20.69, 11.68, 0], [19.1, -4.87, 0]]];
  var pos2 = SglMat4.mul4(this.t_base1_e, [0, 0, 0, 1]);
  var pos3 = [pos2[0], pos2[2], 0];
  //game.restrict = -1; 
  if(true) {
    //console.log("pos: " + pos3);
    for (var i in builds) {
      var build = builds[i];
      //triangle 0, 1, 2
      var a1 = SglVec3.cross(SglVec3.sub(build[1], build[0]), SglVec3.sub(build[2], build[1]));
      var alpha1 = SglVec3.cross(SglVec3.sub(build[1],pos3), SglVec3.sub(build[2] , pos3));
      var beta1 = SglVec3.cross(SglVec3.sub(build[2], pos3), SglVec3.sub(build[0] , pos3));
      var gamma1 = SglVec3.cross(SglVec3.sub(build[0] , pos3), SglVec3.sub(build[1] , pos3));
      
      var a = SglVec3.length(a1);
      var alpha = SglVec3.length(alpha1);
      var beta = SglVec3.length(beta1);
      var gamma = SglVec3.length(gamma1);
      
      //triangle 1, 3, 4
      var a12 = SglVec3.cross(SglVec3.sub(build[2], build[0]), SglVec3.sub(build[3], build[2]));
      var alpha12 = SglVec3.cross(SglVec3.sub(build[2],pos3), SglVec3.sub(build[3] , pos3));
      var beta12 = SglVec3.cross(SglVec3.sub(build[3], pos3), SglVec3.sub(build[0] , pos3));
      var gamma12 = SglVec3.cross(SglVec3.sub(build[0] , pos3), SglVec3.sub(build[2] , pos3));
      
      var a2 = SglVec3.length(a12);
      var alpha2 = SglVec3.length(alpha12);
      var beta2 = SglVec3.length(beta12);
      var gamma2 = SglVec3.length(gamma12);
  
      if((alpha + beta + gamma <= a /*&& alpha + beta + gamma < this.prevabg*/) 
        || (alpha2 + beta2+ gamma2 <= a2 /*&&  alpha2 + beta2 + gamma2 < this.prevabg2*/)) {
         this.t_base1_e = [].concat(tempbase1);
         this.angle_e = tempangle;
         direction = 3;
         count = 0;
      } 
      //this.prevabg = alpha + beta + gamma;
      //this.prevabg2 = alpha2 + beta2+ gamma2;
    }
  }
  
  var t_base1 = this.t_base1_e;
  t_base1 = SglMat4.mul(t_base1, this.bdtrans_e);
  //tempPos = SglMat4.mul4(t_base1, [this.cameras[0].position[0], this.cameras[0].position[1], this.cameras[0].position[2], 1]);
  //this.cameras[0].position = [tempPos[0], tempPos[1], tempPos[2]];
  //console.log(this.cameras[0]);
  
  
  /*if(game.change) {
    var step = SglMat4.mul(SglMat4.translation([0, 0, 1]), SglMat4.rotationAngleAxis(sglDegToRad(this.angle), [0,1,0]));
    this.trans = SglMat4.mul(this.trans, step);
    t_base1 = SglMat4.mul(t_base1, this.trans);
  }*/

  //all the tranformation hierarchy is done here
  var t_base1_sphere = SglMat4.mul(t_base1, SglMat4.scaling([1,0.5,1]));
  var t_base1_octa = SglMat4.mul(t_base1, SglMat4.mul(SglMat4.translation([0,-0.2,-0.85]), SglMat4.scaling([0.4,0.4,0.2])));
  var t_base1_cylinder = SglMat4.mul(t_base1, SglMat4.mul(SglMat4.translation([0,0.1,0]), SglMat4.scaling([1,0.2,1])));
  
  var t_base1_tail = SglMat4.mul(t_base1, this.rot3_e);
  
  var t_base1_sphere2 = SglMat4.mul(t_base1_tail, SglMat4.mul(SglMat4.translation([0,0.2,1]), SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(35), [1,0,0]), SglMat4.scaling([0.5,0.5,0.45]))));
  var t_base1_sphere2_cylinder = SglMat4.mul(t_base1_sphere2, SglMat4.scaling([1,0.6,1]));
  var t_base1_sphere2_cylinder2 = SglMat4.mul(t_base1_sphere2_cylinder, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.3,1.6,1.3])));
  var t_base1_sphere2_cylinder2_sphere = SglMat4.mul(t_base1_sphere2_cylinder2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1,1,1])));
  
  var t_base1_cylinder2 = SglMat4.mul(t_base1_cylinder, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.95,1,0.95])));
  var t_base1_cylinder2_sphere = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([-0.1,1.8,-0.81]), SglMat4.scaling([0.16,0.9,0.12])));
  var t_base1_cylinder2_sphere2 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0.1,1.8,-0.81]), SglMat4.scaling([0.16,0.9,0.12])));
  var t_base1_cylinder2_octa = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0,2,-0.88]), SglMat4.mul(SglMat4.scaling([0.09,0.45,0.05]), SglMat4.rotationAngleAxis(sglDegToRad(30), [1,0,0]))));
  var t_base1_cylinder2_cylinder1 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([-0.8,1,0]), SglMat4.mul(SglMat4.scaling([0.15,0.7,0.12]), SglMat4.rotationAngleAxis(sglDegToRad(100), [0,0,1]))));
  var t_base1_cylinder2_cylinder1_sphere = SglMat4.mul(t_base1_cylinder2_cylinder1, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.7,0.5,0.7])));
  var t_base1_cylinder2_cylinder2 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0.8,1,0]), SglMat4.mul(SglMat4.scaling([0.15,0.7,0.12]), SglMat4.rotationAngleAxis(sglDegToRad(-100), [0,0,1]))));
  var t_base1_cylinder2_cylinder2_sphere = SglMat4.mul(t_base1_cylinder2_cylinder2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.7,0.5,0.7])));
  
  var t_base1_cylinder3 = SglMat4.mul(t_base1_cylinder2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.86,1,0.86])));
  var t_base1_cylinder3_sphere = SglMat4.mul(t_base1_cylinder3, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([0.9,2.2,0.9])));
  var t_base1_cylinder3_sphere_cone1 = SglMat4.mul(t_base1_cylinder3_sphere, SglMat4.mul(SglMat4.translation([0,1.2,0]), SglMat4.scaling([0.95,1,0.2])));
  var t_base1_cylinder3_sphere_torus1 = SglMat4.mul(t_base1_cylinder3_sphere, SglMat4.mul(SglMat4.translation([0,0.8,0]),  SglMat4.scaling([0.95,5,0.95])));
  
  var t_base1_cylinder3_sphere2 = SglMat4.mul(t_base1_cylinder3, SglMat4.mul(SglMat4.translation([-0.4,1,-0.8]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(2), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-3), [0,0,1])), SglMat4.scaling([0.12,0.8,0.12]))));
  var t_base1_cylinder3_sphere3 = SglMat4.mul(t_base1_cylinder3, SglMat4.mul(SglMat4.translation([0.4,1,-0.8]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(2), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(3), [0,0,1])), SglMat4.scaling([0.12,0.8,0.12]))));

  var t_base1_1 = SglMat4.mul(t_base1, this.rot1_e);
  
  var t_base1_foot1 = SglMat4.mul(t_base1_1, SglMat4.mul(SglMat4.translation([0.7,-0.25,-0.3]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-20), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot2 = SglMat4.mul(t_base1_1, SglMat4.mul(SglMat4.translation([0.6,-0.25,-0.4]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-18), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot3 = SglMat4.mul(t_base1_1, SglMat4.mul(SglMat4.translation([0.5,-0.25,-0.42]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(-16), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));

  var t_base1_foot1_sphere = SglMat4.mul(t_base1_foot1, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot2_sphere = SglMat4.mul(t_base1_foot2, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot3_sphere = SglMat4.mul(t_base1_foot3, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  
  var t_base1_1r = SglMat4.mul(t_base1, this.rot2_e);
  
  var t_base1_foot1r = SglMat4.mul(t_base1_1r, SglMat4.mul(SglMat4.translation([-0.7,-0.25,-0.3]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(20), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot2r = SglMat4.mul(t_base1_1r, SglMat4.mul(SglMat4.translation([-0.6,-0.25,-0.4]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(18), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));
  var t_base1_foot3r = SglMat4.mul(t_base1_1r, SglMat4.mul(SglMat4.translation([-0.5,-0.25,-0.42]), SglMat4.mul(SglMat4.mul(SglMat4.rotationAngleAxis(sglDegToRad(-90), [1,0,0]), SglMat4.rotationAngleAxis(sglDegToRad(16), [0,0,1])), SglMat4.scaling([0.08,0.3,0.08]))));

  var t_base1_foot1r_sphere = SglMat4.mul(t_base1_foot1r, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot2r_sphere = SglMat4.mul(t_base1_foot2r, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));
  var t_base1_foot3r_sphere = SglMat4.mul(t_base1_foot3r, SglMat4.mul(SglMat4.translation([0,2,0]), SglMat4.scaling([1.2,0.08/0.3,1.2])));

  gl.uniformMatrix4fv(mainShader.uProjectionMatrixLocation, false, this.projectionMatrix);
  gl.uniform4fv(mainShader.uLightDirectionLocation, this.sunLightDirectionViewSpace);
  gl.uniform3fv(mainShader.uLightColorLocation, [1.0, 1.0, 1.0]);
  
  stack.push();
  stack.multiply(t_base1_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2_cylinder);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2_cylinder, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2_cylinder2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2_cylinder2, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_sphere2_cylinder2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_sphere2_cylinder2_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_sphere, mainShader, [0.9, 0.9, 0.9, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_sphere2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_sphere2, mainShader, [0.9, 0.9, 0.9, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_octa);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_octa, mainShader, [0.9, 0.9, 0.9, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder1, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder1_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder1_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder2, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder2_cylinder2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder2_cylinder2_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere_cone1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere_cone1, mainShader, [0.8, 0.7, 0.2, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere_torus1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere_torus1, mainShader, [0.8, 0.7, 0.2, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere2, mainShader, [0.6, 0.1, 0.1, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_cylinder3_sphere3);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_cylinder3_sphere3, mainShader, [0.6, 0.1, 0.1, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1r);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1r, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2r);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2r, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3r);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3r, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot1r_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot1r_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot2r_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot2r_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
  stack.push();
  stack.multiply(t_base1_foot3r_sphere);
  gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
  this.drawObject(gl, this.base1_foot3r_sphere, mainShader, [1, 0.7, 0.8, 1.0], [0, 0, 0, 1]);
  stack.pop();
  
	/*stack.push();
	var M_1_sca = SglMat4.scaling([0.25, 0.4, 0.25]);
	stack.multiply(M_1_sca);

	gl.uniformMatrix4fv(mainShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniformMatrix3fv(mainShader.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(this.stack.matrix));
	this.drawObject(gl, this.base1_cylinder, mainShader, [0.6, 0.23, 0.12, 1.0], [0, 0, 0, 1]);
	stack.pop();*/
};

NVMCClient.drawCharacter = function (gl) {
  //this.drawObject(gl, this.cylinder,  this.lambertianSingleColorShader ,[0.6,0.23,0.12,1.0],[0,0,0,1]);
  gl.useProgram(this.lambertianSingleColorShader2);
  this.drawCharacter2(gl, this.lambertianSingleColorShader2);
  this.drawCharacter3(gl, this.lambertianSingleColorShader2);
}

NVMCClient.onInitialize = function () {
	var gl = this.ui.gl;
	this.cameras[2].width = this.ui.width;
	this.cameras[2].height = this.ui.height;

	/*************************************************************/
	NVMC.log("SpiderGL Version : " + SGL_VERSION_STRING + "\n");
	/*************************************************************/

	/*************************************************************/
	this.game.player.color = [1.0, 0.0, 0.0, 1.0];
	/*************************************************************/

	/*************************************************************/
	this.initMotionKeyHandlers();

	this.stack = new SglMatrixStack();
	this.projection_matrix = SglMat4.identity();

	this.initializeObjects(gl);
	this.initializeCameras();
	this.uniformShader = new uniformShader(gl);
	this.perVertexColorShader = new perVertexColorShader(gl);
	this.lambertianSingleColorShader = new lambertianSingleColorShader(gl);
	this.lambertianShader = new lambertianShader(gl);
	this.phongShader = new phongShader(gl);
	this.textureShader = new textureShader(gl);
  
  this.lambertianSingleColorShader2 = new lambertianSingleColorShader2(gl);


	this.texture_street = this.createTexture(gl, 				NVMC.resource_path+'textures/street4.png');//line 398, Listing 7.2{
	this.texture_ground = this.createTexture(gl, 				NVMC.resource_path+'textures/grass_tile_003_col.png');//line 300}
	NVMCClient.texture_facade.push(this.createTexture(gl,       NVMC.resource_path+'textures/facade1.jpg'));
	NVMCClient.texture_facade.push(this.createTexture(gl,       NVMC.resource_path+'textures/facade2.jpg'));
	NVMCClient.texture_facade.push(this.createTexture(gl,       NVMC.resource_path+'textures/facade3.jpg'));
	NVMCClient.texture_roof = this.createTexture(gl,			NVMC.resource_path+'textures/concreteplane2k.jpg');


	//this.loadCarModel(gl,NVMC.resource_path+"geometry/cars/eclipse/eclipse-white.obj");
	this.createCarTechnique(gl, this.lambertianShader);
};

/***********************************************************************/
