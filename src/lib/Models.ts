import { Group } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const models: Map<string, Group> = new Map();
const modelPaths: {
	name: string;
	objPath: string;
	mtlPath: string;
	options?: {
		scale?: {
			x: number;
			y: number;
			z: number;
		};
	};
}[] = [
	{
		name: 'flag',
		objPath: '/models/flag.obj',
		mtlPath: '/models/flag.mtl',
		options: {
			scale: {
				x: 0.003,
				y: 0.003,
				z: 0.003
			}
		}
	}
];

let loading = false;
let loaded = false;

async function loadModels() {
	loading = true;
	const mtlLoader = new MTLLoader();
	const objLoader = new OBJLoader();
	const modelPromies = modelPaths.map(async (modelPath) => {
		return mtlLoader.loadAsync(modelPath.mtlPath).then((material) => {
			objLoader.setMaterials(material);
			return objLoader.loadAsync(modelPath.objPath).then(async (obj) => {
				if (modelPath.options?.scale) {
					obj.scale.set(
						modelPath.options.scale.x,
						modelPath.options.scale.y,
						modelPath.options.scale.z
					);
				}
				models.set(modelPath.name, obj);
			});
		});
	});
	await Promise.all(modelPromies);
	loaded = true;
	console.log('Models loaded');
}

export async function getModel(name: string): Promise<Group> {
	let bigShot = false;
	if (!loaded) {
		if (loading) {
			console.log('Waiting for models to load');
			while (!loaded) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		} else {
			console.log('Loading models');
			bigShot = true;
			await loadModels();
		}
	}
	const model = models.get(name);
	if (model === undefined) {
		console.warn(`Model ${name} not found`);
		if (bigShot) console.log('Big shot');

		return new Group();
	}
	return new Group().copy(model);
}
