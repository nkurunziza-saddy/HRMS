import {
	ArrowUpRight01Icon,
	Building03Icon,
	File02Icon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Shield01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetCompaniesQuery, useGetUsersQuery } from "@/lib/redux/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
	pendingComponent: DashboardPending,
	component: AdminDashboard,
});

function AdminDashboard() {
	const { data: companiesData, isLoading: companiesLoading } =
		useGetCompaniesQuery({ limit: 5 });
	const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
		limit: 1,
	});

	const companies = companiesData?.items ?? [];
	const totalCompanies = companiesData?.meta.totalItems ?? 0;
	const totalUsers = usersData?.meta.totalItems ?? 0;

	const _logs = [
		{
			id: "1",
			level: "security",
			event: "Failed login attempt — brute-force threshold reached",
			actor: "unknown@external.io",
			timestamp: "Today, 08:14 AM",
			ipAddress: "41.186.32.11",
		},
		{
			id: "2",
			level: "info",
			event: "New company tenant provisioned",
			actor: "admin@hrms.com",
			timestamp: "Today, 07:52 AM",
			ipAddress: "192.168.1.1",
		},
		{
			id: "3",
			level: "info",
			event: "System backup completed successfully",
			actor: "system@hrms.com",
			timestamp: "Today, 03:00 AM",
			ipAddress: "127.0.0.1",
		},
		{
			id: "4",
			level: "security",
			event: "API key rotated — previous key revoked",
			actor: "superadmin@hrms.com",
			timestamp: "Yesterday, 11:30 PM",
			ipAddress: "10.0.0.5",
		},
	];

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full">
			<DashboardHeader
				category="Platform Console"
				title="System Overview"
				description="Monitor global platform performance and tenant activity"
			>
				<Button variant="outline">
					<HugeiconsIcon icon={ArrowUpRight01Icon} />
					Reports
				</Button>
				<Button render={<Link to="/admin/companies/register" />}>
					<HugeiconsIcon icon={PlusSignCircleIcon} />
					New Company
				</Button>
			</DashboardHeader>

			<div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-6 pb-12 pt-2">
				<div className="flex flex-col gap-8">
					{/* shared stat cards (3) */}
					<section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<StatCard
							label="Total Companies"
							value={companiesLoading ? "..." : totalCompanies}
							change="+3"
							up
							icon={Building03Icon}
							variant="primary"
							sub="Active on platform"
						/>
						<StatCard
							label="Total Users"
							value={usersLoading ? "..." : totalUsers}
							change="+0"
							up
							icon={UserGroupIcon}
							variant="info"
							sub="Across all companies"
						/>
						<StatCard
							label="System Health"
							value="99.9%"
							icon={Shield01Icon}
							variant="success"
							sub="No active incidents"
						/>
					</section>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						{/* overview column 1 */}
						<div className="lg:col-span-8 space-y-8">
							{/* users overview */}
							<Frame>
								<FramePanel className="bg-card">
									<FrameHeader>
										<div>
											<FrameTitle>Recently Provisioned Tenants</FrameTitle>
											<FrameDescription>
												Latest organizations added to the platform
											</FrameDescription>
										</div>
										<Button
											variant="ghost"
											size="sm"
											render={<Link to="/admin/companies" />}
										>
											View All
										</Button>
									</FrameHeader>
									<FrameContent className="p-0">
										{companiesLoading ? (
											<div className="p-8 flex justify-center">
												<Spinner />
											</div>
										) : (
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Organization</TableHead>
														<TableHead>TIN</TableHead>
														<TableHead>Identification</TableHead>
														<TableHead>Status</TableHead>
														<TableHead className="w-[50px]"></TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{companies.map((company) => {
														return (
															<TableRow key={company.id}>
																<TableCell>
																	<div className="flex items-center gap-3">
																		<div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
																			{company.name.charAt(0)}
																		</div>
																		<div className="flex flex-col">
																			<span className="font-bold text-foreground/90">
																				{company.name}
																			</span>
																			<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
																				{company.ownershipType?.replace(
																					/_/g,
																					" ",
																				)}
																			</span>
																		</div>
																	</div>
																</TableCell>
																<TableCell>
																	<span className="text-sm font-semibold text-muted-foreground tabular-nums">
																		{company.tin}
																	</span>
																</TableCell>
																<TableCell>
																	<span className="text-sm font-semibold text-muted-foreground tabular-nums">
																		{company.identificationNumber}
																	</span>
																</TableCell>
																<TableCell>
																	<Badge
																		variant={
																			company.status === "active"
																				? "success"
																				: "muted"
																		}
																		showDot
																		className="font-bold text-[9px] uppercase"
																	>
																		{company.status}
																	</Badge>
																</TableCell>
																<TableCell>
																	<Button
																		variant="ghost"
																		size="icon-sm"
																		className="text-muted-foreground/40"
																		render={
																			<Link
																				to="/admin/companies/$id"
																				params={{ id: company.id }}
																			/>
																		}
																	>
																		<HugeiconsIcon
																			icon={MoreHorizontalIcon}
																			size={16}
																		/>
																	</Button>
																</TableCell>
															</TableRow>
														);
													})}
													{companies.length === 0 && (
														<TableRow>
															<TableCell
																colSpan={5}
																className="text-center py-8 text-muted-foreground"
															>
																No companies provisioned yet.
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										)}
									</FrameContent>
								</FramePanel>
							</Frame>

							<Frame>
								<FramePanel className="bg-card">
									<FrameHeader>
										<div className="flex items-center gap-3">
											<div>
												<FrameTitle>Security Audit Logs</FrameTitle>
												<FrameDescription>
													Immutable system-level event tracking
												</FrameDescription>
											</div>
										</div>
										<Button variant="outline" size="sm">
											Audit Trail
										</Button>
									</FrameHeader>
									<FrameContent className="p-0">
										<div className="divide-y divide-border/5">
											{_logs.slice(0, 4).map((log: any) => (
												<div
													key={log.id}
													className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors group"
												>
													<div className="flex items-start gap-4">
														<div
															className={cn(
																"h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300",
																log.level === "security"
																	? "bg-destructive/10 text-destructive border-destructive/20"
																	: "bg-info/10 text-info border-info/20",
															)}
														>
															<HugeiconsIcon icon={File02Icon} size={20} />
														</div>
														<div className="space-y-1">
															<p className="text-sm font-bold text-foreground/90 leading-tight">
																{log.event}
															</p>
															<div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
																<span>{log.actor}</span>
																<span>•</span>
																<span>{log.timestamp}</span>
															</div>
														</div>
													</div>
													<Badge
														variant="muted"
														className="bg-muted/10 border-none tabular-nums text-[9px]"
													>
														{log.ipAddress}
													</Badge>
												</div>
											))}
											{_logs.length === 0 && (
												<div className="p-10 text-center text-muted-foreground text-sm font-medium">
													Registry activity is currently being indexed...
												</div>
											)}
										</div>
									</FrameContent>
								</FramePanel>
							</Frame>
						</div>

						{/* overview column 2 */}
						<div className="lg:col-span-4 space-y-8">
							<QuickActions />
							<RecentActivity />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
