import { Camera, Vector3 } from "three";

export class ScreenShake {
	state:{
		timestampStart: number;
		timestampEnd: number;
		startPoint: THREE.Vector3;
		endPoint: THREE.Vector3;
	} | undefined = undefined;


	// This initialize the values of the shaking.
	// vecToAdd param is the offset of the camera position at the climax of its wave.
	shake(camera: Camera, vecToAdd: Vector3, milliseconds: number) {
		const now = Date.now();
		this.state = {
			timestampStart: now,
			timestampEnd: now + milliseconds,
			startPoint: new Vector3().copy(camera.position),
			endPoint: new Vector3().addVectors(camera.position, vecToAdd),
		}
	}



	// update(camera) must be called in the loop function of the renderer,
	// it will repositioned the camera according to the requested shaking.
	update(camera: Camera) {
		if (this.state) {
			const now = Date.now();
			if (this.state.timestampEnd > now) {
				const interval =
				(Date.now() - this.state.timestampStart) / (this.state.timestampEnd - this.state.timestampStart);
				this.computePosition(camera, interval);
			} else {
				camera.position.copy(this.state.startPoint);
				this.state = undefined;
			}
		}
	}
	
	computePosition(camera: Camera, interval: number) {
		// This creates the wavy movement of the camera along the interval.
		// The first bloc call this.getQuadra() with a positive indice between
		// 0 and 1, then the second call it again with a negative indice between
		// 0 and -1, etc. Variable position will get the sign of the indice, and
		// get wavy.
		if(!this.state) return;
		let position;
		if (interval < 0.4) {
			position = this.getQuadra(interval / 0.4);
		} else if (interval < 0.7) {
			position = this.getQuadra((interval - 0.4) / 0.3) * -0.6;
		} else if (interval < 0.9) {
			position = this.getQuadra((interval - 0.7) / 0.2) * 0.3;
		} else {
			position = this.getQuadra((interval - 0.9) / 0.1) * -0.1;
		}
		
		// Here the camera is positioned according to the wavy 'position' variable.
		camera.position.lerpVectors(this.state.startPoint, this.state.endPoint, position);
	}
	isActive() {
		return !!this.state;
	}
	
	// This is a quadratic function that return 0 at first, then return 0.5 when t=0.5,
	// then return 0 when t=1 ;
	private getQuadra(t: number) {
		return 9.436896e-16 + 4 * t - 4 * (t * t);
	}
}
