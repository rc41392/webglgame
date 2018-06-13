///// SPHERE1

function Sphere1 (resolution) {

	this.name = "sphere1";

	// vertices definition
	////////////////////////////////////////////////////////////
	
	this.vertices = new Float32Array(3*(resolution * (resolution+1)));
	
	var radius = 1.0;
	var angle, angle2;
	var step = 6.283185307179586476925286766559 / resolution;
	
	// lower circle
  // i, j = i * resolution + j
	var vertexoffset = 0;
	for (var i = 0; i <= resolution; i++) {
	
		angle2 = step * i / 2;
		for (var j = 0; j < resolution; j++) {
      angle = step * j;
      this.vertices[vertexoffset] = radius * Math.sin(angle2) * Math.cos(angle);
      this.vertices[vertexoffset+1] = radius * Math.cos(angle2);
      this.vertices[vertexoffset+2] = radius * Math.sin(angle2) * Math.sin(angle);
      vertexoffset += 3;
    }
	}
  
	
	
	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array(3*2*resolution*(resolution+1));
  
  var triangleoffset = 0;
  
  // i, j = i * resolution + j
  for (var i = 0; i <= resolution; i++) {
		for (var j = 0; j < resolution; j++) {

      this.triangleIndices[triangleoffset] = (i % (resolution+1)) * resolution + (j % resolution);
      this.triangleIndices[triangleoffset+1] = (i % (resolution+1)) * resolution + ((j+1) % resolution);
      this.triangleIndices[triangleoffset+2] = ((i+1) % (resolution+1)) * resolution + (j % resolution);
      triangleoffset += 3;
      
      this.triangleIndices[triangleoffset] = (i % (resolution+1)) * resolution + ((j+1) % resolution);
      this.triangleIndices[triangleoffset+1] = ((i+1) % (resolution+1)) * resolution + (j % resolution);
      this.triangleIndices[triangleoffset+2] = ((i+1) % (resolution+1)) * resolution + ((j+1) % resolution);
      triangleoffset += 3;
    }
	}
		
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
}
