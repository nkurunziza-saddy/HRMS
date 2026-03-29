import {
	ArrowRight01Icon,
	Briefcase01Icon,
	Calendar01Icon,
	Copy01Icon,
	Delete02Icon,
	Download01Icon,
	JobShareIcon,
	Location01Icon,
	Mail01Icon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
	Sorting05Icon,
	UserAdd01Icon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserAvatar } from "@/components/dashboard/user-avatar";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useGetApplicantsQuery } from "@/lib/redux/api/applicant";
import {
	useChangeJobPostingStatusMutation,
	useCreateJobPostingMutation,
	useGetJobPostingsQuery,
} from "@/lib/redux/api/job-posting";
import { useGetJobTitlesQuery } from "@/lib/redux/api/job-title";
import { useAppSelector } from "@/lib/redux/store";
import { cn } from "@/lib/utils";
import type {
	JobPostingSkill,
	JobPostingStatus,
	SkillCategory,
	WorkMode,
} from "@/types";

export const Route = createFileRoute("/dashboard/recruitment/")({
	component: RecruitmentPage,
});

const STATUS_VARIANT: Record<
	JobPostingStatus,
	"success" | "muted" | "destructive" | "warning"
> = {
	PUBLISHED: "success",
	DRAFT: "muted",
	CLOSED: "warning",
	ARCHIVED: "destructive",
};

