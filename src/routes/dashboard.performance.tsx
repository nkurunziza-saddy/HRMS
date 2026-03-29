import {
	InformationCircleIcon,
	PencilEdit02Icon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
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
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/performance")({
	loader: async () => await api.getPerformanceReviews(),
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	component: PerformancePage,
});

function PerformancePage() {
	const reviews = Route.useLoaderData();
	const activeReview = reviews[0];

	if (!activeReview) {
		return (
			<main className="flex flex-1 flex-col gap-0 overflow-hidden">
				<DashboardHeader
					category="Growth & KPIs"
					title="Performance Review"
					description="Balanced Scorecard and quarterly appraisal console"
				/>
				<div className="flex-1 flex items-center justify-center">
					<p className="text-muted-foreground text-sm font-medium tracking-tight">
						No performance reviews found for this period.
					</p>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden">
			<DashboardHeader
				category="Growth & KPIs"
				title="Performance Review"
				description="Balanced Scorecard and quarterly appraisal console"
			>
				<div className="flex items-center gap-2">
					<Badge variant="muted">
						{activeReview.quarter} {activeReview.year}
					</Badge>
					<Button>
						<HugeiconsIcon icon={PencilEdit02Icon} />
						Self Appraisal
					</Button>
				</div>
			</DashboardHeader>

			<div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
				{/* Scorecard Overview */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<Frame className="lg:col-span-2">
						<FramePanel className="p-0 overflow-hidden bg-card">
							<FrameHeader>
								<div>
									<FrameTitle>Balanced Scorecard</FrameTitle>
									<FrameDescription>
										Measurement targets by organizational perspective
									</FrameDescription>
								</div>
								<Badge
									variant="info"
									className="h-6 px-3 rounded-md font-bold text-xs uppercase tracking-widest"
								>
									Status: {activeReview.status}
								</Badge>
							</FrameHeader>
							<FrameContent className="p-0">
								<div className="divide-y divide-border/5">
									{activeReview.goals.map((goal) => (
										<div
											key={goal.id}
											className="p-6 hover:bg-muted/5 transition-colors group"
										>
											<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
												<div className="space-y-1.5 flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<Badge
															variant="muted"
															className="h-5 px-1.5 bg-primary/5 text-primary border-primary/10 text-xs font-bold uppercase"
														>
															{goal.perspective}
														</Badge>
														<span className="text-xs font-bold text-muted-foreground/30 tracking-widest">
															WEIGHT: {goal.weight}%
														</span>
													</div>
													<h4 className="text-[14px] font-semibold text-foreground/90 truncate">
														{goal.objective}
													</h4>
													<p className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
														<HugeiconsIcon
															icon={TargetIcon}
															size={12}
															strokeWidth={2.5}
														/>
														Target: {goal.target}
													</p>
												</div>

												<div className="flex items-center gap-8 shrink-0">
													<div className="text-right space-y-1.5">
														<p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">
															Rating
														</p>
														<div className="flex items-center gap-1">
															{[1, 2, 3, 4].map((star) => (
																<div
																	key={star}
																	className={cn(
																		"size-2.5 rounded-full transition-all duration-500",
																		(goal.rating || 0) >= star
																			? "bg-primary shadow-[0_0_8px_var(--primary)]"
																			: "bg-muted/20",
																	)}
																/>
															))}
															<span className="ml-2 text-sm font-bold text-foreground/80 tabular-nums">
																{goal.rating || "-"}.0
															</span>
														</div>
													</div>
													<Button
														variant="ghost"
														size="icon-sm"
														className="  transition-opacity"
													>
														<HugeiconsIcon
															icon={InformationCircleIcon}
															size={16}
															className="text-muted-foreground/40"
														/>
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							</FrameContent>
						</FramePanel>
					</Frame>

					<div className="space-y-6">
						<Frame>
							<FramePanel className="p-6 bg-primary/[0.02] border-primary/10 space-y-6">
								<div className="space-y-1">
									<p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
										Overall Score
									</p>
									<div className="flex items-baseline gap-2">
										<span className="text-4xl font-light tracking-tighter text-primary">
											3.5
										</span>
										<span className="text-xs font-bold text-muted-foreground/40 uppercase">
											/ 4.0
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
										<span>Performance Tier</span>
										<span className="text-success">Meets Expectation</span>
									</div>
									<Progress value={87.5} className="h-1.5" />
								</div>
							</FramePanel>
						</Frame>

						<Frame>
							<FramePanel className="p-0 overflow-hidden bg-card">
								<FrameHeader>
									<FrameTitle>Manager Feedback</FrameTitle>
								</FrameHeader>
								<FrameContent className="p-6">
									<div className="p-4 rounded-xl bg-muted/5 border border-border/5 relative italic text-sm text-muted-foreground/80 leading-relaxed">
										"Excellent progress on technical objectives this quarter.
										Communication with stakeholders has improved significantly.
										Focus on mentoring junior staff in Q2."
										<div className="mt-4 flex items-center gap-2 not-italic">
											<UserAvatar
												src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&h=120&auto=format&fit=crop"
												name="Alice"
												size="sm"
												className="size-5"
											/>
											<span className="text-xs font-bold text-foreground/60">
												Alice Johnson (Manager)
											</span>
										</div>
									</div>
								</FrameContent>
							</FramePanel>
						</Frame>
					</div>
				</section>
			</div>
		</main>
	);
}
