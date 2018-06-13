///// Torus

function Torus (resolution, ratio) {

	this.name = "torus";
  if(ratio > 1) ratio = 1;
  if(ratio < 0) ratio = 0;

	// vertices definition
	////////////////////////////////////////////////////////////
	
	this.vertices = new Float32Array(3*(resolution * (resolution)));
	
	var radius = 1.0, radius2 = 1-ratio;
	var angle, angle2;
	var step = 6.283185307179586476925286766559 / resolution;
	
	// lower circle
  // i, j = i * resolution + j
	var vertexoffset = 0;
	for (var i = 0; i < resolution; i++) {
	
		angle2 = step * i;
    var centerx = radius * Math.cos(angle2);
    var centery = 0;
    var centerz = radius * Math.sin(angle2);
		for (var j = 0; j < resolution; j++) {
      angle = step * j;
      var rotation_matrix = [Math.cos(angle2), 0, Math.sin(angle2), 0, 1, 0, -Math.sin(angle2), 0, Math.cos(angle2)];
      var vt = [radius2 * Math.cos(angle), radius2 * Math.sin(angle), 0];
      var vt2 = SpiderGL.Math.Mat3.mul3(rotation_matrix, vt);
      
      this.vertices[vertexoffset] = centerx + vt2[0];
      this.vertices[vertexoffset+1] = centery + vt2[1];
      this.vertices[vertexoffset+2] = centerz + vt2[2];
      vertexoffset += 3;
    }
	}
  
	
	
	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array(3*2*resolution*(resolution));
  
  var triangleoffset = 0;
  
  // i, j = i * resolution + j
  for (var i = 0; i < resolution; i++) {
		for (var j = 0; j < resolution; j++) {

      this.triangleIndices[triangleoffset] = (i % (resolution)) * resolution + (j % resolution);
      this.triangleIndices[triangleoffset+1] = (i % (resolution)) * resolution + ((j+1) % resolution);
      this.triangleIndices[triangleoffset+2] = ((i+1) % (resolution)) * resolution + ((j+1)% resolution);
      triangleoffset += 3;
      
      this.triangleIndices[triangleoffset] = (i % (resolution)) * resolution + (j % resolution);
      this.triangleIndices[triangleoffset+1] = ((i+1) % (resolution)) * resolution + ((j+1) % resolution);
      this.triangleIndices[triangleoffset+2] = ((i+1) % (resolution)) * resolution + (j % resolution);
      triangleoffset += 3;
    }
	}
		
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
}
