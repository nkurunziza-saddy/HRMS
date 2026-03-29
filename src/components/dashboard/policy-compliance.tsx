"use client";

import { Alert02Icon, CheckListIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Frame,
	FrameContent,
	FrameDescription,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { useGetComplianceQuery } from "@/lib/redux/api/employee";
import type { RootState } from "@/lib/redux/store";

export const PolicyComplianceCard = React.memo(function PolicyComplianceCard() {
	const activeCompanyId = useSelector(
		(state: RootState) => state.auth.activeCompanyId,
	);
	const { data, isLoading } = useGetComplianceQuery(activeCompanyId || "", {
		skip: !activeCompanyId,
	});

	if (isLoading) {
		return (
			<Frame className="h-full group/frame">
				<FramePanel className="flex flex-col h-full overflow-hidden">
					<FrameHeader>
						<div>
							<FrameTitle>Document Compliance</FrameTitle>
							<FrameDescription>Loading compliance data...</FrameDescription>
						</div>
					</FrameHeader>
					<FrameContent className="p-6 flex-1 flex items-center justify-center">
						<div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
					</FrameContent>
				</FramePanel>
			</Frame>
		);
	}

	if (!data) return null;

	return (
		<Frame className="h-full group/frame">
			<FramePanel className="flex flex-col h-full overflow-hidden">
				<FrameHeader>
					<div>
						<FrameTitle>Document Compliance</FrameTitle>
						<FrameDescription>
							Onboarding & offboarding policies
						</FrameDescription>
					</div>
					<Button variant="outline" size="sm">
						Review Flagged
					</Button>
				</FrameHeader>

				<FrameContent className="p-0 flex-1 overflow-auto">
					{/* Metrics header */}
					<div className="grid grid-cols-2 divide-x divide-border/5 border-b border-border/5">
						<div className="p-6 flex flex-col gap-1 items-center justify-center text-center">
							<span className="text-3xl font-light tabular-nums tracking-tighter text-foreground">
								{data.onboarding.total > 0
									? Math.round(
											(data.onboarding.compliant / data.onboarding.total) * 100,
										)
									: 0}
								%
							</span>
							<span className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest">
								Onboarding Health
							</span>
							<Badge
								variant={
									data.onboarding.nonCompliant > 0 ? "destructive" : "success"
								}
								className="mt-2 bg-opacity-10 border-none"
							>
								{data.onboarding.nonCompliant} Missing
							</Badge>
						</div>
						<div className="p-6 flex flex-col gap-1 items-center justify-center text-center">
							<span className="text-3xl font-light tabular-nums tracking-tighter text-foreground">
								{data.offboarding.total > 0
									? Math.round(
											(data.offboarding.compliant / data.offboarding.total) *
												100,
										)
									: 0}
								%
							</span>
							<span className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest">
								Offboarding Health
							</span>
							<Badge
								variant={
									data.offboarding.nonCompliant > 0 ? "destructive" : "success"
								}
								className="mt-2 bg-opacity-10 border-none"
							>
								{data.offboarding.nonCompliant} Missing
							</Badge>
						</div>
					</div>

					{/* Action List */}
					<div className="px-6 py-4">
						<h4 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 flex items-center gap-2">
							<HugeiconsIcon
								icon={Alert02Icon}
								size={14}
								className="text-destructive"
							/>
							Flagged Employees
						</h4>
						<div className="space-y-3">
							{[
								...data.onboarding.nonCompliantEmployees,
								...data.offboarding.nonCompliantEmployees,
							].map((emp, i) => (
								<div
									key={i}
									className="flex items-center justify-between group"
								>
									<div className="flex flex-col gap-0.5">
										<span className="text-sm font-semibold text-foreground/90 leading-tight">
											{emp.name}
										</span>
										<span className="text-xs text-muted-foreground/50 font-medium">
											Missing: {emp.missingDoc.replace(/_/g, " ")}
										</span>
									</div>
									<Button
										variant="outline"
										size="xs"
										className="opacity-0 group-hover:opacity-100 transition-opacity"
									>
										Request
									</Button>
								</div>
							))}
							{data.onboarding.nonCompliantEmployees.length === 0 &&
								data.offboarding.nonCompliantEmployees.length === 0 && (
									<div className="text-center py-6 text-muted-foreground/40 flex flex-col items-center gap-2">
										<HugeiconsIcon icon={CheckListIcon} size={24} />
										<span className="text-xs font-medium">
											All employees are 100% compliant.
										</span>
									</div>
								)}
						</div>
					</div>
				</FrameContent>
			</FramePanel>
		</Frame>
	);
});
