import {
	ArrowLeft01Icon,
	Building03Icon,
	Calendar01Icon,
	CheckmarkCircle01Icon,
	Coins01Icon,
	Delete02Icon,
	File02Icon,
	FileUploadIcon,
	JobShareIcon,
	Key01Icon,
	Mail01Icon,
	PlusSignCircleIcon,
	Shield01Icon,
	SmartPhone01Icon,
	UserEdit01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Frame,
	FrameContent,
	FrameDescription,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAddEmployeeDocumentMutation, useGetEmployeeDocumentsQuery, useGetEmployeeQuery } from "@/lib/redux/api/employee";
import { cn } from "@/lib/utils";
import type { DocumentPhase, DocumentType } from "@/types";

export const Route = createFileRoute("/dashboard/employees/$id")({
	errorComponent: ErrorComponent,
	pendingComponent: DashboardPending,
	component: EmployeeProfilePage,
});

function EmployeeProfilePage() {
	const { id } = Route.useParams();
	const [docType, setDocType] = useState<DocumentType | "">("");
	const [docPhase, setDocPhase] = useState<DocumentPhase | "">("");

	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [uploadForm, setUploadForm] = useState({
		type: "CV" as DocumentType,
		phase: "ONBOARDING" as DocumentPhase,
		expiresAt: "",
		note: "",
		file: null as File | null,
	});
	const uploadFileRef = useRef<HTMLInputElement>(null);

	const { data: employee, isLoading, isError } = useGetEmployeeQuery(id);
	const { data: docsData, isLoading: isLoadingDocs, refetch: refetchDocs } = useGetEmployeeDocumentsQuery({
		id,
		...(docType ? { type: docType } : {}),
		...(docPhase ? { phase: docPhase } : {}),
	});
	const [addEmployeeDocument, { isLoading: isUploading }] = useAddEmployeeDocumentMutation();
	const navigate = useNavigate();

	const handleUploadDocument = async () => {
		if (!uploadForm.file) return;
		const data = new FormData();
		data.append("type", uploadForm.type);
		data.append("phase", uploadForm.phase);
		data.append("file", uploadForm.file);
		if (uploadForm.expiresAt) data.append("expiresAt", uploadForm.expiresAt);
		if (uploadForm.note) data.append("note", uploadForm.note);
		try {
			await addEmployeeDocument({ id, formData: data }).unwrap();
			toast.success("Document uploaded successfully");
			setUploadDialogOpen(false);
			setUploadForm({ type: "CV", phase: "ONBOARDING", expiresAt: "", note: "", file: null });
			refetchDocs();
		} catch (err: any) {
			toast.error(err?.data?.message || "Failed to upload document");
		}
	};

	if (isLoading) return <DashboardPending />;
	if (isError || !employee)
		return (
			<ErrorComponent
				error={new Error("The requested employee profile could not be found.")}
			/>
		);

	const fullName = `${employee.firstName} ${employee.lastName}`;
	const deptName = employee.department?.name ?? employee.departmentName ?? "—";
	const companyName = employee.company?.name ?? "—";
	const documents = docsData?.items ?? [];

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full bg-muted/20">
			<input
				ref={uploadFileRef}
				type="file"
				accept=".pdf,.jpg,.jpeg,.png"
				className="hidden"
				onChange={(e) => {
					setUploadForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }));
					e.target.value = "";
				}}
			/>

			<Dialog open={uploadDialogOpen} onOpenChange={(open) => { setUploadDialogOpen(open); if (!open) setUploadForm({ type: "CV", phase: "ONBOARDING", expiresAt: "", note: "", file: null }); }}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Upload Document</DialogTitle>
						<DialogDescription>
							Add a new document to this employee's vault.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-5 py-1">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
									Document Type
								</Label>
								<Select value={uploadForm.type} onValueChange={(v) => setUploadForm((f) => ({ ...f, type: v as DocumentType }))}>
									<SelectTrigger className="h-10 bg-muted/5 border-border/40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(["CV","COVER_LETTER","NATIONAL_ID","PASSPORT","DEGREE","CERTIFICATE","OFFER_LETTER","EMPLOYMENT_CONTRACT","MEDICAL_CERTIFICATE","CLEARANCE_LETTER","EXPERIENCE_LETTER","TERMINATION_LETTER","PERFORMANCE_REVIEW","PROMOTION_LETTER","OTHER"] as DocumentType[]).map((t) => (
											<SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, " ")}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
									Phase
								</Label>
								<Select value={uploadForm.phase} onValueChange={(v) => setUploadForm((f) => ({ ...f, phase: v as DocumentPhase }))}>
									<SelectTrigger className="h-10 bg-muted/5 border-border/40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(["APPLICATION","ONBOARDING","PROBATION","CONFIRMATION","TERMINATION","RESIGNATION","SHORTLISTING","INTERVIEW","OFFER","OFFBOARDING"] as DocumentPhase[]).map((p) => (
											<SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
								Expiry Date <span className="normal-case font-medium text-muted-foreground/40">(optional)</span>
							</Label>
							<Input
								type="date"
								className="h-10 bg-muted/5 border-border/40"
								value={uploadForm.expiresAt}
								onChange={(e) => setUploadForm((f) => ({ ...f, expiresAt: e.target.value }))}
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
								Note <span className="normal-case font-medium text-muted-foreground/40">(optional)</span>
							</Label>
							<Input
								placeholder="e.g. Replacement for expired document"
								className="h-10 bg-muted/5 border-border/40"
								value={uploadForm.note}
								onChange={(e) => setUploadForm((f) => ({ ...f, note: e.target.value }))}
							/>
						</div>

						<div
							className={cn(
								"border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-colors",
								uploadForm.file
									? "border-primary/30 bg-primary/5"
									: "border-border/40 hover:border-primary/40 hover:bg-muted/5"
							)}
							onClick={() => uploadFileRef.current?.click()}
						>
							<div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", uploadForm.file ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted-foreground/40")}>
								<HugeiconsIcon icon={uploadForm.file ? CheckmarkCircle01Icon : FileUploadIcon} size={22} />
							</div>
							{uploadForm.file ? (
								<div className="text-center">
									<p className="text-sm font-bold text-foreground/90">{uploadForm.file.name}</p>
									<p className="text-xs text-muted-foreground/50 font-medium mt-0.5">Click to replace</p>
								</div>
							) : (
								<div className="text-center">
									<p className="text-sm font-bold text-foreground/80">Click to select file</p>
									<p className="text-xs text-muted-foreground/50 font-medium mt-0.5">PDF, JPG, PNG</p>
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUploadDocument} disabled={!uploadForm.file || isUploading}>
							{isUploading ? "Uploading..." : "Upload Document"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DashboardHeader
				category="Workforce"
				title={fullName}
				description={`${employee.jobTitle ?? "Staff"} · ${deptName}`}
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
						{/* Sidebar */}
						<div className="lg:col-span-4 w-full space-y-6">
							<Frame>
								<FramePanel className="bg-card p-8 flex flex-col items-center text-center shadow-xs">
									<UserAvatar
										name={fullName}
										size="lg"
										className="mb-6 h-24 w-24 rounded-2xl ring-4 ring-muted/10 shadow-sm"
									/>
									<h2 className="text-xl font-bold text-foreground/90 tracking-tight">
										{fullName}
									</h2>
									<p className="text-sm font-semibold text-primary/60 mt-1 uppercase tracking-widest">
										{employee.jobTitle ?? "Staff"}
									</p>
									<p className="text-xs font-semibold text-muted-foreground/40 mt-0.5 uppercase tracking-widest">
										{deptName}
									</p>

									<div className="mt-8 w-full space-y-3 pt-8 border-t border-border/5">
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
												Status
											</span>
											<Badge
												variant={
													employee.status === "ACTIVE"
														? "success"
														: employee.status === "PROBATION" || employee.status === "PENDING"
															? "warning"
															: "destructive"
												}
												showDot
												className="h-6"
											>
												{employee.status}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
												Gender
											</span>
											<Badge variant="muted" className="h-6">
												{employee.gender}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
												Company
											</span>
											<span className="text-xs font-bold text-foreground/70 max-w-35 text-right truncate">
												{companyName}
											</span>
										</div>
									</div>
								</FramePanel>
							</Frame>

							<Frame>
								<FramePanel className="bg-primary/2 border-primary/10 p-6 rounded-2xl">
									<div className="flex items-center gap-3 text-primary mb-5">
										<HugeiconsIcon icon={Calendar01Icon} size={18} strokeWidth={2} />
										<span className="text-xs font-bold uppercase tracking-widest">
											Employment Period
										</span>
									</div>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-xs font-semibold text-muted-foreground/60">
												Contract Type
											</span>
											<Badge variant="muted" className="h-5 text-[9px] font-black uppercase tracking-widest">
												{employee.contractTerm === "OPEN_ENDED" ? "Open Ended" : "Fixed Term"}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-xs font-semibold text-muted-foreground/60">
												Start Date
											</span>
											<span className="text-xs font-bold text-foreground/80">
												{employee.startDate ? new Date(employee.startDate).toLocaleDateString() : "—"}
											</span>
										</div>
										{employee.contractTerm === "FIXED" && (
											<div className="flex items-center justify-between">
												<span className="text-xs font-semibold text-muted-foreground/60">
													End Date
												</span>
												<span className="text-xs font-bold text-foreground/80">
													{employee.endDate
														? new Date(employee.endDate).toLocaleDateString()
														: "—"}
												</span>
											</div>
										)}
									</div>
								</FramePanel>
							</Frame>
						</div>

						{/* Main tabs */}
						<div className="lg:col-span-8 w-full min-w-0">
							<Tabs defaultValue="general" className="w-full flex flex-col">
								<TabsList>
									<TabsTrigger value="general">Overview</TabsTrigger>
									<TabsTrigger value="history">History</TabsTrigger>
									<TabsTrigger value="payroll">Payroll</TabsTrigger>
									<TabsTrigger value="documents">Vault</TabsTrigger>
									<TabsTrigger value="settings">Managed</TabsTrigger>
								</TabsList>

								<TabsContent
									value="general"
									className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
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
														label="National ID"
														value={employee.IDNumber}
														icon={Shield01Icon}
													/>
													<InfoRow
														label="Official Email"
														value={employee.email}
														icon={Mail01Icon}
													/>
													<InfoRow
														label="Phone Number"
														value={employee.phoneNumber}
														icon={SmartPhone01Icon}
													/>
													<InfoRow
														label="Gender"
														value={employee.gender}
														icon={UserGroupIcon}
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
														value={deptName}
														icon={Building03Icon}
													/>
													<InfoRow
														label="Job Title"
														value={employee.jobTitle ?? "—"}
														icon={JobShareIcon}
													/>
													<InfoRow
														label="Company"
														value={companyName}
														icon={Building03Icon}
													/>
													<InfoRow
														label="Start Date"
														value={new Date(employee.startDate).toLocaleDateString()}
														icon={Calendar01Icon}
													/>
												</FrameContent>
											</FramePanel>
										</Frame>
									</div>
								</TabsContent>

								<TabsContent
									value="history"
									className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
								>
									<Frame>
										<FramePanel className="bg-card shadow-xs">
											<FrameHeader>
												<div>
													<FrameTitle>Status History</FrameTitle>
													<FrameDescription>
														Lifecycle events and transitions
													</FrameDescription>
												</div>
											</FrameHeader>
											<FrameContent className="p-0">
												{employee.history && employee.history.length > 0 ? (
													<div className="divide-y divide-border/5">
														{employee.history.map((entry, i) => (
															<div key={i} className="flex items-start gap-4 p-6">
																<div className="h-8 w-8 rounded-lg bg-muted/5 flex items-center justify-center text-muted-foreground/30 border border-border/5 shrink-0 mt-0.5">
																	<HugeiconsIcon icon={Shield01Icon} size={14} />
																</div>
																<div className="flex-1 min-w-0">
																	<div className="flex items-center justify-between gap-2">
																		<Badge
																			variant={
																				entry.status === "ACTIVE"
																					? "success"
																					: entry.status === "PROBATION"
																						? "warning"
																						: "destructive"
																			}
																			className="h-5 text-[9px] font-black uppercase tracking-widest"
																		>
																			{entry.status}
																		</Badge>
																		<span className="text-[10px] text-muted-foreground/40 font-semibold shrink-0">
																			{new Date(entry.doneAt).toLocaleString()}
																		</span>
																	</div>
																	<p className="text-xs font-semibold text-foreground/70 mt-1.5">
																		{entry.comment}
																	</p>
																</div>
															</div>
														))}
													</div>
												) : (
													<div className="flex items-center justify-center py-16 text-muted-foreground/30 text-sm font-medium">
														No history recorded
													</div>
												)}
											</FrameContent>
										</FramePanel>
									</Frame>
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
											<FrameHeader>
												<div>
													<FrameTitle>Document Vault</FrameTitle>
													<FrameDescription>
														Secure compliance file storage
													</FrameDescription>
												</div>
												<div className="flex items-center gap-2">
													<Button size="sm" onClick={() => setUploadDialogOpen(true)}>
														<HugeiconsIcon icon={PlusSignCircleIcon} size={14} />
														Add Document
													</Button>
													<Select
														value={docType || "all"}
														onValueChange={(v) => setDocType(v === "all" ? "" : v as DocumentType)}
													>
														<SelectTrigger className="h-8 rounded-lg border-border/40 bg-muted/5 w-36 text-xs">
															<SelectValue placeholder="All Types" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="all" className="text-xs">All Types</SelectItem>
															{(["CV","COVER_LETTER","NATIONAL_ID","PASSPORT","DEGREE","CERTIFICATE","OFFER_LETTER","EMPLOYMENT_CONTRACT","MEDICAL_CERTIFICATE","CLEARANCE_LETTER","EXPERIENCE_LETTER","TERMINATION_LETTER","PERFORMANCE_REVIEW","PROMOTION_LETTER","OTHER"] as DocumentType[]).map((t) => (
																<SelectItem key={t} value={t} className="text-xs">{t.replace(/_/g, " ")}</SelectItem>
															))}
														</SelectContent>
													</Select>
													<Select
														value={docPhase || "all"}
														onValueChange={(v) => setDocPhase(v === "all" ? "" : v as DocumentPhase)}
													>
														<SelectTrigger className="h-8 rounded-lg border-border/40 bg-muted/5 w-36 text-xs">
															<SelectValue placeholder="All Phases" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="all" className="text-xs">All Phases</SelectItem>
															{(["APPLICATION","ONBOARDING","PROBATION","CONFIRMATION","TERMINATION","RESIGNATION","SHORTLISTING","INTERVIEW","OFFER","OFFBOARDING"] as DocumentPhase[]).map((p) => (
																<SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</FrameHeader>
											<FrameContent className="p-0">
												{isLoadingDocs ? (
													<div className="flex items-center justify-center py-16 text-muted-foreground/30 text-sm font-medium">
														Loading documents…
													</div>
												) : documents.length > 0 ? (
													<div className="divide-y divide-border/5 border-t border-border/5">
														{documents.map((doc) => (
															<div
																key={doc.id}
																className="flex items-center justify-between p-6 hover:bg-muted/5 transition-colors group"
															>
																<div className="flex items-center gap-4 min-w-0">
																	<div className="h-10 w-10 rounded-xl bg-muted/10 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors border border-border/5 shrink-0">
																		<HugeiconsIcon icon={File02Icon} size={20} />
																	</div>
																	<div className="min-w-0">
																		<div className="flex items-center gap-2 flex-wrap">
																			<p className="font-bold text-sm text-foreground/90">
																				{doc.type.replace(/_/g, " ")}
																			</p>
																			<Badge
																				variant={doc.isActive ? "success" : "destructive"}
																				className="h-4 text-[8px] font-black uppercase tracking-widest px-1.5"
																			>
																				{doc.isActive ? "Active" : "Inactive"}
																			</Badge>
																		</div>
																		<div className="flex items-center gap-3 mt-0.5 flex-wrap">
																			<span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">
																				{doc.phase}
																			</span>
																			<span className="text-[10px] text-muted-foreground/40 font-semibold">
																				Uploaded {new Date(doc.createdAt).toLocaleDateString()}
																			</span>
																		</div>
																	</div>
																</div>
																<a
																	href={doc.url}
																	target="_blank"
																	rel="noopener noreferrer"
																	download
																>
																	<Button variant="ghost" size="sm">
																		Download
																	</Button>
																</a>
															</div>
														))}
													</div>
												) : (
													<div className="flex items-center justify-center py-16 text-muted-foreground/30 text-sm font-medium">
														No documents uploaded
													</div>
												)}
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
											<FramePanel className="bg-destructive/2 border-destructive/10">
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
