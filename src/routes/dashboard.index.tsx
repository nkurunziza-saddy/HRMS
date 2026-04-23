import {
	ArrowUpRight01Icon,
	Briefcase02Icon,
	Building03Icon,
	PlusSignCircleIcon,
	UserAdd01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepartmentOverview } from "@/components/dashboard/department-overview";
import { DocumentCompliance } from "@/components/dashboard/document-compliance";
import { EmploymentStatusChart } from "@/components/dashboard/employment-status-chart";
import { PolicyComplianceCard } from "@/components/dashboard/policy-compliance";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RecruitmentPipeline } from "@/components/dashboard/recruitment-pipeline";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useGetCompaniesQuery, useGetCompanyStatsQuery } from "@/lib/redux/api";
import { setActiveCompany } from "@/lib/redux/slices/auth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const dispatch = useAppDispatch();
	const { activeCompanyId, user } = useAppSelector((state) => state.auth);
	const isAdmin = user?.role === "ADMIN";

	const { data: companiesData } = useGetCompaniesQuery(undefined, {
		skip: !isAdmin || !!activeCompanyId,
	});

	useEffect(() => {
		if (isAdmin && !activeCompanyId && companiesData?.items.length) {
			dispatch(setActiveCompany(companiesData.items[0].id));
		}
	}, [isAdmin, activeCompanyId, companiesData, dispatch]);

	const { data: stats, isLoading } = useGetCompanyStatsQuery(activeCompanyId!, {
		skip: !activeCompanyId,
	});

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
			<DashboardHeader
				category="Operational Overview"
				title="Admin Dashboard"
				description="Monitor workforce operations, recruitment velocity, and organizational compliance"
			>
				<Button variant="outline">
					<HugeiconsIcon icon={ArrowUpRight01Icon} />
					Export
				</Button>
				<Button render={<Link to="/dashboard/employees/onboard" />}>
					<HugeiconsIcon icon={PlusSignCircleIcon} />
					Induct
				</Button>
			</DashboardHeader>

			<div className="flex flex-col gap-8 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
				{/* Row 1: Key Stat Cards */}
				<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="Active Employees"
						value={isLoading ? "..." : stats?.activeEmployees.toString() || "100"}
						change="4"
						up={true}
						icon={UserGroupIcon}
						variant="success"
						sub="Current headcount"
					/>
					<StatCard
						label="Departments"
						value={isLoading ? "..." : stats?.departments.toString() || "14"}
						change="Stable"
						up={true}
						icon={Building03Icon}
						variant="primary"
						sub="Org units"
					/>
					<StatCard
						label="Open Positions"
						value={isLoading ? "..." : stats?.openPositions.toString() || "5"}
						change="2"
						up={false}
						icon={Briefcase02Icon}
						variant="warning"
						sub="Active requisitions"
					/>
					<StatCard
						label="Pending applicants"
						value={
							isLoading ? "..." : stats?.pendingApplicants.toString() || "0"
						}
						change="12"
						up={true}
						icon={UserAdd01Icon}
						variant="info"
						sub="Needs review"
					/>
				</section>

				{/* Row 2: Primary Operations */}
				<section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
					<RecruitmentPipeline />
					<EmploymentStatusChart />
				</section>

				{/* Row 3: Compliance & Departments */}
				<section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
					<DepartmentOverview />
					<PolicyComplianceCard />
				</section>

				{/* Row 4: Actions & Vault */}
				<section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
					<div className="xl:col-span-6">
						<RecentActivity />
					</div>
					<div className="xl:col-span-3">
						<QuickActions />
					</div>
					<div className="xl:col-span-3">
						<DocumentCompliance />
					</div>
				</section>
			</div>
		</main>
	);
}