function RecruitmentPage() {
	const { activeCompanyId } = useAppSelector((state) => state.auth);
	const {
		data: postingsData,
		isLoading,
		isError,
	} = useGetJobPostingsQuery(
		activeCompanyId ? { companyId: activeCompanyId } : undefined,
	);
	const { data: applicantsData } = useGetApplicantsQuery(
		activeCompanyId ? { companyId: activeCompanyId } : undefined,
	);
	const { data: jobTitlesData } = useGetJobTitlesQuery(undefined);
	const [createJobPosting] = useCreateJobPostingMutation();
	const [changeStatus] = useChangeJobPostingStatusMutation();

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<JobPostingStatus | "ALL">(
		"ALL",
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [form, setForm] = useState({
		title: "",
		jobTitleId: "",
		aboutRole: "",
		mission: "",
		location: "",
		workMode: "HYBRID" as WorkMode,
		applicationDeadline: "",
	});
	const [skills, setSkills] = useState<any[]>([
		{ name: "", category: "TECHNICAL", isRequired: true },
	]);
	const [sectionItems, setSectionItems] = useState([{ content: "", order: 1 }]);

	const resetForm = () => {
		setForm({
			title: "",
			jobTitleId: "",
			aboutRole: "",
			mission: "",
			location: "",
			workMode: "HYBRID",
			applicationDeadline: "",
		});
		setSkills([{ name: "", category: "TECHNICAL", isRequired: true }]);
		setSectionItems([{ content: "", order: 1 }]);
	};

	if (isLoading) return <DashboardPending />;
	if (isError) return <div>Error loading job postings.</div>;

	const postings = postingsData?.items || [];
	const applicants = applicantsData?.items || [];
	const jobTitles = jobTitlesData?.items || [];

	const filteredPostings = postings.filter((p) => {
		const matchesSearch =
			p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.location.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const publishedCount = postings.filter(
		(p) => p.status === "PUBLISHED",
	).length;
	const draftCount = postings.filter((p) => p.status === "DRAFT").length;

	const handleCreate = async () => {
		if (
			!form.title ||
			!form.jobTitleId ||
			!form.location ||
			!form.applicationDeadline
		) {
			toast.error("Title, position, location and deadline are required");
			return;
		}
		setIsSubmitting(true);
		try {
			await createJobPosting({
				...form,
				applicationDeadline: new Date(form.applicationDeadline).toISOString(),
				skills: skills.filter((s) => s.name.trim()) as any,
				sections: [
					{
						type: "KEY_RESPONSIBILITIES",
						title: "What You'll Work On",
						order: 1,
						items: sectionItems
							.filter((i) => i.content.trim())
							.map((i, idx) => ({ content: i.content.trim(), order: idx + 1 })),
					} as any,
				],
			}).unwrap();
			toast.success("Job posting created");
			setIsDialogOpen(false);
			resetForm();
		} catch (err) {
			console.error(err);
			toast.error("Failed to create job posting");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopyLink = (postingId: string) => {
		navigator.clipboard.writeText(
			`${window.location.origin}/apply/${postingId}`,
		);
		toast.success("Link copied");
	};

	const handleChangeStatus = async (id: string, status: JobPostingStatus) => {
		try {
			await changeStatus({ id, status }).unwrap();
			toast.success(`Posting ${status.toLowerCase()}`);
		} catch (err) {
			console.error(err);
			toast.error("Failed to update status");
		}
	};

	const addSkill = () =>
		setSkills((prev) => [
			...prev,
			{ name: "", category: "TECHNICAL", isRequired: false },
		]);
	const removeSkill = (i: number) =>
		setSkills((prev) => prev.filter((_, idx) => idx !== i));
	const updateSkill = (i: number, patch: Partial<JobPostingSkill>) =>
		setSkills((prev) =>
			prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
		);
	const addSectionItem = () =>
		setSectionItems((prev) => [
			...prev,
			{ content: "", order: prev.length + 1 },
		]);
	const removeSectionItem = (i: number) =>
		setSectionItems((prev) => prev.filter((_, idx) => idx !== i));

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
			<DashboardHeader
				category="Talent"
				title="Recruitment"
				description="Source and manage hiring pipelines"
			>
				<Button
					variant="outline"
					size="lg"
					className="h-9 gap-2 text-xs font-semibold border-border/40"
				>
					<HugeiconsIcon icon={Download01Icon} size={14} />
					Export Report
				</Button>

				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger>
						<Button
							size="lg"
							className="h-9 px-4 rounded-xl text-xs font-bold gap-2"
						>
							<HugeiconsIcon icon={PlusSignCircleIcon} size={14} />
							New Posting
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Publish New Job Posting</DialogTitle>
							<DialogDescription>
								Define a new opening for the recruitment portal.
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-5 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2 space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Posting Title
									</Label>
									<Input
										placeholder="e.g. Open Engineering Application (Mid-Senior)"
										value={form.title}
										onChange={(e) =>
											setForm({ ...form, title: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Position
									</Label>
									<Select
										value={form.jobTitleId}
										onValueChange={(v) =>
											setForm({ ...form, jobTitleId: v || "" })
										}
									>
										<SelectTrigger>
											<SelectValue>
												{form.jobTitleId
													? jobTitles.find(
															(jt: any) => jt.id === form.jobTitleId,
														)?.name || "Select a position"
													: "Select a position"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{jobTitles.length ? (
												jobTitles.map((jt: any) => (
													<SelectItem key={jt.id} value={jt.id}>
														{jt.name}
													</SelectItem>
												))
											) : (
												<SelectItem value="none" disabled>
													No positions available
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Work Mode
									</Label>
									<Select
										value={form.workMode}
										onValueChange={(v) =>
											setForm({ ...form, workMode: v as WorkMode })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="HYBRID">Hybrid</SelectItem>
											<SelectItem value="REMOTE">Remote</SelectItem>
											<SelectItem value="ONSITE">On-site</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Location
									</Label>
									<Input
										placeholder="e.g. Kigali, Rwanda"
										value={form.location}
										onChange={(e) =>
											setForm({ ...form, location: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Application Deadline
									</Label>
									<Input
										type="date"
										value={form.applicationDeadline}
										onChange={(e) =>
											setForm({ ...form, applicationDeadline: e.target.value })
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
									About the Role
								</Label>
								<Textarea
									placeholder="Describe the role, team, and what success looks like..."
									className="min-h-20 resize-none"
									value={form.aboutRole}
									onChange={(e) =>
										setForm({ ...form, aboutRole: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
									Mission
								</Label>
								<Textarea
									placeholder="What will this person build or achieve?"
									className="min-h-16 resize-none"
									value={form.mission}
									onChange={(e) =>
										setForm({ ...form, mission: e.target.value })
									}
								/>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Key Responsibilities
									</Label>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-xs h-7"
										onClick={addSectionItem}
									>
										+ Add
									</Button>
								</div>
								{sectionItems.map((item, i) => (
									<div key={i} className="flex gap-2 items-center">
										<Input
											placeholder={`Responsibility ${i + 1}`}
											value={item.content}
											onChange={(e) =>
												setSectionItems((prev) =>
													prev.map((s, idx) =>
														idx === i ? { ...s, content: e.target.value } : s,
													),
												)
											}
										/>
										{sectionItems.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => removeSectionItem(i)}
												className="text-destructive hover:text-destructive shrink-0"
											>
												×
											</Button>
										)}
									</div>
								))}
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
										Skills
									</Label>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-xs h-7"
										onClick={addSkill}
									>
										+ Add
									</Button>
								</div>
								{skills.map((skill, i) => (
									<div key={i} className="flex gap-2 items-center">
										<Input
											placeholder="e.g. TypeScript"
											className="flex-1"
											value={skill.name}
											onChange={(e) => updateSkill(i, { name: e.target.value })}
										/>
										<Select
											value={skill.category}
											onValueChange={(v) =>
												updateSkill(i, { category: v as SkillCategory })
											}
										>
											<SelectTrigger className="w-28">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="TECHNICAL">Technical</SelectItem>
												<SelectItem value="SOFT">Soft</SelectItem>
												<SelectItem value="OTHER">Other</SelectItem>
											</SelectContent>
										</Select>
										<label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
											<input
												type="checkbox"
												checked={skill.isRequired}
												onChange={(e) =>
													updateSkill(i, { isRequired: e.target.checked })
												}
												className="rounded"
											/>
											Req
										</label>
										{skills.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => removeSkill(i)}
												className="text-destructive hover:text-destructive shrink-0"
											>
												×
											</Button>
										)}
									</div>
								))}
							</div>
						</div>

						<DialogFooter className="bg-muted/5 -mx-6 -mb-6 p-5 rounded-b-2xl border-t border-border/5">
							<Button
								variant="ghost"
								onClick={() => setIsDialogOpen(false)}
								className="font-bold text-xs uppercase tracking-widest"
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreate}
								disabled={isSubmitting}
								className="font-bold px-8 h-9 rounded-xl"
							>
								{isSubmitting ? "Publishing..." : "Publish Posting"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DashboardHeader>

			<div className="flex-1 overflow-auto no-scrollbar px-4 lg:px-6 pb-12 py-6">
				<div className="max-w-screen-xl mx-auto">
					<div className="flex flex-col xl:flex-row gap-6 items-start">
						{/* ── Left: Main Content ── */}
						<div className="flex-1 min-w-0 space-y-6">
							{/* Stats */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<StatCard
									label="Active Openings"
									value={publishedCount}
									icon={JobShareIcon}
									variant="primary"
									sub="Postings published"
								/>
								<StatCard
									label="Total Applicants"
									value={applicants.length.toString()}
									icon={UserMultiple02Icon}
									variant="info"
									sub="Pipeline across roles"
								/>
								<StatCard
									label="Time to Hire"
									value="18d"
									icon={Sorting05Icon}
									variant="success"
									sub="Average duration"
								/>
							</div>

							{/* Postings table */}
							<Frame>
								<FramePanel className="bg-card border-border/30 p-0 overflow-hidden">
									<div className="px-6 pt-6 pb-4">
										<div className="flex items-start justify-between gap-4 mb-5">
											<div>
												<h3 className="text-sm font-bold text-foreground/90">
													Active Pipelines
												</h3>
												<p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest mt-0.5">
													{filteredPostings.length} of {postings.length}{" "}
													requisitions
												</p>
											</div>
										</div>

										{/* Search + filter row */}
										<div className="flex items-center gap-2">
											<div className="relative flex-1">
												<HugeiconsIcon
													icon={Search01Icon}
													className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30"
													strokeWidth={2}
												/>
												<Input
													placeholder="Search by title or location…"
													value={searchTerm}
													onChange={(e) => setSearchTerm(e.target.value)}
													className="pl-9 h-9 rounded-xl border-border/30 bg-muted/5 text-sm"
												/>
											</div>
											{/* Status filter chips */}
											<div className="flex items-center gap-1.5">
												{(
													[
														"ALL",
														"PUBLISHED",
														"DRAFT",
														"CLOSED",
														"ARCHIVED",
													] as const
												).map((s) => (
													<button
														key={s}
														onClick={() => setStatusFilter(s)}
														className={cn(
															"h-9 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
															statusFilter === s
																? "bg-primary text-white border-primary"
																: "bg-muted/5 text-muted-foreground/40 border-border/20 hover:border-border/40",
														)}
													>
														{s === "ALL" ? "All" : s}
													</button>
												))}
											</div>
										</div>
									</div>

									<Table>
										<TableHeader>
											<TableRow className="hover:bg-transparent border-border/5 bg-muted/[0.03]">
												<TableHead className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] pl-6 py-3">
													Position
												</TableHead>
												<TableHead className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] px-4 py-3 hidden md:table-cell">
													Mode
												</TableHead>
												<TableHead className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] px-4 py-3">
													Status
												</TableHead>
												<TableHead className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] px-4 py-3 hidden lg:table-cell">
													Deadline
												</TableHead>
												<TableHead className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] px-4 py-3 text-right pr-6">
													Actions
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredPostings.map((posting) => (
												<TableRow
													key={posting.id}
													className="border-border/5 hover:bg-muted/5 transition-colors group"
												>
													<TableCell className="pl-6 py-4">
														<Link
															to="/dashboard/recruitment/$id"
															params={{ id: posting.id }}
															className="block"
														>
															<p className="text-sm font-bold text-foreground/85 group-hover:text-primary transition-colors leading-tight">
																{posting.title}
															</p>
															<div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
																<HugeiconsIcon
																	icon={Location01Icon}
																	size={10}
																/>
																{posting.location}
															</div>
														</Link>
													</TableCell>
													<TableCell className="px-4 hidden md:table-cell">
														<span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
															{posting.workMode}
														</span>
													</TableCell>
													<TableCell className="px-4">
														<Badge
															variant={
																STATUS_VARIANT[posting.status] ?? "muted"
															}
															showDot
															className="font-bold text-[9px] uppercase tracking-widest h-5 px-2"
														>
															{posting.status}
														</Badge>
													</TableCell>
													<TableCell className="px-4 hidden lg:table-cell">
														<div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/50">
															<HugeiconsIcon icon={Calendar01Icon} size={11} />
															{new Date(
																posting.applicationDeadline,
															).toLocaleDateString(undefined, {
																dateStyle: "medium",
															})}
														</div>
													</TableCell>
													<TableCell className="text-right pr-6">
														<div className="flex items-center justify-end gap-1.5">
															<Button
																variant="ghost"
																size="sm"
																className="h-8 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
																render={
																	<Link
																		to="/dashboard/recruitment/$id"
																		params={{ id: posting.id }}
																	/>
																}
															>
																Open
															</Button>
															<DropdownMenu>
																<DropdownMenuTrigger>
																	<Button
																		variant="ghost"
																		size="icon-sm"
																		className="h-8 w-8"
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
																	<DropdownMenuItem
																		className="rounded-xl py-2 font-semibold text-xs"
																		onClick={() => handleCopyLink(posting.id)}
																	>
																		<HugeiconsIcon
																			icon={Copy01Icon}
																			className="size-3.5 mr-2.5 text-muted-foreground/40"
																		/>
																		Copy Job Link
																	</DropdownMenuItem>
																	<DropdownMenuItem className="rounded-xl py-2 font-semibold text-xs">
																		<HugeiconsIcon
																			icon={UserAdd01Icon}
																			className="size-3.5 mr-2.5 text-muted-foreground/40"
																		/>
																		Add Candidate
																	</DropdownMenuItem>
																	<DropdownMenuItem className="rounded-xl py-2 font-semibold text-xs">
																		<HugeiconsIcon
																			icon={Mail01Icon}
																			className="size-3.5 mr-2.5 text-muted-foreground/40"
																		/>
																		Broadcast
																	</DropdownMenuItem>
																	<DropdownMenuSeparator className="bg-border/5 my-1" />
																	{posting.status !== "PUBLISHED" && (
																		<DropdownMenuItem
																			className="rounded-xl py-2 font-semibold text-xs text-success focus:bg-success/5"
																			onClick={() =>
																				handleChangeStatus(
																					posting.id,
																					"PUBLISHED",
																				)
																			}
																		>
																			<HugeiconsIcon
																				icon={JobShareIcon}
																				className="size-3.5 mr-2.5"
																			/>
																			Publish
																		</DropdownMenuItem>
																	)}
																	{posting.status !== "CLOSED" && (
																		<DropdownMenuItem
																			className="rounded-xl py-2 font-semibold text-xs text-warning focus:bg-warning/5"
																			onClick={() =>
																				handleChangeStatus(posting.id, "CLOSED")
																			}
																		>
																			<HugeiconsIcon
																				icon={Delete02Icon}
																				className="size-3.5 mr-2.5"
																			/>
																			Close Opening
																		</DropdownMenuItem>
																	)}
																	{posting.status !== "ARCHIVED" && (
																		<AlertDialog>
																			<AlertDialogTrigger>
																				<DropdownMenuItem
																					onSelect={(e) => e.preventDefault()}
																					className="rounded-xl py-2 font-semibold text-xs text-destructive focus:bg-destructive/5"
																				>
																					<HugeiconsIcon
																						icon={Delete02Icon}
																						className="size-3.5 mr-2.5"
																					/>
																					Archive
																				</DropdownMenuItem>
																			</AlertDialogTrigger>
																			<AlertDialogContent>
																				<AlertDialogHeader>
																					<AlertDialogTitle>
																						Archive this posting?
																					</AlertDialogTitle>
																					<AlertDialogDescription>
																						This will archive the posting and
																						notify pending candidates.
																					</AlertDialogDescription>
																				</AlertDialogHeader>
																				<AlertDialogFooter>
																					<AlertDialogCancel>
																						Cancel
																					</AlertDialogCancel>
																					<AlertDialogAction
																						className="bg-destructive hover:bg-destructive/90"
																						onClick={() =>
																							handleChangeStatus(
																								posting.id,
																								"ARCHIVED",
																							)
																						}
																					>
																						Archive
																					</AlertDialogAction>
																				</AlertDialogFooter>
																			</AlertDialogContent>
																		</AlertDialog>
																	)}
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</TableCell>
												</TableRow>
											))}
											{filteredPostings.length === 0 && (
												<TableRow>
													<TableCell colSpan={5} className="py-14 text-center">
														<div className="flex flex-col items-center gap-3">
															<div className="h-12 w-12 rounded-2xl bg-muted/5 border border-dashed border-border/30 flex items-center justify-center">
																<HugeiconsIcon
																	icon={Briefcase01Icon}
																	size={20}
																	className="text-muted-foreground/20"
																/>
															</div>
															<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">
																No postings found
															</p>
														</div>
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>

									<div className="px-6 py-4 border-t border-border/5 bg-muted/[0.02] flex items-center justify-between">
										<p className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.2em]">
											{filteredPostings.length} requisitions shown
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 text-[9px] font-black text-primary/50 hover:text-primary hover:bg-primary/5 uppercase tracking-widest rounded-xl"
										>
											Export All
										</Button>
									</div>
								</FramePanel>
							</Frame>
						</div>

						{/* ── Right: Sidebar ── */}
						<div className="w-full xl:w-72 space-y-4 shrink-0">
							{/* Quick stats */}
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-card rounded-2xl border border-border/30 p-4">
									<span className="text-3xl font-black text-foreground/90 tabular-nums">
										{publishedCount}
									</span>
									<p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">
										Published
									</p>
								</div>
								<div className="bg-card rounded-2xl border border-border/30 p-4">
									<span className="text-3xl font-black text-foreground/90 tabular-nums">
										{draftCount}
									</span>
									<p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">
										Drafts
									</p>
								</div>
							</div>

							{/* Recent Candidates */}
							<Frame>
								<FramePanel className="bg-card border-border/30 p-0 overflow-hidden">
									<div className="px-5 pt-5 pb-3 border-b border-border/5">
										<h3 className="text-sm font-bold text-foreground/85">
											Recent Applicants
										</h3>
										<p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-widest mt-0.5">
											Latest submissions
										</p>
									</div>
									<div className="divide-y divide-border/5">
										{applicants.slice(0, 5).map((candidate) => (
											<Link
												key={candidate.id}
												to="/dashboard/recruitment/applicant/$id"
												params={{ id: candidate.id }}
												className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/5 transition-colors group/c block"
											>
												<UserAvatar
													name={
														candidate.firstName
															? `${candidate.firstName} ${candidate.lastName}`
															: candidate.referenceCode
													}
													src={candidate.image}
													size="lg"
													className="h-8 w-8 rounded-xl ring-1 ring-border/10 shrink-0"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-bold text-foreground/80 truncate group-hover/c:text-primary transition-colors leading-tight">
														{candidate.firstName
															? `${candidate.firstName} ${candidate.lastName}`
															: candidate.referenceCode}
													</p>
													<p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-0.5">
														{candidate.status?.replace(/_/g, " ")}
													</p>
												</div>
												<span className="text-[9px] font-bold text-muted-foreground/25 tabular-nums shrink-0">
													{new Date(candidate.createdAt).toLocaleDateString(
														undefined,
														{ month: "short", day: "numeric" },
													)}
												</span>
											</Link>
										))}
										{applicants.length === 0 && (
											<div className="px-5 py-8 text-center">
												<p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">
													No applicants yet
												</p>
											</div>
										)}
									</div>
									<div className="p-4 border-t border-border/5">
										<Button
											variant="outline"
											className="w-full text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl border-border/30"
										>
											View Talent Pool
										</Button>
									</div>
								</FramePanel>
							</Frame>

							{/* External Agencies */}
							<Frame>
								<FramePanel className="bg-card border-border/30 p-5">
									<div className="flex items-center gap-3 mb-4">
										<div className="h-10 w-10 rounded-2xl bg-primary/8 flex items-center justify-center text-primary/60 border border-primary/10 shrink-0">
											<HugeiconsIcon icon={UserAdd01Icon} size={18} />
										</div>
										<div>
											<p className="text-sm font-bold text-foreground/80 leading-tight">
												External Agencies
											</p>
											<p className="text-[10px] font-medium text-muted-foreground/40 mt-0.5">
												Invite recruiters to collaborate
											</p>
										</div>
									</div>
									<Button
										variant="outline"
										className="w-full gap-2 text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl border-border/30"
									>
										Provision Access
										<HugeiconsIcon icon={ArrowRight01Icon} size={12} />
									</Button>
								</FramePanel>
							</Frame>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
