import {
	ArrowLeft01Icon,
	CallIcon,
	CheckmarkCircle01Icon,
	Clock01Icon,
	Download01Icon,
	File02Icon,
	Mail01Icon,
	PassportIcon,
	StarIcon,
	Tick01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	useChangeApplicantStatusMutation,
	useGetApplicantQuery,
} from "@/lib/redux/api/applicant";
import { useGetJobPostingQuery } from "@/lib/redux/api/job-posting";
import { cn } from "@/lib/utils";
import type { ApplicantStatus } from "@/types";

export const Route = createFileRoute("/dashboard/recruitment/applicant/$id")({
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	component: ApplicantReviewPage,
});

const APPLICANT_STATUSES: { value: ApplicantStatus; label: string }[] = [
	{ value: "APPLIED", label: "Applied" },
	{ value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
	{ value: "INTERVIEWED", label: "Interviewed" },
	{ value: "OFFERED", label: "Offered" },
	{ value: "REJECTED", label: "Rejected" },
];

const STATUS_PIPELINE: ApplicantStatus[] = [
	"APPLIED",
	"INTERVIEW_SCHEDULED",
	"INTERVIEWED",
	"OFFERED",
];

function ApplicantReviewPage() {
	const { id } = Route.useParams();
	const { data: applicant, isLoading: isLoadingApp } = useGetApplicantQuery(id);
	const { data: posting, isLoading: isLoadingJob } = useGetJobPostingQuery(
		applicant?.jobPostId || "",
		{ skip: !applicant?.jobPostId },
	);
	const [changeApplicantStatus] = useChangeApplicantStatusMutation();
	const [statusDialog, setStatusDialog] = useState<ApplicantStatus | null>(
		null,
	);
	const [comment, setComment] = useState("");
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	if (isLoadingApp || isLoadingJob) return <DashboardPending />;

	const displayApplicant = applicant || {
		id,
		firstName: "Applicant",
		lastName: "Detail",
		email: "pending.backend@hrms.com",
		referenceCode: "APP-PENDING",
		status: "APPLIED" as ApplicantStatus,
		score: 8.5,
		createdAt: new Date().toISOString(),
		history: [],
	};

	const handleStatusChange = async () => {
		if (!statusDialog) return;
		setIsChangingStatus(true);
		try {
			await changeApplicantStatus({
				id: displayApplicant.id,
				status: statusDialog,
				comment: comment.trim() || undefined,
			}).unwrap();
			toast.success(
				`Status updated to ${statusDialog.toLowerCase().replace("_", " ")}`,
			);
			setStatusDialog(null);
			setComment("");
		} catch (err) {
			console.error(err);
			toast.error("Failed to update status");
		} finally {
			setIsChangingStatus(false);
		}
	};

	const fullName = displayApplicant.firstName
		? `${displayApplicant.firstName} ${displayApplicant.lastName}`
		: displayApplicant.referenceCode;

	const currentStatusIndex = STATUS_PIPELINE.indexOf(
		displayApplicant.status as ApplicantStatus,
	);
	const isRejected = displayApplicant.status === "REJECTED";

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
			<DashboardHeader
				category="Recruitment Review"
				title={fullName}
				description={`Application for ${posting?.title || "Position Detail"}`}
			>
				<Button
					variant="outline"
					size="lg"
					className="text-xs font-semibold border-border/40 shadow-none hover:bg-muted/50 gap-2 h-9"
					onClick={() => window.history.back()}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
					Back
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button
							size="lg"
							className="h-9 px-4 rounded-xl text-xs font-bold gap-2"
						>
							<HugeiconsIcon icon={Tick01Icon} size={14} />
							Change Status
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56 rounded-2xl border-border/40 p-2"
					>
						{APPLICANT_STATUSES.map((s) => (
							<DropdownMenuItem
								key={s.value}
								className={cn(
									"rounded-xl py-2 font-semibold text-sm",
									displayApplicant.status === s.value &&
										"bg-primary/5 text-primary",
								)}
								onClick={() => setStatusDialog(s.value)}
							>
								<span>{s.label}</span>
								{displayApplicant.status === s.value && (
									<HugeiconsIcon
										icon={CheckmarkCircle01Icon}
										className="ml-auto size-4"
									/>
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				{displayApplicant.status === "OFFERED" && (
					<Button
						size="lg"
						className="bg-success hover:bg-success/90 text-white h-9 px-4 rounded-xl text-xs font-bold gap-2"
						render={
							<Link
								to="/dashboard/employees/onboard"
								search={{
									applicantId: displayApplicant.id,
									firstName: displayApplicant.firstName,
									lastName: displayApplicant.lastName,
									email: displayApplicant.email,
									phone: displayApplicant.phone || displayApplicant.phoneNumber,
								}}
							/>
						}
					>
						<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
						Hire Candidate
					</Button>
				)}
			</DashboardHeader>

			{/* ── Pipeline Progress Strip ── */}
			<div className="border-b border-border/5 bg-card/50 backdrop-blur-sm px-4 lg:px-6 py-4">
				<div className="max-w-screen-xl mx-auto flex items-center gap-0">
					{STATUS_PIPELINE.map((stage, idx) => {
						const isCompleted = currentStatusIndex > idx;
						const isCurrent = currentStatusIndex === idx;
						return (
							<div
								key={stage}
								className="flex items-center flex-1 last:flex-none"
							>
								<div className="flex flex-col items-center gap-1.5">
									<div
										className={cn(
											"h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black border-2 transition-all duration-300",
											isCompleted &&
												!isRejected &&
												"bg-primary border-primary text-white",
											isCurrent &&
												!isRejected &&
												"bg-background border-primary text-primary ring-4 ring-primary/10",
											!isCompleted &&
												!isCurrent &&
												"bg-background border-border/20 text-muted-foreground/30",
											isRejected && "border-border/10 text-muted-foreground/20",
										)}
									>
										{isCompleted && !isRejected ? (
											<HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} />
										) : (
											idx + 1
										)}
									</div>
									<span
										className={cn(
											"text-[8px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:block",
											isCurrent && !isRejected
												? "text-primary"
												: "text-muted-foreground/25",
										)}
									>
										{stage.replace(/_/g, " ")}
									</span>
								</div>
								{idx < STATUS_PIPELINE.length - 1 && (
									<div
										className={cn(
											"flex-1 h-px mx-2 mb-4 transition-all duration-500",
											isCompleted && !isRejected
												? "bg-primary/40"
												: "bg-border/10",
										)}
									/>
								)}
							</div>
						);
					})}
					{isRejected && (
						<>
							<div className="h-px w-6 mx-2 mb-4 bg-destructive/20" />
							<div className="flex flex-col items-center gap-1.5">
								<div className="h-6 w-6 rounded-full border-2 bg-destructive/10 border-destructive/30 flex items-center justify-center">
									<span className="text-[9px] font-black text-destructive leading-none">
										✕
									</span>
								</div>
								<span className="text-[8px] font-black uppercase tracking-widest text-destructive/50 hidden sm:block">
									Rejected
								</span>
							</div>
						</>
					)}
				</div>
			</div>

			{/* ── Body ── */}
			<div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-6 py-6">
				<div className="max-w-screen-xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
						{/* Sidebar */}
						<div className="lg:col-span-4 xl:col-span-3 space-y-4">
							{/* Profile Card */}
							<Frame>
								<FramePanel className="bg-card overflow-hidden p-0">
									<div className="h-20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent relative">
										<div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur border border-border/20 rounded-lg px-2.5 py-1 shadow-sm">
											<HugeiconsIcon
												icon={StarIcon}
												size={11}
												className="text-amber-400"
											/>
											<span className="text-[11px] font-black text-foreground/80">
												{(displayApplicant.score || 0).toFixed(1)}
												<span className="text-muted-foreground/40 font-medium text-[10px]">
													/10
												</span>
											</span>
										</div>
									</div>
									<div className="px-5 pb-5 -mt-9">
										<UserAvatar
											src={displayApplicant.image}
											name={fullName}
											size="lg"
											className="h-16 w-16 rounded-2xl ring-4 ring-background shadow-md mb-3"
										/>
										<h2 className="text-base font-bold text-foreground/90 tracking-tight leading-tight">
											{fullName}
										</h2>
										<p className="text-[9px] font-black text-primary/40 mt-0.5 uppercase tracking-[0.2em]">
											{displayApplicant.referenceCode}
										</p>
										{/* Score bar */}
										<div className="mt-4 pt-4 border-t border-border/5">
											<div className="flex items-center justify-between mb-1.5">
												<span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
													Match Score
												</span>
												<span className="text-[10px] font-black text-foreground/50">
													{Math.round((displayApplicant.score || 0) * 10)}%
												</span>
											</div>
											<div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
													style={{
														width: `${(displayApplicant.score || 0) * 10}%`,
													}}
												/>
											</div>
										</div>
										{/* Stage badge */}
										<div className="mt-4 flex items-center justify-between">
											<span className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-widest">
												Stage
											</span>
											<Badge
												variant="info"
												className="h-5 font-black text-[9px] uppercase tracking-widest px-2"
											>
												{displayApplicant.status.replace(/_/g, " ")}
											</Badge>
										</div>
									</div>
								</FramePanel>
							</Frame>

							{/* Contact */}
							<Frame>
								<FramePanel className="bg-card p-5">
									<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-3">
										Contact
									</p>
									<div className="space-y-0.5">
										<ContactRow
											icon={Mail01Icon}
											label="Email"
											value={displayApplicant.email || "Not Provided"}
										/>
										<ContactRow
											icon={CallIcon}
											label="Phone"
											value={
												displayApplicant.phone ||
												displayApplicant.phoneNumber ||
												"Not Provided"
											}
										/>
										<ContactRow
											icon={PassportIcon}
											label="ID / Passport"
											value={displayApplicant.documentNumber || "Not Provided"}
										/>
									</div>
								</FramePanel>
							</Frame>

							{/* Position */}
							<Frame>
								<FramePanel className="bg-card p-5">
									<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-3">
										Applied For
									</p>
									<div className="flex items-start gap-3">
										<div className="h-8 w-8 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0">
											<HugeiconsIcon
												icon={UserGroupIcon}
												size={14}
												className="text-primary/50"
											/>
										</div>
										<div>
											<p className="text-sm font-bold text-foreground/80 leading-tight">
												{posting?.title || "Pending..."}
											</p>
											<p className="text-[10px] font-medium text-muted-foreground/40 mt-1">
												{new Date(
													displayApplicant.createdAt,
												).toLocaleDateString(undefined, {
													dateStyle: "medium",
												})}
											</p>
										</div>
									</div>
								</FramePanel>
							</Frame>
						</div>

						{/* Main */}
						<div className="lg:col-span-8 xl:col-span-9 min-w-0">
							<Tabs defaultValue="overview" className="flex flex-col w-full">
								<TabsList className="bg-transparent border-b border-border/5 w-full justify-start rounded-none h-10 p-0 gap-6 shrink-0">
									{["overview", "history", "documents"].map((tab) => (
										<TabsTrigger
											key={tab}
											value={tab}
											className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/35 data-[state=active]:text-primary transition-colors capitalize"
										>
											{tab}
										</TabsTrigger>
									))}
								</TabsList>

								{/* Overview */}
								<TabsContent value="overview" className="pt-5 space-y-4 mt-0">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{/* Score */}
										<Frame>
											<FramePanel className="bg-card p-0 overflow-hidden">
												<div className="p-5">
													<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-3">
														AI Screening Score
													</p>
													<div className="flex items-end gap-2">
														<span className="text-4xl font-black text-foreground/90 tabular-nums leading-none">
															{Math.round((displayApplicant.score || 0) * 10)}
														</span>
														<span className="text-base font-black text-muted-foreground/20 pb-0.5">
															/ 100
														</span>
													</div>
													<p className="text-xs text-muted-foreground/50 mt-2 leading-relaxed">
														Matches{" "}
														<span className="font-bold text-foreground/70">
															{Math.round((displayApplicant.score || 0) * 10)}%
														</span>{" "}
														of required role criteria.
													</p>
												</div>
												<div className="h-0.5 w-full bg-muted/10">
													<div
														className="h-full bg-primary/70"
														style={{
															width: `${(displayApplicant.score || 0) * 10}%`,
														}}
													/>
												</div>
												<div className="p-4 pt-3">
													<Button
														variant="outline"
														className="w-full text-[10px] font-black uppercase tracking-widest h-8 rounded-xl"
													>
														View Full Scorecard
													</Button>
												</div>
											</FramePanel>
										</Frame>

										{/* Details */}
										<Frame>
											<FramePanel className="bg-card p-5">
												<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-3">
													Details
												</p>
												<div className="divide-y divide-border/5">
													<DetailRow
														label="Gender"
														value={displayApplicant.gender || "Not Specified"}
													/>
													<DetailRow
														label="Applied"
														value={new Date(
															displayApplicant.createdAt,
														).toLocaleDateString(undefined, {
															dateStyle: "medium",
														})}
													/>
													<DetailRow
														label="Reference"
														value={displayApplicant.referenceCode}
													/>
												</div>
											</FramePanel>
										</Frame>
									</div>

									{/* Skills */}
									{posting?.skills && posting.skills.length > 0 && (
										<Frame>
											<FramePanel className="bg-card p-5">
												<div className="flex items-center justify-between mb-4">
													<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em]">
														Requirements Match
													</p>
													<span className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-widest">
														{posting.skills.filter((s) => s.isRequired).length}{" "}
														required
													</span>
												</div>
												<div className="flex flex-wrap gap-1.5">
													{posting.skills.map((skill) => (
														<Badge
															key={skill.id}
															variant={skill.isRequired ? "info" : "muted"}
															className="h-6 px-2.5 rounded-lg font-bold text-[10px]"
														>
															{skill.name}
															{skill.isRequired && (
																<span className="ml-1 opacity-40 text-[8px] uppercase tracking-wider">
																	req
																</span>
															)}
														</Badge>
													))}
												</div>
											</FramePanel>
										</Frame>
									)}
								</TabsContent>

								{/* Timeline */}
								<TabsContent value="history" className="pt-5 mt-0">
									<Frame>
										<FramePanel className="bg-card p-0">
											<div className="p-5 border-b border-border/5">
												<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em]">
													Activity Timeline
												</p>
												<p className="text-xs text-muted-foreground/40 mt-1">
													Full log of status changes and internal notes
												</p>
											</div>
											<div className="p-5">
												{displayApplicant.history &&
												displayApplicant.history.length > 0 ? (
													<div className="relative">
														<div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/10" />
														<div className="space-y-5">
															{displayApplicant.history.map(
																(entry, idx: number) => (
																	<div
																		key={idx}
																		className="relative flex gap-4 group"
																	>
																		<div className="relative z-10 mt-0.5 size-5 rounded-full bg-background border-2 border-primary/20 group-hover:border-primary flex items-center justify-center transition-colors shrink-0">
																			<div className="size-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
																		</div>
																		<div className="flex-1 min-w-0">
																			<div className="flex items-center justify-between gap-2 mb-2">
																				<Badge
																					variant="outline"
																					className="font-black text-[9px] uppercase tracking-widest h-5 px-2"
																				>
																					{entry.status.replace(/_/g, " ")}
																				</Badge>
																				<span className="text-[9px] font-bold text-muted-foreground/25 tabular-nums shrink-0">
																					{new Date(
																						entry.doneAt,
																					).toLocaleString()}
																				</span>
																			</div>
																			<div className="p-3 rounded-xl bg-muted/[0.04] border border-border/5">
																				<p className="text-xs font-medium text-foreground/60 leading-relaxed">
																					{entry.comment ||
																						"Status updated without remarks."}
																				</p>
																				<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-widest mt-2">
																					By {entry.doneBy}
																				</p>
																			</div>
																		</div>
																	</div>
																),
															)}
														</div>
													</div>
												) : (
													<div className="flex flex-col items-center justify-center py-12 space-y-3">
														<div className="size-10 rounded-2xl bg-muted/5 border border-dashed border-border/20 flex items-center justify-center">
															<HugeiconsIcon
																icon={Clock01Icon}
																size={18}
																className="text-muted-foreground/20"
															/>
														</div>
														<p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
															No logs yet
														</p>
													</div>
												)}
											</div>
										</FramePanel>
									</Frame>
								</TabsContent>

								{/* Documents */}
								<TabsContent value="documents" className="pt-5 mt-0">
									<Frame>
										<FramePanel className="bg-card p-0">
											<div className="flex items-center justify-between p-5 border-b border-border/5">
												<div>
													<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em]">
														Documents
													</p>
													<p className="text-xs text-muted-foreground/40 mt-0.5">
														3 verified attachments
													</p>
												</div>
												<Button
													variant="outline"
													size="sm"
													className="gap-1.5 text-[10px] font-bold uppercase tracking-widest h-8"
												>
													<HugeiconsIcon icon={Download01Icon} size={12} />
													All
												</Button>
											</div>
											<div className="divide-y divide-border/5">
												{[
													{
														name: "Curriculum Vitae",
														ext: "PDF",
														size: "2.4 MB",
													},
													{ name: "Cover Letter", ext: "PDF", size: "480 KB" },
													{
														name: "Identity Document",
														ext: "PDF",
														size: "1.1 MB",
													},
												].map((doc) => (
													<div
														key={doc.name}
														className="flex items-center justify-between px-5 py-4 hover:bg-muted/5 transition-colors group"
													>
														<div className="flex items-center gap-3">
															<div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
																<HugeiconsIcon
																	icon={File02Icon}
																	size={16}
																	className="text-primary/40"
																/>
															</div>
															<div>
																<p className="text-sm font-bold text-foreground/80">
																	{doc.name}
																</p>
																<p className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest mt-0.5">
																	{doc.ext} · {doc.size}
																</p>
															</div>
														</div>
														<Button
															variant="ghost"
															size="sm"
															className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
														>
															Download
														</Button>
													</div>
												))}
											</div>
										</FramePanel>
									</Frame>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</div>

			{/* Dialog */}
			<Dialog
				open={!!statusDialog}
				onOpenChange={(open) => !open && setStatusDialog(null)}
			>
				<DialogContent className="sm:max-w-md rounded-2xl">
					<DialogHeader>
						<DialogTitle>Update Applicant Status</DialogTitle>
						<DialogDescription>
							Transitioning to{" "}
							<span className="font-semibold text-primary">
								{statusDialog?.toLowerCase().replace(/_/g, " ")}
							</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2 py-4">
						<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
							Remarks
						</Label>
						<Textarea
							placeholder="Add a note for the internal review history..."
							className="resize-none min-h-24 rounded-xl border-border/40"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
						/>
					</div>
					<DialogFooter className="bg-muted/5 -mx-6 -mb-6 p-5 rounded-b-2xl border-t border-border/5">
						<Button
							variant="ghost"
							onClick={() => setStatusDialog(null)}
							className="font-bold text-xs uppercase tracking-widest"
						>
							Cancel
						</Button>
						<Button
							onClick={handleStatusChange}
							disabled={isChangingStatus}
							className="font-bold px-8 h-9 rounded-xl"
						>
							{isChangingStatus ? "Updating..." : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
}

function ContactRow({
	icon: Icon,
	label,
	value,
}: {
	icon: any;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center gap-3 py-2.5 group">
			<div className="h-7 w-7 rounded-lg bg-muted/5 border border-border/5 flex items-center justify-center text-muted-foreground/25 group-hover:text-primary transition-colors shrink-0">
				<HugeiconsIcon icon={Icon} size={13} />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-[8px] font-black text-muted-foreground/25 uppercase tracking-widest leading-none mb-0.5">
					{label}
				</p>
				<p className="text-xs font-bold text-foreground/70 truncate">{value}</p>
			</div>
		</div>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-2.5">
			<span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
				{label}
			</span>
			<span className="text-xs font-bold text-foreground/70">{value}</span>
		</div>
	);
}
