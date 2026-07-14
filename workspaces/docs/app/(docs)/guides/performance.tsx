import React from 'react';
import { View } from 'react-native';
import { BodyText, Callout, DocPage } from '../../../components/DocPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { PropsTable, type PropRow } from '../../../components/PropsTable';

const BAD_INLINE = `// BAD — every prop here is a new object/array/element on every render of Page.
export function Page() {
  const [muted, setMuted] = React.useState(false);

  return (
    <VideoPlayer
      videoTitle="Big Buck Bunny"
      playerConfig={{
        playerId: 'player',
        videoSources: [{ id: 'main', playerId: 'player', label: 'Main', source: url, format: 'mp4' }],
        subtitleSources: [],
        initialVideoSource: 0,
      }}
      theme={{ minimumTrackTintColor: '#38bdf8' }}
      HeaderRightElement={<MuteButton muted={muted} />}
      onClosePlayer={() => router.back()}
    />
  );
}`;

const GOOD_MEMOIZED = `// GOOD — stable identities, so the controls only re-render on real state changes.
export function Page() {
  const [muted, setMuted] = React.useState(false);

  const videoSources = React.useMemo(
    () => [{ id: 'main', playerId: 'player', label: 'Main', source: url, format: 'mp4' }],
    [url],
  );

  const playerConfig = React.useMemo(
    () => ({ playerId: 'player', videoSources, subtitleSources: [], initialVideoSource: 0 }),
    [videoSources],
  );

  const theme = React.useMemo(() => ({ minimumTrackTintColor: '#38bdf8' }), []);
  const headerRight = React.useMemo(() => <MuteButton muted={muted} />, [muted]);
  const onClosePlayer = React.useCallback(() => router.back(), []);

  return (
    <VideoPlayer
      videoTitle="Big Buck Bunny"
      playerConfig={playerConfig}
      theme={theme}
      HeaderRightElement={headerRight}
      onClosePlayer={onClosePlayer}
    />
  );
}`;

const HOISTED = `// BEST — anything that never changes belongs outside the component entirely.
const THEME = { minimumTrackTintColor: '#38bdf8' };
const RATES = [0.5, 1, 1.5, 2];

export function Page() {
  return <VideoPlayer theme={THEME} /* ... */ />;
}`;

const PROP_BEHAVIOUR: PropRow[] = [
	{
		name: 'playerConfig.videoSources',
		type: 'VideoSource[]',
		description: 'Identity-stabilised internally by content. An inline array is tolerated, but still costs a comparison on every render — prefer useMemo.',
	},
	{
		name: 'playerConfig.subtitleSources',
		type: 'SubtitleSource[]',
		description: 'Same as videoSources — stabilised by content.',
	},
	{
		name: 'theme',
		type: 'SliderThemeType',
		description: 'NOT stabilised. An inline object re-renders the whole control bar on every parent render. Hoist it or useMemo it.',
	},
	{
		name: 'HeaderRightElement',
		type: 'React.ReactNode',
		description: 'NOT stabilised. Inline JSX is a new element every render. useMemo it, keyed on whatever it actually depends on.',
	},
	{
		name: 'onClosePlayer / onNextVideo / onProgress / onEnd',
		type: 'function',
		description: 'Safe to pass inline — the player reads these through a ref, so their identity never reaches the controls.',
	},
];

export default function PerformancePage() {
	return (
		<DocPage
			title="Performance"
			description="How to keep the player at 60fps — and the prop patterns that quietly break it."
			platforms={['ios', 'android', 'web', 'tv']}
			sections={[
				{
					title: 'Why this matters',
					content: (
						<View className="gap-3">
							<BodyText>
								The control bar is a large tree — buttons, dropdowns, a scrubber, focus guides. Everything below
								PlayerControls is memoised, so it normally does nothing while you watch. But memoisation compares prop
								identity, not value. One unstable prop from your page defeats it and re-renders the entire tree.
							</BodyText>
							<BodyText>
								On a TV box that is the difference between 60fps and a visibly janky control bar, because every re-render
								re-resolves the styles of hundreds of views. The rules below are the whole story.
							</BodyText>
						</View>
					),
				},
				{
					title: 'Bad practice: inline props',
					content: (
						<View className="gap-3">
							<BodyText>
								Object literals, array literals and inline JSX create a brand new value on every render. Passing them
								directly to VideoPlayer means the player cannot tell "nothing changed" from "everything changed".
							</BodyText>
							<CodeBlock code={BAD_INLINE} language="tsx" />
							<Callout type="warning">
								This looks harmless. It is the single most common cause of player jank: any state change anywhere in the
								page rebuilds every one of those props, and the control bar re-renders with it.
							</Callout>
						</View>
					),
				},
				{
					title: 'Good practice: stable identities',
					content: (
						<View className="gap-3">
							<BodyText>
								Memoise anything you hand to the player, keyed on what it genuinely depends on. The player then re-renders
								only when something really changed.
							</BodyText>
							<CodeBlock code={GOOD_MEMOIZED} language="tsx" />
							<BodyText>Better still, hoist constants out of the component so there is nothing to memoise:</BodyText>
							<CodeBlock code={HOISTED} language="tsx" />
						</View>
					),
				},
				{
					title: 'Which props actually matter',
					content: (
						<View className="gap-3">
							<BodyText>
								Not every prop needs this. The player stabilises what it safely can, and reads your callbacks through a
								ref so they can stay inline. These are the ones that are on you:
							</BodyText>
							<PropsTable props={PROP_BEHAVIOUR} />
							<Callout type="tip">
								Rule of thumb: callbacks are safe to inline. Objects, arrays and JSX elements are not.
							</Callout>
						</View>
					),
				},
				{
					title: 'Profiling',
					content: (
						<View className="gap-3">
							<BodyText>
								If you do measure jank, profile a release build. React DevTools attaches to dev builds, where every render
								is far slower than production — dev timings will point you at problems that do not exist in a shipped app.
								Use @callstack/inspector to attach the profiler to a release build.
							</BodyText>
							<Callout type="info">
								In the React DevTools profiler, open a slow commit and look at why each component rendered. A row reading
								"props changed: theme" or "props changed: resources" is an unstable prop coming from your page — not from
								the player.
							</Callout>
						</View>
					),
				},
			]}
		/>
	);
}
