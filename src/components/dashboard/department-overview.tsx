"use client";

import { Briefcase02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
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
import { useGetCompanyDepartmentsQuery } from "@/lib/redux/api/department";
import { useGetJobTitlesQuery } from "@/lib/redux/api/job-title";
import { useAppSelector } from "@/lib/redux/store";

export const DepartmentOverview = React.memo(function DepartmentOverview() {
	const { activeCompanyId } = useAppSelector((state) => state.auth);
	const { data: departmentsData, isLoading: isLoadingDepts } =
		useGetCompanyDepartmentsQuery(
			activeCompanyId ? { companyId: activeCompanyId } : undefined,
			{ skip: !activeCompanyId },
		);
	const { data: jobTitlesData, isLoading: isLoadingJobs } =
		useGetJobTitlesQuery(undefined);

	const departments = departmentsData?.items || [];
	const jobTitles = jobTitlesData?.items || [];

	if (isLoadingDepts || isLoadingJobs) {
		return (
			<Frame className="h-full group/frame">
				<FramePanel className="flex flex-col h-full overflow-hidden">
					<FrameHeader>
						<div>
							<FrameTitle>Department Overview</FrameTitle>
							<FrameDescription>Loading organizational structure...</FrameDescription>
						</div>
					</FrameHeader>
					<FrameContent className="flex-1 flex items-center justify-center">
						<div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
					</FrameContent>
				</FramePanel>
			</Frame>
		);
	}

	if (!departments.length) {
		return (
			<Frame className="h-full group/frame">
				<FramePanel className="flex flex-col h-full overflow-hidden">
					<FrameHeader>
						<div>
							<FrameTitle>Department Overview</FrameTitle>
						</div>
					</FrameHeader>
					<FrameContent className="flex-1 flex items-center justify-center text-center p-6">
						<p className="text-sm text-muted-foreground">No departments configured for this company.</p>
					</FrameContent>
				</FramePanel>
			</Frame>
		);
	}

	return (
		<Frame className="h-full group/frame">
			<FramePanel className="flex flex-col h-full overflow-hidden">
				<FrameHeader>
					<div>
						<FrameTitle>Department Overview</FrameTitle>
						<FrameDescription>
							Organizational structure & headcount
						</FrameDescription>
					</div>
					<Button variant="outline" size="sm">
						Manage
					</Button>
				</FrameHeader>

				<FrameContent className="p-0 flex-1 overflow-auto">
					{/* table headers */}
					<div className="grid grid-cols-[1fr_80px_80px_72px] items-center px-6 py-2.5 bg-muted/20 border-b border-border/5">
						{["Department", "Roles", "Staff", "Status"].map((h) => (
							<span
								key={h}
								className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest"
							>
								{h}
							</span>
						))}
					</div>

					{/* rows */}
					<div className="divide-y divide-border/5">
						{departments.map((dept) => {
							const deptJobs = jobTitles.filter(
								(j) => j.departmentId === dept.id,
							);
							return (
								<div
									key={dept.id}
									className="grid grid-cols-[1fr_80px_80px_72px] items-center px-6 py-4 hover:bg-muted/10 transition-colors group"
								>
									<div className="flex flex-col gap-0.5 min-w-0 pr-4">
										<span className="text-sm font-semibold text-foreground/90 leading-tight truncate group-hover:text-foreground transition-colors">
											{dept.name}
										</span>
										<span className="text-xs text-muted-foreground/50 font-medium truncate">
											{dept.description}
										</span>
									</div>
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-medium tabular-nums">
										<HugeiconsIcon
											icon={Briefcase02Icon}
											size={14}
											className="opacity-50"
										/>
										{deptJobs.length}
									</div>
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-medium tabular-nums">
										<HugeiconsIcon
											icon={UserGroupIcon}
											size={14}
											className="opacity-50"
										/>
										{dept.employeeCount}
									</div>
									<div className="flex items-center">
										<Badge
											variant={dept.status === "active" ? "success" : "warning"}
											showDot
											className="border-none bg-transparent p-0 text-muted-foreground/70"
										>
											{dept.status}
										</Badge>
									</div>
								</div>
							);
						})}
					</div>
				</FrameContent>

				<FrameFooter>
					<span className="text-xs text-muted-foreground/40 font-bold capitalize tracking-widest">
						{departments.length} Active Departments
					</span>
				</FrameFooter>
			</FramePanel>
		</Frame>
	);
});
