"use client";

import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
	src?: string;
	name: string;
	email?: string;
	size?: "sm" | "default" | "lg";
	status?: "online" | "offline" | "away";
	className?: string;
}

const statusColorMap = {
	online: "bg-emerald-500",
	offline: "bg-muted-foreground",
	away: "bg-amber-500",
};

export function UserAvatar({
	src,
	name,
	email,
	size = "default",
	status,
	className,
}: UserAvatarProps) {
	const initials = (name || "??")
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const avatarContent = (
		<Avatar size={size} className={className}>
			<AvatarImage src={src} alt={name} />
			<AvatarFallback>{initials}</AvatarFallback>
			{status && (
				<AvatarBadge
					className={cn(
						statusColorMap[status],
						"ring-2 ring-background border-none",
					)}
					aria-label={status}
				/>
			)}
		</Avatar>
	);

	if (email) {
		return (
			<div className="flex items-center gap-3">
				{avatarContent}
				<div className="flex flex-col min-w-0">
					<p className="text-sm font-semibold text-foreground/90 leading-tight truncate">
						{name}
					</p>
					<p className="text-xs text-muted-foreground truncate mt-0.5">
						{email}
					</p>
				</div>
			</div>
		);
	}

	return avatarContent;
}
