export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/cessions": [4],
		"/cessions/new": [5],
		"/cessions/[id]": [6],
		"/cessions/[id]/document": [7],
		"/clients": [8],
		"/clients/new": [9],
		"/clients/[id]": [10],
		"/clients/[id]/cessions": [11],
		"/clients/[id]/cessions/new": [12],
		"/clients/[id]/cessions/[cessionId]": [13],
		"/clients/[id]/cessions/[cessionId]/edit": [14],
		"/clients/[id]/edit": [15],
		"/dashboard/expenses": [16],
		"/documents/salary-assignment": [17],
		"/finance": [18],
		"/inventory": [19],
		"/login": [20],
		"/payments": [21,[2]],
		"/selling": [22],
		"/settings": [23],
		"/signup": [24],
		"/workplaces": [25]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';