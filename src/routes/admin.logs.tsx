import {
	Download01Icon,
	FilterIcon,
	InformationCircleIcon,
	Search01Icon,
	Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/mock-api";

export const Route = createFileRoute("/admin/logs")({
	loader: async () => await api.getSystemLogs(),
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	component: SystemLogsPage,
});

function SystemLogsPage() {
	const logs = Route.useLoaderData();
	const [searchTerm, setSearchTerm] = useState("");

	const filtered = logs.filter((log) => {
		const event = log.event || "";
		const actor = log.actor || "";
		return (
			event.toLowerCase().includes(searchTerm.toLowerCase()) ||
			actor.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden">
			<DashboardHeader
				category="Security & Compliance"
				title="System Audit Logs"
				description="Real-time trail of administrative actions and automated system events"
			>
				<Button variant="outline">
					<HugeiconsIcon icon={Download01Icon} />
					Export CSV
				</Button>
			</DashboardHeader>

			<div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
				<section>
					<Frame className="group/frame">
						<FramePanel className="p-0 overflow-hidden bg-card">
							<FrameHeader className="border-b-0 pb-2">
								<div>
									<FrameTitle>Audit Trail</FrameTitle>
									<FrameDescription>
										Immutable record of platform activity
									</FrameDescription>
								</div>
							</FrameHeader>

							<div className="px-6 pb-5 pt-2 flex flex-col sm:flex-row items-center gap-3 border-b border-border/5">
								<div className="relative flex-1 w-full max-w-md">
									<HugeiconsIcon
										icon={Search01Icon}
										className="absolute left-3 top-2.5 size-4 text-muted-foreground/40"
										strokeWidth={2}
									/>
									<Input
										placeholder="Filter by event or actor…"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 h-9 rounded-lg border-border/40 bg-muted/5 focus:bg-background transition-all text-xs"
									/>
								</div>
								<Button variant="outline" size="sm">
									<HugeiconsIcon icon={FilterIcon} />
									Levels
								</Button>
							</div>

							<FrameContent className="p-0">
								<Table>
									<TableHeader className="bg-muted/10">
										<TableRow className="hover:bg-transparent border-border/5">
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest pl-6">
												Timestamp
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
												Level
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
												Event
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
												Actor
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2 text-right pr-6">
												IP Address
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filtered.map((log) => (
											<TableRow
												key={log.id}
												className="border-border/5 hover:bg-muted/5 transition-colors group"
											>
												<TableCell className="pl-6 py-3">
													<span className="text-xs font-bold text-muted-foreground/40 tabular-nums">
														{log.timestamp}
													</span>
												</TableCell>
												<TableCell className="px-2">
													<Badge
														variant={
															log.level === "security"
																? "destructive"
																: log.level === "error"
																	? "warning"
																	: "muted"
														}
														showDot
														className="bg-transparent border-none p-0 text-foreground/70"
													>
														{log.level}
													</Badge>
												</TableCell>
												<TableCell className="px-2">
													<p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
														{log.event}
													</p>
												</TableCell>
												<TableCell className="px-2">
													<div className="flex items-center gap-2">
														<div className="size-6 rounded-lg bg-muted/10 flex items-center justify-center text-muted-foreground/40">
															<HugeiconsIcon
																icon={InformationCircleIcon}
																size={12}
															/>
														</div>
														<span className="text-xs font-bold text-foreground/60">
															{log.actor}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-right pr-6">
													<span className="text-xs font-mono text-muted-foreground/30 tabular-nums">
														{log.ipAddress}
													</span>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</FrameContent>
							<FrameFooter>
								<div className="flex items-center gap-2 text-muted-foreground/40">
									<HugeiconsIcon icon={Shield01Icon} size={14} />
									<span className="text-xs font-bold capitalize tracking-widest">
										Signed & Verified by Secure Engine
									</span>
								</div>
							</FrameFooter>
						</FramePanel>
					</Frame>
				</section>
			</div>
		</main>
	);
}
