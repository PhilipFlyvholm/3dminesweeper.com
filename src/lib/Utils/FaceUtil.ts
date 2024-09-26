import { Vector3 } from 'three';

export function getFaceFromPoint(point: Vector3, pos: { x: number; y: number; z: number }) {
	const relativePoint = point.sub(new Vector3(pos.x, pos.y, pos.z)).divideScalar(1.15);

	//Example output
	//Top: _Vector3 {x: 0.21148293456258005, y: 0.49999998963397485, z: 0.21597936547841495}
	//Bottom: Vector3 {x: -0.011840658984020947, y: -0.49999998963397485, z: 0.021823974091515885}
	//East _Vector3 {x: 0.49999998963397485, y: -0.08341695343612354, z: 0.03229748735992646}
	//West: _Vector3 {x: -0.49999998963397485, y: 0.16861083447872244, z: 0.05988814920281661}
	//South: _Vector3 {x: 0.017862537584589718, y: -0.01824701872429958, z: 0.49999998963397485}
	//North: _Vector3 {x: 0.000142724549692546, y: -0.02653174383634825, z: -0.49999998963397485}

	//#ThxCoPilot
	const x = relativePoint.x;
	const y = relativePoint.y;
	const z = relativePoint.z;
	const absX = Math.abs(x);
	const absY = Math.abs(y);
	const absZ = Math.abs(z);

	if (absX > absY && absX > absZ) {
		if (x > 0) {
			return 'right';
		} else {
			return 'left';
		}
	}
	if (absY > absX && absY > absZ) {
		if (y > 0) {
			return 'up';
		} else {
			return 'down';
		}
	}
	if (absZ > absX && absZ > absY) {
		if (z > 0) {
			return 'back';
		} else {
			return 'front';
		}
	}
	return undefined;
}
