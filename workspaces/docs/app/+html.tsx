import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const ROOT_CLASS = 'responsive-vars';

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
				<ScrollViewStyleReset />
			</head>
			<body className={ROOT_CLASS}>{withResponsiveRoot(children)}</body>
		</html>
	);
}
