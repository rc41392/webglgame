///// OCTAHEDRON

function Octahedron () {

	this.name = "octahedron";

	// vertices definition
	////////////////////////////////////////////////////////////
	
	this.vertices = new Float32Array(18);
  
  this.vertices[0] = 0.0;
  this.vertices[1] = 2.0;
  this.vertices[2] = 0.0;
  
  this.vertices[3] = 1.0;
  this.vertices[4] = 1.0;
  this.vertices[5] = 0.0;
  
  this.vertices[6] = 0.0;
  this.vertices[7] = 1.0;
  this.vertices[8] = -1.0;
  
  this.vertices[9] = -1.0;
  this.vertices[10] = 1.0;
  this.vertices[11] = 0.0;
  
  this.vertices[12] = 0.0;
  this.vertices[13] = 1.0;
  this.vertices[14] = 1.0;
  
  this.vertices[15] = 0.0;
  this.vertices[16] = 0.0;
  this.vertices[17] = 0.0;
  
	
	
	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array(24);
	var triangleoffset = 0;
	for (var i = 1; i < 5; i++)
	{
		this.triangleIndices[triangleoffset] = 0;
		this.triangleIndices[triangleoffset+1] = i
		this.triangleIndices[triangleoffset+2] = i==4?1:(i+1);
		triangleoffset += 3;
		
		this.triangleIndices[triangleoffset] = i;
		this.triangleIndices[triangleoffset+1] = i==4?1:(i+1);
		this.triangleIndices[triangleoffset+2] = 5;
		triangleoffset += 3;
	}
		
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
}
