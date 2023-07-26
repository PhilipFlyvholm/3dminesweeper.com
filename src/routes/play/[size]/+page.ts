import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
	if (params.size) {
		//regex for nxnxn where n is a number and x is a the letter x or X
		const regex = new RegExp('^[0-9]+[xX][0-9]+[xX][0-9]+$');
		if (regex.test(params.size)) {
			const size = params.size.split('x');
			return {
				size: {
					width: parseInt(size[0]),
					height: parseInt(size[1]),
					depth: parseInt(size[2])
				}
			};
		}
	}

	throw error(404, 'Not found');
}) satisfies PageLoad;
