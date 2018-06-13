NVMCClient.onKeyDown = function (keyCode, event) {
	switch(keyCode){
		case "W": this.game.playerAccelerate = true; break;
		case "S": this.game.playerBrake         = true; break;
		case "A": this.game.playerSteerLeft    = true; break;
		case "D": this.game.playerSteerRight  = true; break;
	}
};

NVMCClient.onKeyUp = function (keyCode, event) {
	switch(keyCode){
		/*case "W": this.game.playerAccelerate  = false; break;
		case "S": this.game.playerBrake           = false; break;
		case "A": this.game.playerSteerLeft      = false; break;
		case "D": this.game.playerSteerRight    = false; break;*/
    case "W": 
		case "S": 
		case "A": 
		case "D": console.log("up");this.game.change = false; break;
	}
};

NVMCClient.onAnimate = function (dt) {
	this.ui.postDrawEvent();
};

