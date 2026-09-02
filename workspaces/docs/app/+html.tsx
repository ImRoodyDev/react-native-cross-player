import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import { publicAsset } from '../utils/publicAsset';

const ROOT_CLASS = 'responsive-vars';
const FAVICON = publicAsset('img/ctn-square.png');

function withResponsiveRoot(children: React.ReactNode) {
	if (!React.isValidElement<{ className?: string }>(children)) {
		return children;
	}

	const className = [ROOT_CLASS, children.props.className].filter(Boolean).join(' ');

	return React.cloneElement(children, { className });
}

export default function RootHtml({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={ROOT_CLASS}>
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
				<meta name="theme-color" content="#09090b" />
				<link rel="icon" type="image/png" href={FAVICON} />
				<link rel="apple-touch-icon" href={FAVICON} />
				<ScrollViewStyleReset />
			</head>
			<body className={ROOT_CLASS}>{withResponsiveRoot(children)}</body>
		</html>
	);
}
