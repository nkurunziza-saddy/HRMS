import {
	ArrowLeft01Icon,
	Calendar01Icon,
	Copy01Icon,
	Delete02Icon,
	Download01Icon,
	JobShareIcon,
	Location01Icon,
	LockIcon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Sorting05Icon,
	Tick01Icon,
	UserAdd01Icon,
	UserIcon,
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useChangeApplicantStatusMutation,
	useGetApplicantsQuery,
} from "@/lib/redux/api/applicant";
import {
	useChangeJobPostingStatusMutation,
	useGetJobPostingQuery,
} from "@/lib/redux/api/job-posting";
import { cn } from "@/lib/utils";
import type { ApplicantStatus, JobPostingStatus } from "@/types";

import { useAppSelector } from "@/lib/redux/store";

export const Route = createFileRoute("/dashboard/recruitment/$id")({
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	component: RecruitmentDetailsPage,
});

const APPLICANT_STATUSES: { value: ApplicantStatus; label: string }[] = [
	{ value: "APPLIED", label: "Applied" },
	{ value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
	{ value: "INTERVIEWED", label: "Interviewed" },
	{ value: "OFFERED", label: "Offered" },
	{ value: "REJECTED", label: "Rejected" },
];

const STATUS_VARIANT: Record<
	JobPostingStatus,
	"success" | "muted" | "destructive" | "warning"
> = {
	PUBLISHED: "success",
	DRAFT: "muted",
	CLOSED: "warning",
	ARCHIVED: "destructive",
};

const STATUS_COLOR: Record<ApplicantStatus, string> = {
	APPLIED: "bg-muted/50 text-muted-foreground border-border/20",
	INTERVIEW_SCHEDULED: "bg-info/10 text-info border-info/20",
	INTERVIEWED: "bg-primary/10 text-primary border-primary/20",
	OFFERED: "bg-success/10 text-success border-success/20",
	REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

function RecruitmentDetailsPage() {
	const { id } = Route.useParams();
	const { activeCompanyId } = useAppSelector((state) => state.auth);
	const {
		data: posting,
		isLoading: isLoadingJob,
		isError: isErrorJob,
	} = useGetJobPostingQuery(id);
	const { data: applicantsData, isLoading: isLoadingApps } =
		useGetApplicantsQuery({
			jobPostId: id,
			companyId: activeCompanyId || undefined,
		});
	const [changeStatus] = useChangeJobPostingStatusMutation();
	const [changeApplicantStatus] = useChangeApplicantStatusMutation();

	const [statusDialog, setStatusDialog] = useState<{
		applicantId: string;
		name: string;
		status: ApplicantStatus;
	} | null>(null);
	const [comment, setComment] = useState("");
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const [changingJobStatus, setChangingJobStatus] =
		useState<JobPostingStatus | null>(null);

	if (isLoadingJob || isLoadingApps) return <DashboardPending />;
	if (isErrorJob || !posting)
		return (
			<ErrorComponent
				error={new Error("The requested job opening could not be retrieved.")}
			/>
		);

	const handleChangeStatus = async (status: JobPostingStatus) => {
		setChangingJobStatus(status);
		try {
			await changeStatus({ id, status }).unwrap();
			toast.success(`Posting ${status.toLowerCase()} successfully`);
		} catch (err) {
			console.error(err);
			toast.error("Failed to update posting status");
		} finally {
			setChangingJobStatus(null);
		}
	};

	const candidates = applicantsData?.items || [];

	const openStatusDialog = (
		applicantId: string,
		name: string,
		status: ApplicantStatus,
	) => {
		setStatusDialog({ applicantId, name, status });
		setComment("");
	};

	const handleConfirmStatusChange = async () => {
		if (!statusDialog) return;
		setIsChangingStatus(true);
		try {
			await changeApplicantStatus({
				id: statusDialog.applicantId,
				status: statusDialog.status,
				comment: comment.trim() || undefined,
			}).unwrap();
			toast.success(
				`Applicant marked as ${statusDialog.status.toLowerCase().replace("_", " ")}`,
			);
			setStatusDialog(null);
		} catch (err) {
			console.error(err);
			toast.error("Failed to update applicant status");
		} finally {
			setIsChangingStatus(false);
		}
	};

	const handleCopyLink = () => {
		const url = `${window.location.origin}/apply/${id}`;
		navigator.clipboard.writeText(url);
		toast.success("Application link copied");
	};

	// Derived counts
	const statusCounts = APPLICANT_STATUSES.reduce(
		(acc, s) => {
			acc[s.value] = candidates.filter((c) => c.status === s.value).length;
			return acc;
		},
		{} as Record<ApplicantStatus, number>,
	);

	return (
		<>
			<main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
				<DashboardHeader
					category="Talent Pipeline"
					title={posting.title}
					description={`${posting.workMode} · ${posting.location}`}
				>
					<Badge
						variant={STATUS_VARIANT[posting.status] ?? "muted"}
						showDot
						className="text-[9px] font-black uppercase tracking-widest h-7 px-2.5 rounded-lg"
					>
						{posting.status}
					</Badge>

					{posting.status === "DRAFT" && (
						<Button
							size="lg"
							className="h-9 px-4 rounded-xl text-xs font-bold gap-2 bg-success hover:bg-success/90 text-white"
							disabled={changingJobStatus === "PUBLISHED"}
							onClick={() => handleChangeStatus("PUBLISHED")}
						>
							<HugeiconsIcon icon={JobShareIcon} size={14} strokeWidth={2} />
							{changingJobStatus === "PUBLISHED" ? "Publishing..." : "Publish"}
						</Button>
					)}
					{posting.status === "PUBLISHED" && (
						<>
							<Button
								size="lg"
								variant="outline"
								className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-warning/40 text-warning hover:bg-warning/5"
								disabled={changingJobStatus === "CLOSED"}
								onClick={() => handleChangeStatus("CLOSED")}
							>
								<HugeiconsIcon icon={LockIcon} size={14} strokeWidth={2} />
								{changingJobStatus === "CLOSED" ? "Closing..." : "Close"}
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-9 px-4 rounded-xl text-xs font-bold gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
								disabled={changingJobStatus === "ARCHIVED"}
								onClick={() => handleChangeStatus("ARCHIVED")}
							>
								<HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
								{changingJobStatus === "ARCHIVED" ? "Archiving..." : "Archive"}
							</Button>
						</>
					)}
					{posting.status === "CLOSED" && (
						<Button
							size="lg"
							className="h-9 px-4 rounded-xl text-xs font-bold gap-2 bg-success hover:bg-success/90 text-white"
							disabled={changingJobStatus === "PUBLISHED"}
							onClick={() => handleChangeStatus("PUBLISHED")}
						>
							<HugeiconsIcon icon={JobShareIcon} size={14} strokeWidth={2} />
							{changingJobStatus === "PUBLISHED"
								? "Publishing..."
								: "Re-publish"}
						</Button>
					)}

					<Button
						variant="outline"
						size="lg"
						className="text-xs font-semibold border-border/40 shadow-none hover:bg-muted/50 gap-2 h-9"
						onClick={handleCopyLink}
					>
						<HugeiconsIcon icon={Copy01Icon} size={14} strokeWidth={2} />
						Copy Link
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="text-xs font-semibold border-border/40 shadow-none hover:bg-muted/50 gap-2 h-9"
						render={<Link to="/dashboard/recruitment" />}
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
						Back
					</Button>
					<Button
						size="lg"
						className="h-9 px-4 rounded-xl text-xs font-bold gap-2"
					>
						<HugeiconsIcon icon={UserAdd01Icon} size={14} strokeWidth={2} />
						Add Candidate
					</Button>
				</DashboardHeader>

				<div className="flex-1 overflow-auto no-scrollbar px-4 lg:px-6 pb-12 py-6">
					<div className="max-w-screen-xl mx-auto">
						<div className="flex flex-col xl:flex-row gap-6 items-start">
							{/* ── Left: Candidates ── */}
							<div className="flex-1 min-w-0 space-y-5">
								{/* Pipeline status counters */}
								<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
									{APPLICANT_STATUSES.map((s) => (
										<div
											key={s.value}
											className="bg-card rounded-2xl border border-border/30 p-4 flex flex-col gap-1"
										>
											<span className="text-2xl font-black text-foreground/90 tabular-nums">
												{statusCounts[s.value] || 0}
											</span>
											<span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest leading-tight">
												{s.label}
											</span>
										</div>
									))}
								</div>

								{/* Candidates list */}
								<Frame>
									<FramePanel className="bg-card border-border/30 p-0 overflow-hidden">
										<div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/5">
											<div>
												<h3 className="text-sm font-bold text-foreground/90">
													Active Applications
												</h3>
												<p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest mt-0.5">
													{candidates.length} candidates in pipeline
												</p>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="font-bold text-[10px] uppercase tracking-widest gap-1.5 rounded-xl"
											>
												<HugeiconsIcon icon={Sorting05Icon} size={12} />
												Sort
											</Button>
										</div>

										<div className="divide-y divide-border/5">
											{candidates.map((can) => (
												<div
													key={can.id}
													className="px-6 py-4 hover:bg-muted/5 transition-colors group/can"
												>
													<div className="flex items-center justify-between gap-4">
														{/* Candidate info */}
														<div className="flex items-center gap-3 min-w-0 flex-1">
															<UserAvatar
																src={can.image}
																name={
																	can.firstName
																		? `${can.firstName} ${can.lastName}`
																		: can.referenceCode
																}
																size="lg"
																className="shadow-sm border border-border/10 ring-2 ring-background rounded-xl shrink-0 h-10 w-10"
															/>
															<div className="min-w-0">
																<Link
																	to="/dashboard/recruitment/applicant/$id"
																	params={{ id: can.id }}
																	className="text-sm font-bold text-foreground/85 hover:text-primary transition-colors block leading-tight truncate"
																>
																	{can.firstName
																		? `${can.firstName} ${can.lastName}`
																		: can.referenceCode}
																</Link>
																<div className="flex items-center gap-1.5 mt-1">
																	<p className="text-[9px] font-bold text-muted-foreground/35 uppercase tracking-widest truncate">
																		{can.email || "—"}
																	</p>
																	<span className="text-muted-foreground/20">
																		·
																	</span>
																	<p className="text-[9px] font-bold text-muted-foreground/35 uppercase tracking-widest shrink-0">
																		{new Date(
																			can.createdAt,
																		).toLocaleDateString()}
																	</p>
																</div>
															</div>
														</div>

														{/* Score */}
														<div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
															<span className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-widest">
																Score
															</span>
															<div className="flex items-center gap-1.5">
																<span className="text-sm font-black tabular-nums text-foreground/85">
																	{(can.score || 0).toFixed(1)}
																</span>
																<div className="h-1 w-10 bg-muted/20 rounded-full overflow-hidden">
																	<div
																		className="h-full bg-primary"
																		style={{
																			width: `${(can.score || 0) * 10}%`,
																		}}
																	/>
																</div>
															</div>
														</div>

														{/* Status dropdown */}
														<div className="shrink-0">
															<DropdownMenu>
																<DropdownMenuTrigger
																	render={
																		<button
																			className={cn(
																				"h-7 rounded-lg text-[9px] font-black uppercase tracking-widest border px-2.5 transition-colors",
																				STATUS_COLOR[
																					can.status as ApplicantStatus
																				] ||
																					"bg-muted/50 text-muted-foreground border-border/20",
																			)}
																		>
																			{can.status?.replace(/_/g, " ") ||
																				"Set Status"}
																		</button>
																	}
																/>
																<DropdownMenuContent
																	align="end"
																	className="w-48 rounded-xl border-border/40 p-1.5"
																>
																	{APPLICANT_STATUSES.map((s) => (
																		<DropdownMenuItem
																			key={s.value}
																			className="rounded-lg py-1.5 text-xs font-semibold"
																			onClick={() =>
																				openStatusDialog(
																					can.id,
																					can.firstName
																						? `${can.firstName} ${can.lastName}`
																						: can.referenceCode,
																					s.value,
																				)
																			}
																		>
																			{s.label}
																		</DropdownMenuItem>
																	))}
																</DropdownMenuContent>
															</DropdownMenu>
														</div>

														{/* Actions */}
														<div className="flex items-center gap-1.5 shrink-0">
															{can.status === "OFFERED" ? (
																<Button
																	size="sm"
																	className="bg-success hover:bg-success/90 text-white font-bold text-[9px] uppercase tracking-widest gap-1.5 h-8 rounded-xl px-3"
																	render={
																		<Link
																			to="/dashboard/employees/onboard"
																			search={{
																				applicantId: can.id,
																				firstName: can.firstName,
																				lastName: can.lastName,
																				email: can.email,
																				phone: can.phone || can.phoneNumber,
																			}}
																		/>
																	}
																>
																	<HugeiconsIcon
																		icon={Tick01Icon}
																		size={11}
																		strokeWidth={3}
																	/>
																	Hire
																</Button>
															) : (
																<Button
																	variant="outline"
																	size="sm"
																	className="font-bold text-[9px] uppercase tracking-widest h-8 px-3 rounded-xl border-border/40 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
																	render={
																		<Link
																			to="/dashboard/recruitment/applicant/$id"
																			params={{ id: can.id }}
																		/>
																	}
																>
																	Review
																</Button>
															)}

															<DropdownMenu>
																<DropdownMenuTrigger>
																	<Button
																		variant="ghost"
																		size="icon-sm"
																		className="opacity-0 group-hover/can:opacity-100 transition-opacity h-8 w-8"
																	>
																		<HugeiconsIcon
																			icon={MoreHorizontalIcon}
																			className="size-4 text-muted-foreground/40"
																		/>
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent
																	align="end"
																	className="w-48 rounded-2xl border-border/40 p-2"
																>
																	<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] px-2 py-1.5">
																		Actions
																	</p>
																	<DropdownMenuItem
																		className="rounded-xl py-2 font-semibold text-xs"
																		render={
																			<Link
																				to="/dashboard/recruitment/applicant/$id"
																				params={{ id: can.id }}
																			/>
																		}
																	>
																		<HugeiconsIcon
																			icon={UserIcon}
																			className="size-3.5 mr-2.5 text-muted-foreground/40"
																		/>
																		Review Application
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		className="rounded-xl py-2 font-semibold text-xs"
																		onClick={handleCopyLink}
																	>
																		<HugeiconsIcon
																			icon={Copy01Icon}
																			className="size-3.5 mr-2.5 text-muted-foreground/40"
																		/>
																		Copy Job Link
																	</DropdownMenuItem>
																	<DropdownMenuItem className="rounded-xl py-2 font-semibold text-xs">
																		Download CV
																	</DropdownMenuItem>
																	<DropdownMenuSeparator className="bg-border/5 my-1" />
																	<DropdownMenuItem className="rounded-xl py-2 font-semibold text-xs text-destructive focus:bg-destructive/5 focus:text-destructive">
																		Archive Application
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</div>
												</div>
											))}

											{candidates.length === 0 && (
												<div className="py-16 text-center">
													<div className="h-14 w-14 bg-muted/5 rounded-2xl flex items-center justify-center text-muted-foreground/20 mx-auto mb-4 border border-dashed border-border/30">
														<HugeiconsIcon icon={UserAdd01Icon} size={22} />
													</div>
													<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">
														No applications yet
													</p>
													<p className="text-xs font-medium text-muted-foreground/25 mt-1.5">
														Share the job link to start receiving candidates.
													</p>
													<Button
														variant="outline"
														size="sm"
														className="mt-5 gap-2 text-[10px] font-bold uppercase tracking-widest"
														onClick={handleCopyLink}
													>
														<HugeiconsIcon icon={Copy01Icon} size={12} />
														Copy Application Link
													</Button>
												</div>
											)}
										</div>

										<div className="flex items-center justify-between px-6 py-4 border-t border-border/5 bg-muted/[0.02]">
											<span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.2em]">
												{candidates.length} applications total
											</span>
											<Button
												variant="ghost"
												size="sm"
												className="h-7 text-[9px] font-black text-primary/50 hover:text-primary hover:bg-primary/5 uppercase tracking-widest rounded-xl"
											>
												Export All CVs
											</Button>
										</div>
									</FramePanel>
								</Frame>
							</div>

							{/* ── Right: Role Metadata ── */}
							<div className="w-full xl:w-80 space-y-4 shrink-0">
								<Frame>
									<FramePanel className="bg-card border-border/30 p-0 overflow-hidden">
										{/* Header */}
										<div className="p-5 border-b border-border/5">
											<div className="flex items-start justify-between gap-3">
												<div>
													<h3 className="text-sm font-bold text-foreground/85">
														Role Specification
													</h3>
													<p className="text-[10px] text-muted-foreground/40 mt-0.5 font-medium">
														{posting.workMode} · {posting.location}
													</p>
												</div>
												<Badge
													variant={STATUS_VARIANT[posting.status] ?? "muted"}
													showDot
													className="h-5 rounded-lg text-[9px] font-black uppercase tracking-widest px-2 shrink-0"
												>
													{posting.status}
												</Badge>
											</div>
										</div>

										{/* Meta items */}
										<div className="p-5 space-y-4">
											<MetaItem
												icon={Location01Icon}
												label="Location"
												value={posting.location}
											/>
											<MetaItem
												icon={Calendar01Icon}
												label="Deadline"
												value={new Date(
													posting.applicationDeadline,
												).toLocaleDateString(undefined, {
													dateStyle: "medium",
												})}
											/>
										</div>

										{/* About */}
										{posting.aboutRole && (
											<div className="px-5 pb-5 pt-0">
												<div className="p-4 rounded-xl bg-muted/[0.04] border border-border/5">
													<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-2">
														About the Role
													</p>
													<p className="text-xs font-medium text-muted-foreground/60 leading-relaxed line-clamp-4">
														{posting.aboutRole}
													</p>
												</div>
											</div>
										)}

										{/* Sections */}
										{posting.sections && posting.sections.length > 0 && (
											<div className="px-5 pb-5 space-y-4 border-t border-border/5 pt-5">
												{posting.sections.map((section) => (
													<div key={section.id}>
														<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-2">
															{section.title}
														</p>
														{section.items && section.items.length > 0 && (
															<ul className="space-y-1.5">
																{section.items.map((item, i) => (
																	<li
																		key={i}
																		className="flex items-start gap-2 text-xs text-muted-foreground/60"
																	>
																		<span className="mt-1.5 size-1 rounded-full bg-primary/30 shrink-0" />
																		{item.content}
																	</li>
																))}
															</ul>
														)}
													</div>
												))}
											</div>
										)}

										{/* Skills */}
										{posting.skills && posting.skills.length > 0 && (
											<div className="px-5 pb-5 border-t border-border/5 pt-5">
												<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-3">
													Skills Required
												</p>
												<div className="flex flex-wrap gap-1.5">
													{posting.skills.map((skill) => (
														<span
															key={skill.id}
															className={cn(
																"inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border",
																skill.isRequired
																	? "bg-primary/5 text-primary border-primary/15"
																	: "bg-muted/40 text-muted-foreground/60 border-border/20",
															)}
														>
															{skill.name}
														</span>
													))}
												</div>
											</div>
										)}

										<div className="p-5 border-t border-border/5 bg-muted/[0.02]">
											<Button
												variant="outline"
												size="lg"
												className="w-full font-bold gap-2 text-[10px] uppercase tracking-widest h-10 rounded-xl border-border/30"
											>
												<HugeiconsIcon icon={Download01Icon} size={13} />
												Export Job Pack
											</Button>
										</div>
									</FramePanel>
								</Frame>

								{/* Hiring Board */}
								<Frame>
									<FramePanel className="bg-card border-border/30 p-5">
										<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-[0.2em] mb-4">
											Hiring Board
										</p>
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center -space-x-2">
												{[1, 2, 3].map((i) => (
													<div
														key={i}
														className="size-8 rounded-xl border-2 border-background overflow-hidden ring-1 ring-border/10"
													>
														<img
															src={`https://i.pravatar.cc/150?u=${i + 10}`}
															alt="Collaborator"
															className="size-full object-cover"
														/>
													</div>
												))}
												<div className="size-8 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer">
													<HugeiconsIcon icon={PlusSignCircleIcon} size={14} />
												</div>
											</div>
											<span className="text-[10px] font-bold text-muted-foreground/40">
												4 active
											</span>
										</div>
										<Button
											variant="outline"
											className="w-full text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl border-border/30"
										>
											Manage Collaborators
										</Button>
									</FramePanel>
								</Frame>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Dialog
				open={!!statusDialog}
				onOpenChange={(open) => !open && setStatusDialog(null)}
			>
				<DialogContent className="sm:max-w-md rounded-2xl">
					<DialogHeader>
						<DialogTitle>Update Applicant Status</DialogTitle>
						<DialogDescription>
							Set{" "}
							<span className="font-semibold text-foreground">
								{statusDialog?.name}
							</span>{" "}
							as{" "}
							<span className="font-semibold text-primary">
								{statusDialog?.status.toLowerCase().replace(/_/g, " ")}
							</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2 py-2">
						<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
							Comment (Optional)
						</Label>
						<Textarea
							placeholder="Add a note about this status change..."
							className="resize-none min-h-20 rounded-xl"
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
							onClick={handleConfirmStatusChange}
							disabled={isChangingStatus}
							className="font-bold px-8 h-9 rounded-xl"
						>
							{isChangingStatus ? "Saving..." : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function MetaItem({
	icon: Icon,
	label,
	value,
}: {
	icon: any;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="text-primary/30 mt-0.5 shrink-0">
				<HugeiconsIcon icon={Icon} size={13} strokeWidth={2.5} />
			</div>
			<div className="min-w-0">
				<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-widest leading-none mb-1">
					{label}
				</p>
				<p className="text-xs font-bold text-foreground/75 leading-tight truncate">
					{value}
				</p>
			</div>
		</div>
	);
}
