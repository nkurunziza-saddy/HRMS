"use client";

import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
	Frame,
	FrameContent,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { useGetRecruitmentPipelineQuery } from "@/lib/redux/api/applicant";
import type { RootState } from "@/lib/redux/store";

export const RecruitmentPipeline = React.memo(function RecruitmentPipeline() {
	const activeCompanyId = useSelector(
		(state: RootState) => state.auth.activeCompanyId,
	);
	const { data: pipeline = [], isLoading } = useGetRecruitmentPipelineQuery(
		activeCompanyId || "",
		{ skip: !activeCompanyId },
	);

	if (isLoading) {
		return (
			<Frame className="h-full group/frame">
				<FramePanel className="flex flex-col h-full overflow-hidden">
					<FrameHeader>
						<div>
							<FrameTitle>Recruitment Pipeline</FrameTitle>
							<FrameDescription>Loading pipeline data...</FrameDescription>
						</div>
					</FrameHeader>
					<FrameContent className="p-6 flex-1 flex items-center justify-center">
						<div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
					</FrameContent>
				</FramePanel>
			</Frame>
		);
	}

	if (!pipeline.length) {
		return (
			<Frame className="h-full group/frame">
				<FramePanel className="flex flex-col h-full overflow-hidden">
					<FrameHeader>
						<div>
							<FrameTitle>Recruitment Pipeline</FrameTitle>
							<FrameDescription>Active applicants by stage</FrameDescription>
						</div>
					</FrameHeader>
					<FrameContent className="p-6 flex-1 flex items-center justify-center">
						<p className="text-sm text-muted-foreground">No data available</p>
					</FrameContent>
				</FramePanel>
			</Frame>
		);
	}

	const maxCount = Math.max(...pipeline.map((s) => s.count));

	return (
		<Frame className="h-full group/frame">
			<FramePanel className="flex flex-col h-full overflow-hidden">
				<FrameHeader>
					<div>
						<FrameTitle>Recruitment Pipeline</FrameTitle>
						<FrameDescription>Active applicants by stage</FrameDescription>
					</div>
					<Button variant="outline" size="sm">
						<HugeiconsIcon icon={UserAdd01Icon} />
						View All
					</Button>
				</FrameHeader>

				<FrameContent className="p-0 flex-1 overflow-auto">
					<div className="flex flex-col justify-center px-6 py-4 min-h-[280px]">
						{pipeline.map((stage, i) => (
							<div
								key={stage.stage}
								className="flex flex-col mb-3 last:mb-0 group"
							>
								<div className="flex items-end justify-between mb-1.5">
									<span className="text-xs font-semibold text-foreground/80 lowercase tracking-widest leading-none">
										{stage.stage}
									</span>
									<span className="text-sm font-bold tabular-nums text-foreground/90 leading-none">
										{stage.count}
									</span>
								</div>
								<div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden flex relative">
									<div
										className="h-full bg-primary/60 transition-all duration-700 ease-out group-hover:bg-primary"
										style={{ width: `${(stage.count / maxCount) * 100}%` }}
									/>
									{i < pipeline.length - 1 && (
										<div className="absolute top-1/2 -right-1 -translate-y-1/2 -translate-x-full h-4 w-px bg-border/20" />
									)}
								</div>
							</div>
						))}
					</div>
				</FrameContent>

				<FrameFooter>
					<span className="text-xs text-muted-foreground/40 font-bold capitalize tracking-widest flex items-center gap-2">
						Total Pipeline Volume:{" "}
						<span className="text-foreground/90 tabular-nums">
							{pipeline.reduce((a, b) => a + b.count, 0)}
						</span>
					</span>
				</FrameFooter>
			</FramePanel>
		</Frame>
	);
});
