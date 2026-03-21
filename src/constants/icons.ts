// External imports
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export type IconProps = {
	className?: string;
	style?: object;
	size?: number;
	color?: string;
	viewBox?: string;
};
export type IconType = keyof typeof icons;

const icons = {
	// FontAwesome
	exclamation: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z"
				})
			)
		),
	error: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 384C302.3 384 288 398.3 288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416C352 398.3 337.7 384 320 384zM320 192C301.8 192 287.3 207.5 288.6 225.7L296 329.7C296.9 342.3 307.4 352 319.9 352C332.5 352 342.9 342.3 343.8 329.7L351.2 225.7C352.5 207.5 338.1 192 319.8 192z"
				})
			)
		),
	info: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z"
				})
			)
		),
	success: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"
				})
			)
		),
	pause: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"
				})
			)
		),
	play: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"
				})
			)
		),

	globe: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M415.9 344L225 344C227.9 408.5 242.2 467.9 262.5 511.4C273.9 535.9 286.2 553.2 297.6 563.8C308.8 574.3 316.5 576 320.5 576C324.5 576 332.2 574.3 343.4 563.8C354.8 553.2 367.1 535.8 378.5 511.4C398.8 467.9 413.1 408.5 416 344zM224.9 296L415.8 296C413 231.5 398.7 172.1 378.4 128.6C367 104.2 354.7 86.8 343.3 76.2C332.1 65.7 324.4 64 320.4 64C316.4 64 308.7 65.7 297.5 76.2C286.1 86.8 273.8 104.2 262.4 128.6C242.1 172.1 227.8 231.5 224.9 296zM176.9 296C180.4 210.4 202.5 130.9 234.8 78.7C142.7 111.3 74.9 195.2 65.5 296L176.9 296zM65.5 344C74.9 444.8 142.7 528.7 234.8 561.3C202.5 509.1 180.4 429.6 176.9 344L65.5 344zM463.9 344C460.4 429.6 438.3 509.1 406 561.3C498.1 528.6 565.9 444.8 575.3 344L463.9 344zM575.3 296C565.9 195.2 498.1 111.3 406 78.7C438.3 130.9 460.4 210.4 463.9 296L575.3 296z"
				})
			)
		),
	compress: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M256 128C256 110.3 241.7 96 224 96C206.3 96 192 110.3 192 128L192 192L128 192C110.3 192 96 206.3 96 224C96 241.7 110.3 256 128 256L224 256C241.7 256 256 241.7 256 224L256 128zM128 384C110.3 384 96 398.3 96 416C96 433.7 110.3 448 128 448L192 448L192 512C192 529.7 206.3 544 224 544C241.7 544 256 529.7 256 512L256 416C256 398.3 241.7 384 224 384L128 384zM448 128C448 110.3 433.7 96 416 96C398.3 96 384 110.3 384 128L384 224C384 241.7 398.3 256 416 256L512 256C529.7 256 544 241.7 544 224C544 206.3 529.7 192 512 192L448 192L448 128zM416 384C398.3 384 384 398.3 384 416L384 512C384 529.7 398.3 544 416 544C433.7 544 448 529.7 448 512L448 448L512 448C529.7 448 544 433.7 544 416C544 398.3 529.7 384 512 384L416 384z"
				})
			)
		),
	expand: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z"
				})
			)
		),
	xmark: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"
				})
			)
		),

	// Iconsax-react-native (inline SVG for settings)
	settings: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M20.1 9.221c-1.81 0-2.55-1.28-1.65-2.85.52-.91.21-2.07-.7-2.59l-1.73-.99c-.79-.47-1.81-.19-2.28.6l-.11.19c-.9 1.57-2.38 1.57-3.29 0l-.11-.19a1.641 1.641 0 0 0-2.26-.6l-1.73.99c-.91.52-1.22 1.69-.7 2.6.91 1.56.17 2.84-1.64 2.84-1.04 0-1.9.85-1.9 1.9v1.76c0 1.04.85 1.9 1.9 1.9 1.81 0 2.55 1.28 1.64 2.85-.52.91-.21 2.07.7 2.59l1.73.99c.79.47 1.81.19 2.28-.6l.11-.19c.9-1.57 2.38-1.57 3.29 0l.11.19c.47.79 1.49 1.07 2.28.6l1.73-.99c.91-.52 1.22-1.69.7-2.59-.91-1.57-.17-2.85 1.64-2.85 1.04 0 1.9-.85 1.9-1.9v-1.76a1.92 1.92 0 0 0-1.91-1.9Zm-8.1 6.03c-1.79 0-3.25-1.46-3.25-3.25s1.46-3.25 3.25-3.25 3.25 1.46 3.25 3.25-1.46 3.25-3.25 3.25Z",
					fill: props.color || "currentColor"
				})
			)
		),
	trash: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82ZM19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Zm-5.57 9.61h-3.33c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3.33c.41 0 .75.34.75.75s-.34.75-.75.75Zm.84-4h-5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h5c.41 0 .75.34.75.75s-.34.75-.75.75Z",
					fill: props.color || "currentColor"
				})
			)
		),
	danger: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M21.76 15.92 15.36 4.4C14.5 2.85 13.31 2 12 2s-2.5.85-3.36 2.4l-6.4 11.52c-.81 1.47-.9 2.88-.25 3.99.65 1.11 1.93 1.72 3.61 1.72h12.8c1.68 0 2.96-.61 3.61-1.72.65-1.11.56-2.53-.25-3.99ZM11.25 9c0-.41.34-.75.75-.75s.75.34.75.75v5c0 .41-.34.75-.75.75s-.75-.34-.75-.75V9Zm1.46 8.71-.15.12c-.06.04-.12.07-.18.09-.06.03-.12.05-.19.06-.06.01-.13.02-.19.02s-.13-.01-.2-.02a.636.636 0 0 1-.18-.06.757.757 0 0 1-.18-.09l-.15-.12c-.18-.19-.29-.45-.29-.71 0-.26.11-.52.29-.71l.15-.12c.06-.04.12-.07.18-.09.06-.03.12-.05.18-.06.13-.03.27-.03.39 0 .07.01.13.03.19.06.06.02.12.05.18.09l.15.12c.18.19.29.45.29.71 0 .26-.11.52-.29.71Z",
					fill: props.color || "currentColor"
				})
			)
		),
	volume_high: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M18 16.75a.75.75 0 0 1-.6-1.2 5.94 5.94 0 0 0 0-7.1.75.75 0 0 1 1.2-.9c1.96 2.62 1.96 6.28 0 8.9-.15.2-.37.3-.6.3Z",
					fill: props.color || "currentColor"
				}),
				React.createElement(Path, {
					d: "M19.828 19.25a.75.75 0 0 1-.6-1.2c2.67-3.56 2.67-8.54 0-12.1a.75.75 0 0 1 1.2-.9c3.07 4.09 3.07 9.81 0 13.9-.14.2-.37.3-.6.3ZM14.02 3.782c-1.12-.62-2.55-.46-4.01.45l-2.92 1.83c-.2.12-.43.19-.66.19H5c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75H6.43c.23 0 .46.07.66.19l2.92 1.83c.88.55 1.74.82 2.54.82a3 3 0 0 0 1.47-.37c1.11-.62 1.73-1.91 1.73-3.63v-9.18c0-1.72-.62-3.01-1.73-3.63Z",
					fill: props.color || "currentColor"
				})
			)
		),

	audio_wave: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 24,
					height: props.size || 24,
					viewBox: props.viewBox || "0 0 24 24",
					fill: "none",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M2 10v3",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none"
				}),
				React.createElement(Path, {
					d: "M6 6v11",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none"
				}),
				React.createElement(Path, {
					d: "M10 3v18",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none"
				}),
				React.createElement(Path, {
					d: "M14 8v7",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none"
				}),
				React.createElement(Path, {
					d: "M18 5v13",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none"
				}),
				React.createElement(Path, {
					d: "M22 10v3",
					stroke: props.color || "currentColor",
					strokeWidth: 2,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none"
				})
			)
		),
	volume_slash: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M18 16.75a.75.75 0 0 1-.6-1.2 5.926 5.926 0 0 0 .72-5.84.75.75 0 0 1 .4-.98c.38-.16.82.02.98.4 1.02 2.42.67 5.23-.9 7.33-.15.19-.37.29-.6.29Z",
					fill: props.color || "currentColor"
				}),
				React.createElement(Path, {
					d: "M19.828 19.25a.75.75 0 0 1-.6-1.2c2.14-2.85 2.61-6.67 1.23-9.96a.75.75 0 0 1 .4-.98c.38-.16.82.02.98.4 1.59 3.78 1.05 8.16-1.41 11.44-.14.2-.37.3-.6.3ZM14.04 12.958c.63-.63 1.71-.18 1.71.71v2.93c0 1.72-.62 3.01-1.73 3.63a3 3 0 0 1-1.47.37c-.8 0-1.66-.27-2.54-.82l-.64-.4c-.54-.34-.63-1.1-.18-1.55l4.85-4.87ZM21.77 2.229c-.3-.3-.79-.3-1.09 0l-4.95 4.95c-.06-1.6-.66-2.8-1.72-3.39-1.12-.62-2.55-.46-4.01.45l-2.91 1.82c-.2.12-.43.19-.66.19H5c-2.42 0-3.75 1.33-3.75 3.75v4c0 2.42 1.33 3.75 3.75 3.75h.16l-2.94 2.94c-.3.3-.3.79 0 1.09.16.14.35.22.55.22.2 0 .39-.08.54-.23l18.46-18.46c.31-.3.31-.78 0-1.08Z",
					fill: props.color || "currentColor"
				})
			)
		),
	play_circle: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10Zm3 12.23-2.9 1.67a2.284 2.284 0 0 1-2.3 0 2.285 2.285 0 0 1-1.15-2v-3.35c0-.83.43-1.58 1.15-2 .72-.42 1.58-.42 2.31 0l2.9 1.67c.72.42 1.15 1.16 1.15 2 0 .84-.43 1.59-1.16 2.01Z",
					fill: props.color || "currentColor"
				})
			)
		),
	play_cricle: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M19.072 19.821c-.19 0-.38-.07-.53-.22a.754.754 0 0 1 0-1.06c3.61-3.61 3.61-9.48 0-13.08a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0 4.19 4.19 4.19 11.01 0 15.2-.15.15-.34.22-.53.22ZM4.93 19.821c-.19 0-.38-.07-.53-.22-4.19-4.19-4.19-11.01 0-15.2.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06-3.61 3.61-3.61 9.48 0 13.08.29.29.29.77 0 1.06-.15.15-.34.22-.53.22ZM11.999 22.712c-1.25-.01-2.44-.21-3.55-.6a.754.754 0 0 1-.46-.96c.14-.39.56-.6.96-.46.96.33 1.98.51 3.06.51 1.07 0 2.1-.18 3.05-.51.39-.13.82.07.96.46s-.07.82-.46.96c-1.12.39-2.31.6-3.56.6ZM15.299 3.34c-.08 0-.17-.01-.25-.04a9.04 9.04 0 0 0-3.05-.51c-1.07 0-2.09.18-3.05.51-.4.13-.82-.07-.96-.46s.07-.82.46-.96c1.12-.39 2.31-.59 3.55-.59 1.24 0 2.44.2 3.55.59a.75.75 0 0 1-.25 1.46ZM8.738 12v-1.67c0-2.08 1.47-2.93 3.27-1.89l1.45.84 1.45.84c1.8 1.04 1.8 2.74 0 3.78l-1.45.84-1.45.84c-1.8 1.04-3.27.19-3.27-1.89V12Z",
					fill: props.color || "currentColor"
				})
			)
		),
	forward_10_seconds: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M19.692 7.348a.75.75 0 0 0-1.2.9c1.08 1.44 1.65 3.12 1.65 4.86 0 4.49-3.65 8.14-8.14 8.14s-8.14-3.65-8.14-8.14 3.65-8.13 8.14-8.13c.58 0 1.17.07 1.81.22.03.01.06 0 .1 0 .02 0 .05.02.07.02.03 0 .05-.01.08-.01.04 0 .07-.01.1-.02.05-.01.1-.03.15-.06.03-.02.07-.03.1-.05.01-.01.03-.01.04-.02.03-.02.04-.05.06-.07a.58.58 0 0 0 .1-.12c.03-.04.04-.09.06-.13.01-.03.03-.06.04-.09v-.05c.01-.05.01-.1 0-.15 0-.05 0-.09-.01-.14-.01-.04-.03-.08-.05-.13a.61.61 0 0 0-.07-.14c-.01-.02-.01-.03-.02-.04l-1.98-2.47a.757.757 0 0 0-1.05-.12c-.32.26-.37.73-.12 1.05l.82 1.02c-.08 0-.16-.01-.24-.01-5.31 0-9.64 4.32-9.64 9.64s4.32 9.64 9.64 9.64 9.64-4.32 9.64-9.64c.01-2.07-.67-4.06-1.94-5.76Z",
					fill: props.color || "currentColor"
				}),
				React.createElement(Path, {
					d: "M9.541 16.67c-.41 0-.75-.34-.75-.75v-3.39l-.19.22c-.28.31-.75.33-1.06.06a.756.756 0 0 1-.06-1.06l1.5-1.67c.21-.23.54-.31.83-.2.29.11.48.39.48.7v5.35c0 .41-.33.74-.75.74ZM14 16.67c-1.52 0-2.75-1.23-2.75-2.75v-1.35c0-1.52 1.23-2.75 2.75-2.75s2.75 1.23 2.75 2.75v1.35c0 1.52-1.23 2.75-2.75 2.75Zm0-5.34c-.69 0-1.25.56-1.25 1.25v1.35a1.25 1.25 0 0 0 2.5 0v-1.35c0-.69-.56-1.25-1.25-1.25Z",
					fill: props.color || "currentColor"
				})
			)
		),
	backward_10_seconds: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M9.541 16.67c-.41 0-.75-.34-.75-.75v-3.39l-.19.22c-.28.31-.75.33-1.06.06a.756.756 0 0 1-.06-1.06l1.5-1.67c.21-.23.54-.31.83-.2.29.11.48.39.48.7v5.35c0 .41-.33.74-.75.74Z",
					fill: props.color || "currentColor"
				}),
				React.createElement(Path, {
					d: "M12.001 3.48c-.08 0-.16.01-.24.01l.82-1.02c.26-.32.21-.8-.12-1.05a.739.739 0 0 0-1.05.12L9.441 4c-.01.01-.01.02-.02.04-.03.04-.05.09-.07.13-.02.05-.04.09-.05.13-.01.05-.01.09-.01.14v.2c.01.03.03.05.04.09.02.05.03.09.06.13.03.04.06.08.1.12.02.02.04.05.06.07.01.01.03.01.04.02.03.02.06.04.1.05.05.03.1.05.15.06.04.02.07.02.11.02.03 0 .05.01.08.01.02 0 .05-.01.07-.02h.1c.64-.15 1.24-.22 1.81-.22 4.49 0 8.14 3.65 8.14 8.14s-3.65 8.14-8.14 8.14-8.14-3.65-8.14-8.14c0-1.74.57-3.42 1.65-4.86a.75.75 0 0 0-1.2-.9c-1.28 1.7-1.95 3.69-1.95 5.76 0 5.31 4.32 9.64 9.64 9.64s9.64-4.32 9.64-9.64-4.34-9.63-9.65-9.63Z",
					fill: props.color || "currentColor"
				}),
				React.createElement(Path, {
					d: "M14 16.67c-1.52 0-2.75-1.23-2.75-2.75v-1.35c0-1.52 1.23-2.75 2.75-2.75s2.75 1.23 2.75 2.75v1.35c0 1.52-1.23 2.75-2.75 2.75Zm0-5.34c-.69 0-1.25.56-1.25 1.25v1.35a1.25 1.25 0 0 0 2.5 0v-1.35c0-.69-.56-1.25-1.25-1.25Z",
					fill: props.color || "currentColor"
				})
			)
		),
	subtitle: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: props.viewBox || "0 0 24 24",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2ZM6.5 12.57h2.77c.41 0 .75.34.75.75s-.34.75-.75.75H6.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75Zm6.47 5.26H6.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h6.47a.749.749 0 1 1 0 1.5Zm4.53 0h-1.85c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.85c.41 0 .75.34.75.75s-.34.75-.75.75Zm0-3.76h-5.53c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h5.53c.41 0 .75.34.75.75s-.34.75-.75.75Z",
					fill: props.color || "currentColor"
				})
			)
		),

	// SVG icons
	next: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z"
				})
			)
		),
	play3: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 16 16",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
				})
			)
		),
	check: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 640 640",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"
				})
			)
		),

	lock: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 16 16",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
				})
			)
		),

	repeat: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 16 16",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"
				}),
				React.createElement(Path, {
					fillRule: "evenodd",
					d: "M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
				})
			)
		),
	fullscreen: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 16 16",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"
				})
			)
		),
	exit_fullscreen: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 16 16",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"
				})
			)
		),
	speed: (props: IconProps) =>
		React.createElement(
			View,
			{
				className: props.className
			},
			React.createElement(
				Svg,
				{
					width: props.size || 16,
					height: props.size || 16,
					viewBox: "0 0 16 16",
					fill: props.color || "currentColor",
					className: props.className,
					style: props.style
				},
				React.createElement(Path, {
					d: "M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2M3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.39.39 0 0 0-.029-.518z"
				}),
				React.createElement(Path, {
					fillRule: "evenodd",
					d: "M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.95 11.95 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0"
				})
			)
		)
};

export { icons as Icons };
export default icons;
