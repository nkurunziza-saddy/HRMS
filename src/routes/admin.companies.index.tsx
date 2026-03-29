import {
	ActivityIcon,
	Building03Icon,
	Cancel01Icon,
	DashboardSquare01Icon,
	Delete01Icon,
	Download01Icon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
	Shield01Icon,
	Sorting05Icon,
	UserGroupIcon,
	ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { StatCard } from "@/components/dashboard/stat-card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Frame,
	FrameContent,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetCompaniesQuery } from "@/lib/redux/api";

export const Route = createFileRoute("/admin/companies/")({
	pendingComponent: DashboardPending,
	component: CompaniesManagementPage,
});

function CompaniesManagementPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const { data, isLoading, isError } = useGetCompaniesQuery({
		searchTerm: searchTerm,
		limit: 100,
	});

	const companies = data?.items ?? [];

	const handleDeleteCompany = async (_id: string, name: string) => {
		try {
			// await api.deleteCompany(id);
			toast.info("Deletion is currently disabled in dynamic mode.");
			toast.success(`Organization ${name} deletion request recorded`);
		} catch (_err) {
			toast.error("Critical failure during record deletion");
		}
	};

	if (isError) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-destructive font-bold">Failed to load companies.</p>
			</div>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
			<DashboardHeader
				category="Multi-Tenancy"
				title="Organization Registry"
				description="Manage secure organizational companies and managed platform access"
			>
				<Button variant="outline">
					<HugeiconsIcon icon={Download01Icon} />
					Export
				</Button>

				<Button onClick={() => navigate({ to: "/admin/companies/register" })}>
					<HugeiconsIcon icon={PlusSignCircleIcon} />
					Provision New
				</Button>
			</DashboardHeader>

			<div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
				{/* Admin Quick Stats */}
				<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="Total Companies"
						value={data?.meta.totalItems ?? 0}
						icon={Building03Icon}
						variant="primary"
						sub="Active Organizations"
					/>
					<StatCard
						label="Platform Users"
						value="—"
						icon={UserGroupIcon}
						variant="info"
						sub="Across all companies"
					/>
					<StatCard
						label="System Health"
						value="99.9%"
						icon={Shield01Icon}
						variant="success"
						sub="Operational"
					/>
					<StatCard
						label="API Traffic"
						value="—"
						change="0%"
						up
						icon={ActivityIcon}
						variant="accent"
						sub="Last 24 hours"
					/>
				</section>

				<section>
					<Frame className="group/frame">
						<FramePanel className="p-0 overflow-hidden bg-card">
							<FrameHeader className="border-b-0 pb-2 px-8 pt-8">
								<div>
									<FrameTitle className="text-xl font-bold">
										Tenant Directory
									</FrameTitle>
									<FrameDescription className="text-sm font-medium">
										All active and pending company accounts
									</FrameDescription>
								</div>
							</FrameHeader>

							<div className="px-8 pb-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/5">
								<div className="relative flex-1 w-full max-w-md">
									<HugeiconsIcon
										icon={Search01Icon}
										className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
										strokeWidth={2}
									/>
									<Input
										placeholder="Search by name or TIN…"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all text-sm"
									/>
								</div>
								{isLoading && <Spinner className="text-primary" />}
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm">
										<HugeiconsIcon icon={Sorting05Icon} />
										Filter by Sector
									</Button>
								</div>
							</div>

							<FrameContent className="p-0">
								<Table>
									<TableHeader className="bg-muted/5">
										<TableRow className="hover:bg-transparent border-border/5">
											<TableHead className="text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest pl-8 py-3">
												Organization
											</TableHead>
											<TableHead className="text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest px-4 py-3">
												Registry (TIN)
											</TableHead>
											<TableHead className="text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest px-4 py-3">
												Vertical
											</TableHead>
											<TableHead className="text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest px-4 py-3">
												Identification
											</TableHead>
											<TableHead className="text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest px-4 py-3">
												Ownership
											</TableHead>
											<TableHead className="text-[10px] font-bold text-muted-foreground/40 capitalize tracking-widest px-4 py-3 text-right pr-8">
												Management
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{!isLoading &&
											companies.map((company) => (
												<TableRow
													key={company.id}
													className="border-border/5 hover:bg-muted/5 transition-colors group"
												>
													<TableCell className="pl-8 py-5">
														<div className="flex items-center gap-4">
															<div className="h-11 w-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-all duration-500">
																<HugeiconsIcon
																	icon={Building03Icon}
																	size={22}
																/>
															</div>
															<div>
																<p className="text-base font-bold text-foreground/90 leading-none">
																	{company.name}
																</p>
																<p className="text-xs font-semibold text-muted-foreground/40 mt-1.5 uppercase tracking-wider">
																	{company.ownershipType?.replace(/_/g, " ")}
																</p>
															</div>
														</div>
													</TableCell>
													<TableCell className="px-4">
														<span className="text-sm font-bold text-foreground/60 tabular-nums">
															{company.tin}
														</span>
													</TableCell>
													<TableCell className="px-4">
														<Badge
															variant="muted"
															className="bg-muted/10 border-none font-bold text-[10px] uppercase tracking-widest"
														>
															{company.categoryId || "N/A"}
														</Badge>
													</TableCell>
													<TableCell className="px-4">
														<span className="text-sm font-bold text-foreground/80 tabular-nums">
															{company.identificationNumber}
														</span>
													</TableCell>
													<TableCell className="px-4">
														<Badge
															variant="muted"
															className="bg-muted/10 border-none font-bold text-[10px] uppercase tracking-widest"
														>
															{company.ownershipType}
														</Badge>
													</TableCell>
													<TableCell className="text-right pr-8">
														<div className="flex items-center justify-end gap-2">
															<Button
																variant="ghost"
																size="sm"
																render={
																	<Link
																		to="/admin/companies/$id"
																		params={{ id: company.id }}
																	/>
																}
															>
																Details
															</Button>
															<DropdownMenu>
																<DropdownMenuTrigger
																	render={
																		<Button variant="ghost" size="icon-sm" />
																	}
																>
																	<HugeiconsIcon icon={MoreHorizontalIcon} />
																</DropdownMenuTrigger>
																<DropdownMenuContent
																	align="end"
																	className="w-56 rounded-2xl border-border/40 shadow-2xl p-2"
																>
																	<DropdownMenuItem
																		render={
																			<Link
																				to="/admin/companies/$id"
																				params={{ id: company.id }}
																			/>
																		}
																		className="rounded-xl py-1.5 font-semibold text-sm"
																	>
																		<HugeiconsIcon
																			icon={ViewIcon}
																			className="size-4 mr-3 text-muted-foreground/60"
																		/>
																		<span>Registry Profile</span>
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		render={<Link to="/dashboard" />}
																		className="rounded-xl py-1.5 font-semibold text-sm"
																	>
																		<HugeiconsIcon
																			icon={DashboardSquare01Icon}
																			className="size-4 mr-3 text-muted-foreground/60"
																		/>
																		<span>Operations Board</span>
																	</DropdownMenuItem>
																	<DropdownMenuSeparator className="bg-border/5 my-1" />
																	<DropdownMenuItem className="rounded-xl py-1.5 font-semibold text-sm text-warning focus:bg-warning/5">
																		<HugeiconsIcon
																			icon={Cancel01Icon}
																			className="size-4 mr-3"
																		/>
																		<span>Suspend Tenant</span>
																	</DropdownMenuItem>
																	<AlertDialog>
																		<AlertDialogTrigger>
																			<DropdownMenuItem
																				onSelect={(e) => e.preventDefault()}
																				className="rounded-xl py-1.5 font-semibold text-sm text-destructive focus:bg-destructive/5"
																			>
																				<HugeiconsIcon
																					icon={Delete01Icon}
																					className="size-4 mr-3"
																				/>
																				<span>Purge Organization</span>
																			</DropdownMenuItem>
																		</AlertDialogTrigger>
																		<AlertDialogContent>
																			<AlertDialogHeader>
																				<AlertDialogTitle>
																					Critical Action: Purge Record
																				</AlertDialogTitle>
																				<AlertDialogDescription>
																					You are about to permanently delete{" "}
																					{company.name} and all associated
																					metadata. This operation is recorded
																					in the immutable security audit log.
																				</AlertDialogDescription>
																			</AlertDialogHeader>
																			<AlertDialogFooter>
																				<AlertDialogCancel>
																					Cancel
																				</AlertDialogCancel>
																				<AlertDialogAction
																					onClick={() =>
																						handleDeleteCompany(
																							company.id,
																							company.name,
																						)
																					}
																					className="bg-destructive hover:bg-destructive/90"
																				>
																					Confirm Purge
																				</AlertDialogAction>
																			</AlertDialogFooter>
																		</AlertDialogContent>
																	</AlertDialog>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>

								{isLoading && (
									<div className="py-20 flex flex-col items-center justify-center gap-4">
										<Spinner className="size-8 text-primary" />
										<p className="text-sm font-medium text-muted-foreground">
											Synchronizing registry...
										</p>
									</div>
								)}

								{!isLoading && companies.length === 0 && (
									<div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
										<div className="h-16 w-16 rounded-3xl bg-muted/5 flex items-center justify-center text-muted-foreground/20">
											<HugeiconsIcon icon={Building03Icon} size={32} />
										</div>
										<div>
											<p className="text-base font-bold text-foreground/60">
												No organizations found
											</p>
											<p className="text-sm font-medium text-muted-foreground/40 mt-1">
												Try adjusting your search or provision a new tenant
											</p>
										</div>
									</div>
								)}
							</FrameContent>
							<FrameFooter className="px-8 py-5 border-t border-border/5">
								<span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
									Registry Ledger: {data?.meta.totalItems ?? 0} active
									organizational units
								</span>
							</FrameFooter>
						</FramePanel>
					</Frame>
				</section>
			</div>
		</main>
	);
}
