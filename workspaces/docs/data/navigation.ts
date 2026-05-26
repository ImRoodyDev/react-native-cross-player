export type NavItem = {
	title: string;
	href?: string;
	children?: NavItem[];
};

export const navigation: NavItem[] = [
	{
		title: 'Getting Started',
		children: [
			{ title: 'Installation', href: '/installation' },
			{ title: 'Quick Start', href: '/quick-start' },
		],
	},
	{
		title: 'Components',
		href: '/components',
		children: [
			{ title: 'Overview', href: '/components' },
			{ title: 'VideoPlayer', href: '/components/video-player' },
			{ title: 'PlayerControls', href: '/components/player-controls' },
			{ title: 'usePlayerController', href: '/components/use-player-controller' },
		],
	},
	{
		title: 'Guides',
		children: [
			{ title: 'Media Playground', href: '/components/media-playground' },
			{ title: 'API Overview', href: '/api' },
		],
	},
];
