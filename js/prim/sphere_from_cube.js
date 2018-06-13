///// SPHERE2

function Sphere2 (resolution) {

	this.name = "sphere2";

	// vertices definition
	////////////////////////////////////////////////////////////
	var radius = 1.0;
	this.vertices = new Float32Array(18*(resolution+1) * (resolution+1));
		
  /********************
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0
	*********************/
  
  // i, j = i * resolution + j
	var vertexoffset = 0;
	for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j <= resolution; j++) {
      var vt = [-1.0 + j / resolution * 2, -1.0 + i / resolution * 2, 1.0];
      var length = SpiderGL.Math.Vec3.length(vt);
      var vt2 = SpiderGL.Math.Vec3.muls(vt, radius/length);
      this.vertices[vertexoffset] = vt2[0];
      this.vertices[vertexoffset+1] = vt2[1];
      this.vertices[vertexoffset+2] = vt2[2];
      vertexoffset += 3;
    }
	}
  for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j <= resolution; j++) {
      var vt = [-1.0 + j / resolution * 2, -1.0 + i / resolution * 2, -1.0];
      var length = SpiderGL.Math.Vec3.length(vt);
      var vt2 = SpiderGL.Math.Vec3.muls(vt, radius/length);
      this.vertices[vertexoffset] = vt2[0];
      this.vertices[vertexoffset+1] = vt2[1];
      this.vertices[vertexoffset+2] = vt2[2];
      vertexoffset += 3;
    }
	}
  for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j <= resolution; j++) {
      var vt = [-1.0 + i / resolution * 2,1.0, -1.0 + j / resolution * 2];
      var length = SpiderGL.Math.Vec3.length(vt);
      var vt2 = SpiderGL.Math.Vec3.muls(vt, radius/length);
      this.vertices[vertexoffset] = vt2[0];
      this.vertices[vertexoffset+1] = vt2[1];
      this.vertices[vertexoffset+2] = vt2[2];
      vertexoffset += 3;
    }
	}
  for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j <= resolution; j++) {
      var vt = [-1.0 + i / resolution * 2,-1.0, -1.0 + j / resolution * 2];
      var length = SpiderGL.Math.Vec3.length(vt);
      var vt2 = SpiderGL.Math.Vec3.muls(vt, radius/length);
      this.vertices[vertexoffset] = vt2[0];
      this.vertices[vertexoffset+1] = vt2[1];
      this.vertices[vertexoffset+2] = vt2[2];
      vertexoffset += 3;
    }
	}
  for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j <= resolution; j++) {
      var vt = [1.0,-1.0 + j / resolution * 2, -1.0 + i / resolution * 2];
      var length = SpiderGL.Math.Vec3.length(vt);
      var vt2 = SpiderGL.Math.Vec3.muls(vt, radius/length);
      this.vertices[vertexoffset] = vt2[0];
      this.vertices[vertexoffset+1] = vt2[1];
      this.vertices[vertexoffset+2] = vt2[2];
      vertexoffset += 3;
    }
	}
  for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j <= resolution; j++) {
      var vt = [-1.0,-1.0 + j / resolution * 2, -1.0 + i / resolution * 2];
      var length = SpiderGL.Math.Vec3.length(vt);
      var vt2 = SpiderGL.Math.Vec3.muls(vt, radius/length);
      this.vertices[vertexoffset] = vt2[0];
      this.vertices[vertexoffset+1] = vt2[1];
      this.vertices[vertexoffset+2] = vt2[2];
      vertexoffset += 3;
    }
	}
  
	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array(36*resolution*resolution);
  
  var triangleoffset = 0;
  for(var f = 0; f < 6; f ++) {
    for (var i = 0; i < resolution; i++) {
      for (var j = 0; j < resolution; j++) {
        this.triangleIndices[triangleoffset] = f*(resolution + 1)*(resolution + 1) + i*(resolution + 1) + (j + 1);
        this.triangleIndices[triangleoffset+1] = f*(resolution + 1)*(resolution + 1) + i*(resolution + 1) + (j);
        this.triangleIndices[triangleoffset+2] = f*(resolution + 1)*(resolution + 1) + (i + 1)*(resolution + 1) + (j);
        triangleoffset += 3;
        this.triangleIndices[triangleoffset] = f*(resolution + 1)*(resolution + 1) + (i + 1)*(resolution + 1) + (j);
        this.triangleIndices[triangleoffset+1] = f*(resolution + 1)*(resolution + 1) + (i + 1)*(resolution + 1) + (j + 1);
        this.triangleIndices[triangleoffset+2] = f*(resolution + 1)*(resolution + 1) + i*(resolution + 1) + (j + 1);
        triangleoffset += 3;
      }
    }
  }
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
}
