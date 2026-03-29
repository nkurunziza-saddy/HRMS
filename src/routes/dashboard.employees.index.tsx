import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	CallIcon,
	Delete02Icon,
	Download01Icon,
	Mail01Icon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
	UserMinus01Icon,
	ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { ErrorComponent } from "@/components/error-component";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/use-employees";
import {
	useDeleteEmployeeMutation,
	useGetEmployeesQuery,
} from "@/lib/redux/api/employee";

import { useAppSelector } from "@/lib/redux/store";

export const Route = createFileRoute("/dashboard/employees/")({
	component: EmployeesPage,
});

function EmployeesPage() {
	const { activeCompanyId } = useAppSelector((state) => state.auth);
	const {
		data: employeesData,
		isLoading,
		isError,
	} = useGetEmployeesQuery(
		activeCompanyId ? { companyId: activeCompanyId } : undefined,
	);
	const [deleteEmployee] = useDeleteEmployeeMutation();
	const navigate = useNavigate();

	const initialEmployees = employeesData?.items || [];

	const {
		searchTerm,
		setSearchTerm,
		filterDept,
		setFilterDept,
		filterStatus,
		setFilterStatus,
		filteredEmployees,
		departments,
		statuses,
	} = useEmployees(initialEmployees);

	const handleTerminate = async (id: string, name: string) => {
		try {
			await deleteEmployee(id).unwrap();
			toast.success(`Contract for ${name} has been formally terminated`);
		} catch (_err) {
			toast.error("Failed to process termination");
		}
	};

	if (isLoading) return <DashboardPending />;
	if (isError)
		return (
			<ErrorComponent
				error={new Error("The employee directory could not be loaded.")}
			/>
		);

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
			<DashboardHeader
				category="Organization"
				title="Employees"
				description="Manage and monitor your global workforce directory"
			>
				<Button variant="outline">
					<HugeiconsIcon icon={Download01Icon} />
					Export
				</Button>

				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						onClick={() => navigate({ to: "/dashboard/employees/resign" })}
					>
						<HugeiconsIcon icon={UserMinus01Icon} />
						Resign
					</Button>
					<Button
						onClick={() => navigate({ to: "/dashboard/employees/onboard" })}
					>
						<HugeiconsIcon icon={PlusSignCircleIcon} />
						Onboard
					</Button>
				</div>
			</DashboardHeader>

			<div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
				<section>
					<Frame className="group/frame">
						<FramePanel className="p-0 overflow-hidden bg-card shadow-sm border-border/40">
							<FrameHeader className="border-b-0 pb-2 px-8 pt-8">
								<div>
									<FrameTitle className="text-xl font-bold">
										Employee Directory
									</FrameTitle>
									<FrameDescription className="text-sm font-medium">
										Centralized management of workforce profiles and lifecycles
									</FrameDescription>
								</div>
							</FrameHeader>

							<div className="px-8 pb-6 pt-4 flex flex-col xl:flex-row items-center justify-between gap-4 border-b border-border/5">
								<div className="relative flex-1 w-full max-w-xl">
									<HugeiconsIcon
										icon={Search01Icon}
										className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
										strokeWidth={2}
									/>
									<Input
										placeholder="Search by name, ID or position…"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all text-sm"
									/>
								</div>

								<div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
									<Select
										value={filterDept}
										onValueChange={(val) => setFilterDept(val || "all")}
									>
										<SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 w-full sm:w-48">
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
													Dept:
												</span>
												<SelectValue
													placeholder="All Units"
													className="text-sm font-semibold"
												/>
											</div>
										</SelectTrigger>
										<SelectContent>
											{departments.map((dept) => (
												<SelectItem
													key={dept}
													value={dept}
													className="text-sm font-medium"
												>
													{dept === "all" ? "All Departments" : dept}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Select
										value={filterStatus}
										onValueChange={(val) => setFilterStatus(val || "all")}
									>
										<SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 w-full sm:w-40">
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
													Status:
												</span>
												<SelectValue
													placeholder="State"
													className="text-sm font-semibold"
												/>
											</div>
										</SelectTrigger>
										<SelectContent>
											{statuses.map((status) => (
												<SelectItem
													key={status}
													value={status}
													className="capitalize text-sm font-medium"
												>
													{status === "all" ? "All States" : status}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<FrameContent className="p-0">
								{filteredEmployees.length > 0 ? (
									<Table>
										<TableHeader className="bg-muted/5">
											<TableRow className="hover:bg-transparent border-border/5">
												<TableHead className="pl-8 py-3">Employee</TableHead>
												<TableHead className="px-4 py-3">
													Status & Onboarding
												</TableHead>
												<TableHead className="px-4 py-3">
													Contact Detail
												</TableHead>
												<TableHead className="px-4 py-3">Department</TableHead>
												<TableHead className="px-4 py-3">
													ID Reference
												</TableHead>
												<TableHead className="pr-8 py-3 text-right">
													Actions
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredEmployees.map((user) => (
												<TableRow
													key={user.id}
													className="border-border/5 group transition-colors"
												>
													<TableCell className="pl-8 py-3">
														<div className="flex items-center gap-3">
															<UserAvatar
																name={user.name || "Employee"}
																src={user.image}
																size="default"
																className="h-10 w-10 rounded-xl"
															/>
															<div className="flex flex-col gap-0.5">
																<span className="text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors">
																	{user.name || "Employee"}
																</span>
																<span className="text-[11px] font-semibold text-muted-foreground/50">
																	{user.position || "Staff"}
																</span>
															</div>
														</div>
													</TableCell>
													<TableCell className="px-4 py-3">
														<div className="flex flex-col gap-2 min-w-[140px]">
															<Badge
																variant={
																	user.status === "active"
																		? "success"
																		: user.status === "probation"
																			? "warning"
																			: user.status === "resigned"
																				? "muted"
																				: "destructive"
																}
																className="h-5 text-[9px] font-black uppercase tracking-widest w-fit"
															>
																{user.status}
															</Badge>
															{user.onboardingProgress < 100 && (
																<div className="space-y-1.5 w-full">
																	<div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/40">
																		<span>
																			Setup: {user.onboardingProgress}%
																		</span>
																	</div>
																	<div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
																		<div
																			className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.4)]"
																			style={{
																				width: `${user.onboardingProgress}%`,
																			}}
																		/>
																	</div>
																</div>
															)}
														</div>
													</TableCell>
													<TableCell className="px-4 py-3">
														<div className="flex flex-col gap-1">
															<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60">
																<HugeiconsIcon icon={Mail01Icon} size={12} />
																<span className="truncate max-w-[160px]">
																	{user.email || "N/A"}
																</span>
															</div>
															<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60">
																<HugeiconsIcon icon={CallIcon} size={12} />
																<span>{user.phone || "N/A"}</span>
															</div>
														</div>
													</TableCell>
													<TableCell className="px-4 py-3">
														<Badge
															variant="muted"
															className="bg-muted/10 border-none font-bold text-[10px] uppercase tracking-widest"
														>
															{user.department || "General"}
														</Badge>
													</TableCell>
													<TableCell className="px-4 py-3">
														<span className="text-xs font-bold text-foreground/60 tabular-nums">
															{(user.idNumber || "00000000").slice(-8)}
														</span>
													</TableCell>
													<TableCell className="pr-8 py-3 text-right">
														<div className="flex items-center justify-end">
															<DropdownMenu>
																<DropdownMenuTrigger
																	render={
																		<Button
																			variant="ghost"
																			size="icon-sm"
																			aria-label="Employee actions"
																		>
																			<HugeiconsIcon icon={MoreHorizontalIcon} />
																		</Button>
																	}
																/>
																<DropdownMenuContent
																	align="end"
																	className="w-52 rounded-2xl border-border/40 shadow-2xl p-2"
																>
																	<DropdownMenuItem
																		render={
																			<Link
																				to="/dashboard/employees/$id"
																				params={{ id: user.id }}
																			/>
																		}
																		className="rounded-xl py-1.5 font-semibold text-sm"
																	>
																		<HugeiconsIcon
																			icon={ViewIcon}
																			className="size-4 mr-3 text-muted-foreground/60"
																		/>
																		<span>Profile Details</span>
																	</DropdownMenuItem>
																	<DropdownMenuItem className="rounded-xl py-1.5 font-semibold text-sm">
																		<HugeiconsIcon
																			icon={Mail01Icon}
																			className="size-4 mr-3 text-muted-foreground/60"
																		/>
																		<span>Messaging</span>
																	</DropdownMenuItem>
																	<DropdownMenuSeparator className="bg-border/5 my-1" />
																	<AlertDialog>
																		<AlertDialogTrigger
																			render={
																				<DropdownMenuItem
																					onSelect={(e) => e.preventDefault()}
																					className="rounded-xl py-1.5 font-semibold text-sm text-destructive focus:bg-destructive/5"
																				>
																					<HugeiconsIcon
																						icon={Delete02Icon}
																						className="size-4 mr-3"
																					/>
																					<span>Terminate</span>
																				</DropdownMenuItem>
																			}
																		/>
																		<AlertDialogContent>
																			<AlertDialogHeader>
																				<AlertDialogTitle>
																					Permanent Termination
																				</AlertDialogTitle>
																				<AlertDialogDescription>
																					Are you sure you want to terminate{" "}
																					{user.name}'s employment? This will
																					immediately halt payroll and revoke
																					all system access.
																				</AlertDialogDescription>
																			</AlertDialogHeader>
																			<AlertDialogFooter>
																				<AlertDialogCancel>
																					Abort
																				</AlertDialogCancel>
																				<AlertDialogAction
																					onClick={() =>
																						handleTerminate(user.id, user.name)
																					}
																					className="bg-destructive hover:bg-destructive/90"
																				>
																					Finalize Termination
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
								) : (
									<div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
										<div className="size-16 rounded-3xl bg-muted/5 flex items-center justify-center text-muted-foreground/20 border border-border/5">
											<HugeiconsIcon icon={Search01Icon} size={32} />
										</div>
										<div className="space-y-1">
											<p className="text-base font-bold text-foreground/80">
												No results matched
											</p>
											<p className="text-sm font-medium text-muted-foreground/40 max-w-xs">
												Adjust your filters or search term to find what you're
												looking for.
											</p>
										</div>
									</div>
								)}
							</FrameContent>

							<FrameFooter className="px-8 py-6 border-t border-border/5 flex items-center justify-between">
								<span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.25em]">
									Registry Ledger: {filteredEmployees.length} active records
								</span>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon-sm"
										className="size-8 rounded-lg text-muted-foreground/40 hover:text-primary transition-colors"
									>
										<HugeiconsIcon
											icon={ArrowLeft01Icon}
											size={14}
											strokeWidth={2.5}
										/>
									</Button>
									<div className="h-8 px-3 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-black flex items-center justify-center">
										1
									</div>
									<Button
										variant="ghost"
										size="icon-sm"
										className="size-8 rounded-lg text-muted-foreground/40 hover:text-primary transition-colors"
									>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											size={14}
											strokeWidth={2.5}
										/>
									</Button>
								</div>
							</FrameFooter>
						</FramePanel>
					</Frame>
				</section>
			</div>
		</main>
	);
}
