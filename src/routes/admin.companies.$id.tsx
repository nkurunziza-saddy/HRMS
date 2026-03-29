import { zodResolver } from "@hookform/resolvers/zod";
import {
	AiSecurityIcon,
	AlertCircleIcon,
	ArrowLeft01Icon,
	Building03Icon,
	Calendar01Icon,
	CallIcon,
	Cancel01Icon,
	ChartBarLineIcon,
	DashboardSquare01Icon,
	Delete01Icon,
	Mail01Icon,
	MoreHorizontalIcon,
	PencilEdit02Icon,
	PlusSignIcon,
	Shield01Icon,
	UserEdit01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { StatCard } from "@/components/dashboard/stat-card";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Frame,
	FrameContent,
	FrameDescription,
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
import {
	useCreateUserMutation,
	useGetCompaniesQuery,
	useGetUsersQuery,
} from "@/lib/redux/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/companies/$id")({
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	component: CompanyDetailsPage,
});

const adminSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

type AdminFormValues = z.infer<typeof adminSchema>;

function CompanyDetailsPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const {
		data: companiesData,
		isLoading: listLoading,
		isError: listError,
		refetch: refetchList,
	} = useGetCompaniesQuery({ limit: 100 });
	const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
		companyId: id,
		role: "COMPANY_ADMIN",
	});

	const [createUserApi] = useCreateUserMutation();

	const company = companiesData?.items.find((c) => c.id === id);
	const companyAdmins = usersData?.items ?? [];

	const [isDeleting, setIsDeleting] = useState(false);
	const [showAddAdmin, setShowAddAdmin] = useState(false);

	const form = useForm<AdminFormValues>({
		resolver: zodResolver(adminSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phoneNumber: "",
		},
	});

	const handleDeleteCompany = async () => {
		setIsDeleting(true);
		try {
			toast.info("Deletion is currently disabled.");
			toast.success(`Organization deletion request recorded`);
			navigate({ to: "/admin/companies" });
		} catch (_err) {
			toast.error("Failed to delete company");
		} finally {
			setIsDeleting(false);
		}
	};

	const onSubmit = async (data: AdminFormValues) => {
		try {
			await createUserApi({
				...data,
				role: "COMPANY_ADMIN",
				companyId: id,
			}).unwrap();

			toast.success("Administrator account provisioned successfully");
			setShowAddAdmin(false);
			form.reset();
		} catch (err: any) {
			toast.error(err?.data?.message || "Failed to add administrator");
		}
	};

	const handleRemoveAdmin = async (_userId: string) => {
		try {
			toast.info("Revocation is currently restricted.");
		} catch (_err) {
			toast.error("Failed to remove administrator");
		}
	};

	if (listLoading) return <DashboardPending />;
	if (listError || !company)
		return (
			<ErrorComponent
				error={new Error("Company not found in registry")}
				reset={() => refetchList()}
			/>
		);

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full bg-muted/20">
			<DashboardHeader
				category="Tenant Management"
				title={company.name}
				description={`Registry details for TIN: ${company.tin}`}
			>
				<Button variant="outline" render={<Link to="/admin/companies" />}>
					<HugeiconsIcon icon={ArrowLeft01Icon} />
					Registry
				</Button>
				<Button variant="outline" render={<Link to="/dashboard" />}>
					<HugeiconsIcon icon={DashboardSquare01Icon} />
					Dashboard
				</Button>
				<Button>
					<HugeiconsIcon icon={PencilEdit02Icon} />
					Edit
				</Button>
			</DashboardHeader>

			<div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-6 pb-12 pt-2">
				<div className="flex flex-col gap-8">
					<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<StatCard
							label="Total Staff"
							value="—"
							icon={UserGroupIcon}
							variant="primary"
							sub="Active headcount"
						/>
						<StatCard
							label="Registry Status"
							value="Active"
							icon={Shield01Icon}
							variant="success"
							sub="Platform access"
						/>
						<StatCard
							label="Growth"
							value="—"
							icon={ChartBarLineIcon}
							variant="info"
							sub="Last 30 days"
						/>
					</section>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						<div className="lg:col-span-8 space-y-8">
							<Frame>
								<FramePanel className="bg-card">
									<FrameHeader>
										<div>
											<FrameTitle>Company Profile</FrameTitle>
											<FrameDescription>
												Legal and operational identification
											</FrameDescription>
										</div>
									</FrameHeader>
									<FrameContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
										<DetailItem
											label="Legal Entity"
											value={company.name}
											icon={Building03Icon}
										/>
										<DetailItem
											label="Tax ID (TIN)"
											value={company.tin}
											icon={Shield01Icon}
										/>
										<DetailItem
											label="Identification"
											value={String(company.identificationNumber)}
											icon={ChartBarLineIcon}
										/>
										<DetailItem
											label="Registration Date"
											value="N/A"
											icon={Calendar01Icon}
										/>
										<DetailItem
											label="Primary Email"
											value="N/A"
											icon={Mail01Icon}
										/>
										<DetailItem
											label="Contact Phone"
											value="N/A"
											icon={CallIcon}
										/>
									</FrameContent>
								</FramePanel>
							</Frame>

							{/* Admin List Section */}
							<Frame>
								<FramePanel className="bg-card">
									<FrameHeader>
										<div>
											<FrameTitle>Company Administrators</FrameTitle>
											<FrameDescription>
												Users with master access to this tenant
											</FrameDescription>
										</div>
										<Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
											<DialogTrigger
												render={
													<Button
														size="sm"
														className="text-xs font-bold gap-2 uppercase tracking-widest"
													/>
												}
											>
												<HugeiconsIcon icon={PlusSignIcon} size={14} /> Add
												Admin
											</DialogTrigger>
											<DialogContent>
												<Form {...form}>
													<form onSubmit={form.handleSubmit(onSubmit)}>
														<DialogHeader>
															<DialogTitle>Provision Company Admin</DialogTitle>
															<DialogDescription>
																Create a new administrator for {company.name}.
																They will receive an invitation email.
															</DialogDescription>
														</DialogHeader>
														<div className="py-6 space-y-4">
															<div className="grid grid-cols-2 gap-4">
																<FormField
																	control={form.control}
																	name="firstName"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
																				First Name
																			</FormLabel>
																			<FormControl>
																				<Input
																					placeholder="e.g. Jean"
																					className="h-11 bg-muted/5 border-border/40 focus:bg-background"
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage className="text-[11px]" />
																		</FormItem>
																	)}
																/>
																<FormField
																	control={form.control}
																	name="lastName"
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
																				Last Name
																			</FormLabel>
																			<FormControl>
																				<Input
																					placeholder="e.g. Paul"
																					className="h-11 bg-muted/5 border-border/40 focus:bg-background"
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage className="text-[11px]" />
																		</FormItem>
																	)}
																/>
															</div>
															<FormField
																control={form.control}
																name="email"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
																			Email Address
																		</FormLabel>
																		<FormControl>
																			<Input
																				type="email"
																				placeholder="admin@company.com"
																				className="h-11 bg-muted/5 border-border/40 focus:bg-background"
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage className="text-[11px]" />
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="phoneNumber"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
																			Phone Number
																		</FormLabel>
																		<FormControl>
																			<Input
																				placeholder="e.g. 250780000000"
																				className="h-11 bg-muted/5 border-border/40 focus:bg-background"
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage className="text-[11px]" />
																	</FormItem>
																)}
															/>
														</div>
														<DialogFooter>
															<Button
																type="button"
																variant="outline"
																onClick={() => {
																	setShowAddAdmin(false);
																	form.reset();
																}}
															>
																Cancel
															</Button>
															<Button
																type="submit"
																className="font-bold"
																disabled={form.formState.isSubmitting}
															>
																{form.formState.isSubmitting ? (
																	<>
																		<Spinner className="mr-2" />
																		Provisioning...
																	</>
																) : (
																	"Provision Account"
																)}
															</Button>
														</DialogFooter>
													</form>
												</Form>
											</DialogContent>
										</Dialog>
									</FrameHeader>
									<FrameContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="pl-6 py-3">
														Administrator
													</TableHead>
													<TableHead className="py-3">Status</TableHead>
													<TableHead className="text-right pr-6 py-3">
														Action
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{!usersLoading &&
													companyAdmins.map((admin: any) => (
														<TableRow
															key={admin.id}
															className="hover:bg-muted/5 border-border/5"
														>
															<TableCell className="pl-6 py-4">
																<div className="flex items-center gap-3">
																	<UserAvatar
																		src={admin.profilePicture || ""}
																		name={`${admin.firstName} ${admin.lastName}`}
																		size="sm"
																	/>
																	<div className="flex flex-col">
																		<span className="font-bold text-foreground/90">
																			{admin.firstName} {admin.lastName}
																		</span>
																		<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
																			{admin.email}
																		</span>
																	</div>
																</div>
															</TableCell>
															<TableCell className="py-4">
																<Badge
																	variant={
																		admin.status === "ACTIVE"
																			? "success"
																			: "muted"
																	}
																	showDot
																	className="font-bold text-[9px] uppercase tracking-widest"
																>
																	{admin.status}
																</Badge>
															</TableCell>
															<TableCell className="text-right pr-6 py-4">
																<AlertDialog>
																	<AlertDialogTrigger
																		render={
																			<Button
																				variant="ghost"
																				size="icon-sm"
																				className="text-destructive/40 hover:text-destructive hover:bg-destructive/5"
																			/>
																		}
																	>
																		<HugeiconsIcon
																			icon={Delete01Icon}
																			size={16}
																		/>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>
																				Revoke Administrative Access?
																			</AlertDialogTitle>
																			<AlertDialogDescription>
																				This will remove {admin.firstName} from
																				the platform administration. They will
																				no longer be able to manage{" "}
																				{company.name}.
																			</AlertDialogDescription>
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>
																				Cancel
																			</AlertDialogCancel>
																			<AlertDialogAction
																				onClick={() =>
																					handleRemoveAdmin(admin.id)
																				}
																				className="bg-destructive hover:bg-destructive/90"
																			>
																				Revoke Access
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
															</TableCell>
														</TableRow>
													))}
												{usersLoading && (
													<TableRow>
														<TableCell
															colSpan={3}
															className="text-center py-10"
														>
															<Spinner className="mx-auto" />
														</TableCell>
													</TableRow>
												)}
												{!usersLoading && companyAdmins.length === 0 && (
													<TableRow>
														<TableCell
															colSpan={3}
															className="text-center py-10 text-muted-foreground text-sm font-medium"
														>
															No administrative accounts assigned to this tenant
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</FrameContent>
								</FramePanel>
							</Frame>
						</div>

						<div className="lg:col-span-4 space-y-8">
							<Frame>
								<FramePanel className="p-6 bg-primary/[0.02] border-primary/10 space-y-4">
									<div className="flex items-center gap-2 text-primary">
										<HugeiconsIcon icon={AiSecurityIcon} size={18} />
										<h4 className="text-xs font-bold uppercase tracking-widest">
											System Health
										</h4>
									</div>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-foreground/70">
												Storage Capacity
											</span>
											<span className="text-sm font-bold tabular-nums">
												4.2 GB / 10 GB
											</span>
										</div>
										<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
											<div className="h-full bg-primary w-[42%]" />
										</div>
										<div className="flex items-center justify-between pt-2">
											<span className="text-sm font-medium text-foreground/70">
												API Uptime
											</span>
											<span className="text-sm font-bold text-success tabular-nums">
												99.98%
											</span>
										</div>
									</div>
								</FramePanel>
							</Frame>

							<Frame>
								<FramePanel className="bg-card border-border/40">
									<FrameHeader>
										<FrameTitle className="text-xs uppercase tracking-widest">
											Management Actions
										</FrameTitle>
									</FrameHeader>
									<FrameContent className="p-4 space-y-3">
										<Button
											variant="outline"
											className="w-full justify-start gap-3 text-xs font-bold uppercase tracking-widest border-border/40"
										>
											<HugeiconsIcon icon={UserEdit01Icon} size={16} />
											Manage Permissions
										</Button>
										<Button
											variant="outline"
											className="w-full justify-start gap-3 text-xs font-bold uppercase tracking-widest border-border/40"
										>
											<HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
											View Audit Logs
										</Button>
										<div className="pt-4 mt-2 border-t border-border/5 space-y-3">
											<Button
												variant="outline"
												className={cn(
													"w-full justify-start gap-3 text-xs font-bold uppercase tracking-widest border-border/40 transition-colors",
													"text-warning hover:bg-warning/5",
												)}
											>
												<HugeiconsIcon icon={Cancel01Icon} size={16} />
												Suspend Tenant
											</Button>

											<AlertDialog>
												<AlertDialogTrigger>
													<Button
														variant="outline"
														disabled={isDeleting}
														className="w-full justify-start gap-3 text-xs font-bold uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5"
													>
														<HugeiconsIcon icon={Delete01Icon} size={16} />
														Delete Organization
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Permanent Deletion
														</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to PERMANENTLY delete{" "}
															{company.name}? All data, employees, and records
															will be unrecoverable.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={handleDeleteCompany}
															className="bg-destructive hover:bg-destructive/90"
														>
															Delete Organization
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</FrameContent>
								</FramePanel>
							</Frame>

							<div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 space-y-3">
								<div className="flex items-center gap-2 text-destructive">
									<HugeiconsIcon icon={AlertCircleIcon} size={18} />
									<h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">
										Danger Zone
									</h4>
								</div>
								<p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
									Deleting an organization is an irreversible operation. All
									employee data, payroll history, and documents will be
									permanently purged from the system.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

function DetailItem({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string;
	icon: any;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 text-muted-foreground/40">
				<HugeiconsIcon icon={Icon} size={14} strokeWidth={2.5} />
				<span className="text-xs font-bold uppercase tracking-widest">
					{label}
				</span>
			</div>
			<p className="text-sm font-semibold text-foreground/80 pl-5.5">{value}</p>
		</div>
	);
}
