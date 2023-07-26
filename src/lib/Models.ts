import { useLoader } from '@threlte/core';
import { Group } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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
		objPath: 'models/flag.obj',
		mtlPath: 'models/flag.mtl',
		options: {
			scale: {
				x: 0.003,
				y: 0.003,
				z: 0.003
			}
		}
	}
];

let loaded = false;
export const models: Map<string, Group> = new Map();

async function loadModels() {
	const mtlLoader = useLoader(MTLLoader, () => new MTLLoader());
	const objLoader = useLoader(OBJLoader, () => new OBJLoader());
    const promises = [];
	for (const modelPath of modelPaths) {
		promises.push(mtlLoader.loadAsync(modelPath.mtlPath))
    }
    const materials = await Promise.all(promises);
    for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        const modelPath = modelPaths[i];
        objLoader.setMaterials(material);
        const obj = await objLoader.loadAsync(modelPath.objPath);
        if (modelPath.options?.scale) {
            obj.scale.set(modelPath.options.scale.x, modelPath.options.scale.y, modelPath.options.scale.z);
        }
        models.set(modelPath.name, obj);
    }
    loaded = true;
    return Promise.resolve();
}

export async function getModel(name: string): Promise<Group> {
	if (!loaded) {
		await loadModels();
	}
	const model = models.get(name);
	if (model === undefined) {
		console.warn(`Model ${name} not found`);
		return new Group();
	}
	return new Group().copy(model);
}

/*
 * , (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load(modelPath.objPath, (obj) => {
                if (modelPath.options?.scale) {
                    obj.scale.set(modelPath.options.scale.x, modelPath.options.scale.y, modelPath.options.scale.z);
                }
                models.set(modelPath.name, obj);
            },
            () => {
                //console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log('An error happened while loading object', error);
            });
        }

 */
