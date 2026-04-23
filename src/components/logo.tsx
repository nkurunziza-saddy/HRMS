import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
	return (
		<img
			src="/logo-web.png"
			alt="HRMS Logo"
			className={cn("size-8 object-contain", className)}
		/>
	);
}
