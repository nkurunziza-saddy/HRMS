import { AlertCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";

export function ErrorComponent({
	error,
	reset,
}: {
	error?: Error;
	reset?: () => void;
}) {
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<Frame className="max-w-md w-full">
				<FramePanel className="p-8 text-center space-y-6 bg-card">
					<div className="size-16 rounded-2xl bg-destructive/5 flex items-center justify-center text-destructive mx-auto">
						<HugeiconsIcon icon={AlertCircleIcon} size={32} />
					</div>
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-foreground/90">
							Something went wrong
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{error?.message ||
								"An unexpected error occurred while loading this page."}
						</p>
					</div>
					{reset && (
						<Button onClick={() => reset()} className="w-full gap-2 font-bold">
							<HugeiconsIcon icon={Loading03Icon} size={16} />
							Try Again
						</Button>
					)}
				</FramePanel>
			</Frame>
		</div>
	);
}
