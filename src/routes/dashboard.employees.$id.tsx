import {
	ArrowLeft01Icon,
	Building03Icon,
	Calendar01Icon,
	Coins01Icon,
	Delete02Icon,
	File02Icon,
	JobShareIcon,
	Key01Icon,
	Mail01Icon,
	Shield01Icon,
	SmartPhone01Icon,
	UserEdit01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { ErrorComponent } from "@/components/error-component";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetEmployeeQuery } from "@/lib/redux/api/employee";

export const Route = createFileRoute("/dashboard/employees/$id")({
	errorComponent: ErrorComponent,
	pendingComponent: DashboardPending,
	component: EmployeeProfilePage,
});

function EmployeeProfilePage() {
	const { id } = Route.useParams();
	const { data: employee, isLoading, isError } = useGetEmployeeQuery(id);
	const navigate = useNavigate();

	if (isLoading) return <DashboardPending />;
	if (isError || !employee)
		return (
			<ErrorComponent
				error={new Error("The requested employee profile could not be found.")}
			/>
		);

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full bg-muted/20">
			<DashboardHeader
				category="Workforce"
				title={employee.name}
				description={`Registry profile for ${employee.position} in ${employee.department}`}
			>
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/dashboard/employees" })}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} />
					Directory
				</Button>
				<Button>
					<HugeiconsIcon icon={UserEdit01Icon} />
					Edit Record
				</Button>
			</DashboardHeader>

			<div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-6 pb-12">
				<div className="space-y-8">
					<div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
						{/* profile sidebar */}
						<div className="lg:col-span-4 w-full space-y-6">
							<Frame>
								<FramePanel className="bg-card p-8 flex flex-col items-center text-center shadow-xs">
									<UserAvatar
										src={employee.image}
										name={employee.name}
										size="lg"
										className="mb-6 h-24 w-24 rounded-2xl ring-4 ring-muted/10 shadow-sm"
									/>
									<h2 className="text-xl font-bold text-foreground/90 tracking-tight">
										{employee.name}
									</h2>
									<p className="text-sm font-semibold text-primary/60 mt-1 uppercase tracking-widest">
										{employee.position}
									</p>

									<div className="mt-8 w-full space-y-3 pt-8 border-t border-border/5">
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
												Lifecycle
											</span>
											<Badge
												variant={
													employee.status === "active" ? "success" : "warning"
												}
												showDot
												className="h-6"
											>
												{employee.status}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
												Verification
											</span>
											<Badge
												variant={
													employee.complianceStatus === "compliant"
														? "success"
														: "destructive"
												}
												className="h-6"
											>
												{employee.complianceStatus}
											</Badge>
										</div>
									</div>
								</FramePanel>
							</Frame>

							<Frame>
								<FramePanel className="bg-primary/[0.02] border-primary/10 p-6 rounded-2xl">
									<div className="flex items-center gap-3 text-primary mb-4">
										<HugeiconsIcon
											icon={Shield01Icon}
											size={18}
											strokeWidth={2}
										/>
										<span className="text-xs font-bold uppercase tracking-widest">
											Compliance Status
										</span>
									</div>
									<div className="space-y-2">
										<div className="flex items-center justify-between mb-1">
											<span className="text-xs font-semibold text-foreground/60">
												Onboarding Progress
											</span>
											<span className="text-xs font-bold text-primary">
												100%
											</span>
										</div>
										<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
											<div className="h-full bg-primary w-full" />
										</div>
									</div>
								</FramePanel>
							</Frame>
						</div>

						{/* main content tabs */}
						<div className="lg:col-span-8 w-full min-w-0">
							<Tabs defaultValue="general" className="w-full flex flex-col">
								<TabsList>
									<TabsTrigger value="general">Overview</TabsTrigger>
									<TabsTrigger value="payroll">Payroll</TabsTrigger>
									<TabsTrigger value="documents">Vault</TabsTrigger>
									<TabsTrigger value="settings">Managed</TabsTrigger>
								</TabsList>

								<TabsContent
									value="general"
									className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Frame>
											<FramePanel className="bg-card shadow-xs">
												<FrameHeader>
													<div>
														<FrameTitle>Personal Profile</FrameTitle>
														<FrameDescription>
															Primary identification details
														</FrameDescription>
													</div>
												</FrameHeader>
												<FrameContent className="space-y-6">
													<InfoRow
														label="Employee ID"
														value={employee.id || "N/A"}
														icon={UserGroupIcon}
													/>
													<InfoRow
														label="National ID"
														value={employee.idNumber || "N/A"}
														icon={Shield01Icon}
													/>
													<InfoRow
														label="Official Email"
														value={employee.email || "N/A"}
														icon={Mail01Icon}
													/>
													<InfoRow
														label="Phone Number"
														value={employee.phone || "N/A"}
														icon={SmartPhone01Icon}
													/>
												</FrameContent>
											</FramePanel>
										</Frame>

										<Frame>
											<FramePanel className="bg-card shadow-xs">
												<FrameHeader>
													<div>
														<FrameTitle>Work Information</FrameTitle>
														<FrameDescription>
															Organizational unit & hierarchy
														</FrameDescription>
													</div>
												</FrameHeader>
												<FrameContent className="space-y-6">
													<InfoRow
														label="Department"
														value={employee.department || "General"}
														icon={Building03Icon}
													/>
													<InfoRow
														label="Job Title"
														value={employee.position || "Staff"}
														icon={JobShareIcon}
													/>
													<InfoRow
														label="Reporting To"
														value={employee.manager || "System Admin"}
														icon={UserGroupIcon}
													/>
													<InfoRow
														label="Joined Date"
														value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "N/A"}
														icon={Calendar01Icon}
													/>
												</FrameContent>
											</FramePanel>
										</Frame>
									</div>
								</TabsContent>

								<TabsContent
									value="payroll"
									className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
								>
									<Frame>
										<FramePanel className="bg-card shadow-xs">
											<FrameHeader>
												<div>
													<FrameTitle>Payroll Records</FrameTitle>
													<FrameDescription>
														Compensations and statutory deductions
													</FrameDescription>
												</div>
											</FrameHeader>
											<FrameContent className="flex flex-col items-center justify-center py-24 text-center space-y-4">
												<div className="h-16 w-16 bg-muted/5 flex items-center justify-center rounded-2xl text-muted-foreground/20 border border-border/5">
													<HugeiconsIcon icon={Coins01Icon} size={32} />
												</div>
												<div className="space-y-1">
													<p className="font-bold text-foreground/80">
														No payroll cycles processed
													</p>
													<p className="text-sm text-muted-foreground font-medium max-w-xs">
														Recent earnings will appear here once the next
														payroll run is finalized.
													</p>
												</div>
											</FrameContent>
										</FramePanel>
									</Frame>
								</TabsContent>

								<TabsContent
									value="documents"
									className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
								>
									<Frame>
										<FramePanel className="bg-card shadow-xs overflow-hidden">
											<FrameHeader className="border-b-0 pb-2">
												<div>
													<FrameTitle>Document Vault</FrameTitle>
													<FrameDescription>
														Secure compliance file storage
													</FrameDescription>
												</div>
												<Button variant="outline" size="sm">
													<HugeiconsIcon icon={File02Icon} />
													Upload
												</Button>
											</FrameHeader>
											<FrameContent className="p-0">
												<div className="divide-y divide-border/5 border-t border-border/5">
													{[
														"Employment Contract",
														"Curriculum Vitae",
														"National ID Copy",
														"Medical Certificate",
													].map((doc) => (
														<div
															key={doc}
															className="flex items-center justify-between p-6 hover:bg-muted/5 transition-colors group"
														>
															<div className="flex items-center gap-4">
																<div className="h-10 w-10 rounded-xl bg-muted/10 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors border border-border/5">
																	<HugeiconsIcon icon={File02Icon} size={20} />
																</div>
																<div>
																	<p className="font-bold text-sm text-foreground/90">
																		{doc}
																	</p>
																	<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
																		pdf • verified registry
																	</p>
																</div>
															</div>
															<Button variant="ghost" size="sm">
																Download
															</Button>
														</div>
													))}
												</div>
											</FrameContent>
										</FramePanel>
									</Frame>
								</TabsContent>

								<TabsContent
									value="settings"
									className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Frame>
											<FramePanel className="bg-card shadow-xs">
												<FrameHeader>
													<div>
														<FrameTitle>Security</FrameTitle>
														<FrameDescription>
															Access control and credentials
														</FrameDescription>
													</div>
												</FrameHeader>
												<FrameContent className="space-y-4">
													<p className="text-xs text-muted-foreground font-medium leading-relaxed">
														Force a password reset or manage system-wide
														authentication preferences for this account.
													</p>
													<Button variant="outline" className="w-full">
														<HugeiconsIcon icon={Key01Icon} />
														Reset Password
													</Button>
												</FrameContent>
											</FramePanel>
										</Frame>

										<Frame>
											<FramePanel className="bg-destructive/[0.02] border-destructive/10">
												<FrameHeader>
													<div>
														<FrameTitle className="text-destructive">
															Danger Zone
														</FrameTitle>
														<FrameDescription>
															Irreversible lifecycle actions
														</FrameDescription>
													</div>
												</FrameHeader>
												<FrameContent className="space-y-4">
													<p className="text-xs text-muted-foreground font-medium leading-relaxed">
														Deactivating an account will immediately revoke all
														platform access and halt operational processing.
													</p>
													<Button variant="destructive" className="w-full">
														<HugeiconsIcon icon={Delete02Icon} />
														Terminate Access
													</Button>
												</FrameContent>
											</FramePanel>
										</Frame>
									</div>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

function InfoRow({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string;
	icon: any;
}) {
	return (
		<div className="flex items-center justify-between group">
			<div className="flex items-center gap-3">
				<div className="h-8 w-8 rounded-lg bg-muted/5 flex items-center justify-center text-muted-foreground/30 group-hover:text-primary transition-colors border border-border/5">
					<HugeiconsIcon icon={Icon} size={16} />
				</div>
				<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
					{label}
				</p>
			</div>
			<p className="text-sm font-bold text-foreground/80">{value}</p>
		</div>
	);
}
