import {
	ArrowLeft01Icon,
	Briefcase02Icon,
	Calendar01Icon,
	CheckmarkCircle01Icon,
	Clock02Icon,
	FileUploadIcon,
	Location01Icon,
	Mail01Icon,
	SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateApplicantMutation } from "@/lib/redux/api/applicant";
import { useGetJobPostingQuery } from "@/lib/redux/api/job-posting";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply/$jobId")({
	component: ApplyForJobPage,
});

function ApplyForJobPage() {
	const { jobId } = Route.useParams();
	const { data: job, isLoading, isError } = useGetJobPostingQuery(jobId);
	const [createApplicant] = useCreateApplicantMutation();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		documentNumber: "",
		gender: "MALE" as "MALE" | "FEMALE",
		coverLetter: "",
		resume: null as File | null,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.phone ||
			!formData.documentNumber
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!formData.resume) {
			toast.error("Please upload your Resume / CV");
			return;
		}

		setIsSubmitting(true);
		try {
			if (job) {
				const data = new FormData();
				data.append("firstName", formData.firstName);
				data.append("lastName", formData.lastName);
				data.append("email", formData.email);
				data.append("phoneNumber", formData.phone);
				data.append("jobPostId", jobId);
				data.append("documentNumber", formData.documentNumber);
				data.append("gender", formData.gender);
				if (formData.coverLetter) data.append("coverLetter", formData.coverLetter);
				data.append("resume", formData.resume);

				await createApplicant(data).unwrap();
			}
			setIsSuccess(true);
			toast.success("Application submitted successfully!");
		} catch (err: any) {
			console.error(err);
			toast.error(err?.data?.message || "Failed to submit application");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
				<div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
				<p className="text-sm font-semibold text-muted-foreground">
					Loading Position...
				</p>
			</div>
		);
	}

	if (isError || !job) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
				<div className="h-16 w-16 bg-muted/50 text-muted-foreground rounded-xl flex items-center justify-center mb-6">
					<HugeiconsIcon icon={Briefcase02Icon} size={24} />
				</div>
				<h1 className="text-xl font-bold mb-2">Job Opening Unavailable</h1>
				<p className="text-sm text-muted-foreground mb-8 max-w-sm">
					This position may have been filled or the application window has
					closed.
				</p>
				<Button onClick={() => window.history.back()} variant="outline">
					Return to Careers
				</Button>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
				<div className="h-20 w-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
					<HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} />
				</div>
				<h1 className="text-2xl font-bold tracking-tight mb-4">
					Application Submitted
				</h1>
				<p className="text-muted-foreground text-sm mb-10 max-w-sm leading-relaxed">
					Your application for{" "}
					<span className="font-semibold text-foreground">{job.title}</span> has
					been successfully transmitted to our team.
				</p>
				<div className="flex gap-3">
					<Button
						onClick={() => (window.location.href = "/")}
						variant="outline"
					>
						Return Home
					</Button>
					<Button onClick={() => setIsSuccess(false)}>Apply for Another</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-muted/20">
			{/* Top Navigation */}
			<nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<Logo className="size-7" />
						<span className="text-sm font-bold tracking-tight uppercase">
							HRMS Careers
						</span>
					</Link>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => window.history.back()}
						className="text-xs font-semibold gap-2"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
						Back
					</Button>
				</div>
			</nav>

			<main className="max-w-6xl mx-auto px-6 py-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left Column: Job Details */}
					<div className="lg:col-span-5 space-y-6">
						<Frame>
							<FramePanel className="bg-card">
								<FrameHeader>
									<div>
										<FrameTitle>{job.title}</FrameTitle>
										<FrameDescription>Position Overview</FrameDescription>
									</div>
								</FrameHeader>
								<FrameContent className="space-y-6">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												Location
											</p>
											<div className="flex items-center gap-2 text-sm font-medium">
												<HugeiconsIcon
													icon={Location01Icon}
													size={14}
													className="text-muted-foreground/60"
												/>
												{job.location}
											</div>
										</div>
										<div className="space-y-1">
											<p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												Work Mode
											</p>
											<div className="flex items-center gap-2 text-sm font-medium">
												<HugeiconsIcon
													icon={Clock02Icon}
													size={14}
													className="text-muted-foreground/60"
												/>
												{job.workMode}
											</div>
										</div>
										<div className="space-y-1">
											<p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												Deadline
											</p>
											<div className="flex items-center gap-2 text-sm font-medium">
												<HugeiconsIcon
													icon={Calendar01Icon}
													size={14}
													className="text-muted-foreground/60"
												/>
												{new Date(job.applicationDeadline).toLocaleDateString()}
											</div>
										</div>
										<div className="space-y-1">
											<p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												Status
											</p>
											<div className="flex items-center gap-2 text-sm font-medium">
												<HugeiconsIcon
													icon={Briefcase02Icon}
													size={14}
													className="text-muted-foreground/60"
												/>
												{job.status}
											</div>
										</div>
									</div>

									{job.aboutRole && (
										<div className="space-y-3 pt-4 border-t border-border/50">
											<h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												About the Role
											</h4>
											<p className="text-sm leading-relaxed text-muted-foreground">
												{job.aboutRole}
											</p>
										</div>
									)}

									{job.mission && (
										<div className="space-y-3 pt-4 border-t border-border/50">
											<h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												Mission
											</h4>
											<p className="text-sm leading-relaxed text-muted-foreground">
												{job.mission}
											</p>
										</div>
									)}

									{job.sections && job.sections.length > 0 && (
										<div className="space-y-3 pt-4 border-t border-border/50">
											{job.sections.map((section) => (
												<div key={section.id} className="space-y-2">
													<h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
														{section.title}
													</h4>
													{section.items && section.items.length > 0 && (
														<ul className="space-y-1.5">
															{section.items.map((item, i) => (
																<li
																	key={i}
																	className="flex items-start gap-2 text-sm text-muted-foreground"
																>
																	<span className="mt-1.5 size-1.5 rounded-full bg-primary/40 shrink-0" />
																	{item.content}
																</li>
															))}
														</ul>
													)}
												</div>
											))}
										</div>
									)}

									{job.skills && job.skills.length > 0 && (
										<div className="space-y-3 pt-4 border-t border-border/50">
											<h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
												Skills
											</h4>
											<div className="flex flex-wrap gap-2">
												{job.skills.map((skill) => (
													<span
														key={skill.id}
														className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
															skill.isRequired
																? "bg-primary/5 text-primary border-primary/20"
																: "bg-muted/50 text-muted-foreground border-border/40"
														}`}
													>
														{skill.name}
														{skill.isRequired && (
															<span className="text-[9px] font-black uppercase tracking-wider opacity-60">
																req
															</span>
														)}
													</span>
												))}
											</div>
										</div>
									)}
								</FrameContent>
							</FramePanel>
						</Frame>
					</div>

					{/* Right Column: Application Form */}
					<div className="lg:col-span-7">
						<Frame>
							<FramePanel className="bg-card">
								<FrameHeader>
									<div>
										<FrameTitle>Apply Now</FrameTitle>
										<FrameDescription>
											Submit your professional profile
										</FrameDescription>
									</div>
								</FrameHeader>
								<FrameContent>
									<form onSubmit={handleSubmit} className="space-y-6">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor="firstName"
													className="text-xs font-semibold text-muted-foreground/70"
												>
													First Name
												</Label>
												<Input
													id="firstName"
													placeholder="Jean"
													className="h-10 rounded-lg bg-muted/5 focus:bg-background transition-colors"
													value={formData.firstName}
													onChange={(e) =>
														setFormData({
															...formData,
															firstName: e.target.value,
														})
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="lastName"
													className="text-xs font-semibold text-muted-foreground/70"
												>
													Last Name
												</Label>
												<Input
													id="lastName"
													placeholder="Mugisha"
													className="h-10 rounded-lg bg-muted/5 focus:bg-background transition-colors"
													value={formData.lastName}
													onChange={(e) =>
														setFormData({
															...formData,
															lastName: e.target.value,
														})
													}
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor="email"
													className="text-xs font-semibold text-muted-foreground/70 flex items-center gap-2"
												>
													<HugeiconsIcon icon={Mail01Icon} size={14} />
													Email Address
												</Label>
												<Input
													id="email"
													type="email"
													placeholder="email@example.com"
													className="h-10 rounded-lg bg-muted/5 focus:bg-background transition-colors"
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="phone"
													className="text-xs font-semibold text-muted-foreground/70 flex items-center gap-2"
												>
													<HugeiconsIcon icon={SmartPhone01Icon} size={14} />
													Phone Number
												</Label>
												<Input
													id="phone"
													type="tel"
													placeholder="+250..."
													className="h-10 rounded-lg bg-muted/5 focus:bg-background transition-colors"
													value={formData.phone}
													onChange={(e) =>
														setFormData({ ...formData, phone: e.target.value })
													}
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor="documentNumber"
													className="text-xs font-semibold text-muted-foreground/70"
												>
													ID / Document Number
												</Label>
												<Input
													id="documentNumber"
													placeholder="11990..."
													className="h-10 rounded-lg bg-muted/5 focus:bg-background transition-colors"
													value={formData.documentNumber}
													onChange={(e) =>
														setFormData({
															...formData,
															documentNumber: e.target.value,
														})
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="gender"
													className="text-xs font-semibold text-muted-foreground/70"
												>
													Gender
												</Label>
												<Select
													value={formData.gender}
													onValueChange={(val) =>
														setFormData({
															...formData,
															gender: val as "MALE" | "FEMALE",
														})
													}
												>
													<SelectTrigger className="h-10 rounded-lg bg-muted/5 focus:bg-background">
														<SelectValue placeholder="Select Gender" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="MALE">Male</SelectItem>
														<SelectItem value="FEMALE">Female</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="coverLetter"
												className="text-xs font-semibold text-muted-foreground/70"
											>
												Cover Letter (Optional)
											</Label>
											<Textarea
												id="coverLetter"
												placeholder="Tell us about yourself..."
												className="min-h-[120px] rounded-lg bg-muted/5 focus:bg-background transition-colors resize-none"
												value={formData.coverLetter}
												onChange={(e) =>
													setFormData({
														...formData,
														coverLetter: e.target.value,
													})
												}
											/>
										</div>

										<div className="space-y-3">
											<Label className="text-xs font-semibold text-muted-foreground/70 flex items-center gap-2">
												<HugeiconsIcon icon={FileUploadIcon} size={14} />
												Resume / CV
											</Label>
											<div className="relative group">
												<input
													type="file"
													id="resume"
													className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
													accept=".pdf,.doc,.docx"
													onChange={(e) =>
														setFormData({
															...formData,
															resume: e.target.files?.[0] || null,
														})
													}
												/>
												<div
													className={cn(
														"h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
														formData.resume
															? "border-primary/40 bg-primary/5"
															: "border-border/60 hover:border-primary/40 hover:bg-muted/30",
													)}
												>
													<HugeiconsIcon
														icon={
															formData.resume
																? CheckmarkCircle01Icon
																: FileUploadIcon
														}
														size={20}
														className={
															formData.resume
																? "text-primary"
																: "text-muted-foreground/40"
														}
													/>
													<p className="text-xs font-semibold">
														{formData.resume
															? formData.resume.name
															: "Click to upload CV"}
													</p>
													<p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest">
														PDF, DOC up to 10MB
													</p>
												</div>
											</div>
										</div>
									</form>
								</FrameContent>
								<FrameFooter className="flex items-center justify-end p-4">
									<Button onClick={handleSubmit} disabled={isSubmitting}>
										{isSubmitting ? "Submitting..." : "Submit Application"}
									</Button>
								</FrameFooter>
							</FramePanel>
						</Frame>
					</div>
				</div>
			</main>

			<footer className="py-12 border-t border-border bg-background/50">
				<div className="max-w-6xl mx-auto px-6 text-center">
					<p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
						&copy; 2024 HRMS Infrastructure &bull; All Rights Reserved
					</p>
				</div>
			</footer>
		</div>
	);
}
