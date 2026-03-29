import type * as React from "react";

import { cn } from "@/lib/utils";

function Frame({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("relative flex flex-col gap-4 group/frame", className)}
			data-slot="frame"
			{...props}
		/>
	);
}

function FramePanel({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"relative rounded-2xl border border-border bg-card bg-clip-padding p-0",
				className,
			)}
			data-slot="frame-panel"
			{...props}
		/>
	);
}

function FrameHeader({ className, ...props }: React.ComponentProps<"header">) {
	return (
		<header
			className={cn(
				"flex items-center justify-between px-6 py-5 border-b border-border/50",
				className,
			)}
			data-slot="frame-panel-header"
			{...props}
		/>
	);
}

function FrameTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"text-base font-bold text-foreground/90 tracking-tight leading-none",
				className,
			)}
			data-slot="frame-panel-title"
			{...props}
		/>
	);
}

function FrameDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"text-xs text-muted-foreground font-medium mt-1.5 leading-none tracking-tight",
				className,
			)}
			data-slot="frame-panel-description"
			{...props}
		/>
	);
}

function FrameContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("px-6 py-5", className)}
			data-slot="frame-panel-content"
			{...props}
		/>
	);
}

function FrameFooter({ className, ...props }: React.ComponentProps<"footer">) {
	return (
		<footer
			className={cn(
				"px-6 py-4 border-t border-border/50 bg-muted/5",
				className,
			)}
			data-slot="frame-panel-footer"
			{...props}
		/>
	);
}

export {
	Frame,
	FrameContent,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
};
