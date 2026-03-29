import {
	Download01Icon,
	File02Icon,
	FolderSecurityIcon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
	Sorting05Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/documents")({
	loader: async () => await api.getDocuments(),
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	component: DocumentsPage,
});

function DocumentsPage() {
	const documents = Route.useLoaderData();
	const [searchTerm, setSearchTerm] = useState("");

	const filtered = documents.filter((doc) => {
		const fileName = doc.fileName || "";
		const employeeName = doc.employeeName || "";
		return (
			fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			employeeName.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden">
			<DashboardHeader
				category="Storage"
				title="Document Vault"
				description="Centralized management for employee records and company policies"
			>
				<Button size="lg" className="font-bold gap-2">
					<HugeiconsIcon icon={PlusSignCircleIcon} size={14} strokeWidth={2} />
					Upload New
				</Button>
			</DashboardHeader>

			<div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
				{/* Shared Stat Cards */}
				<section className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<StatCard
						label="Contracts"
						value="48 Files"
						icon={File02Icon}
						variant="primary"
					/>
					<StatCard
						label="Identities"
						value="132 Files"
						icon={FolderSecurityIcon}
						variant="success"
					/>
					<StatCard
						label="Experience"
						value="24 Files"
						icon={File02Icon}
						variant="info"
					/>
					<StatCard
						label="Policies"
						value="12 Files"
						icon={FolderSecurityIcon}
						variant="accent"
					/>
				</section>

				{/* Master Table */}
				<section>
					<Frame className="group/frame">
						<FramePanel className="p-0 overflow-hidden bg-card">
							<FrameHeader className="border-b-0 pb-2">
								<div>
									<FrameTitle>All Digital Records</FrameTitle>
									<FrameDescription>
										Secure file repository with version control
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
										placeholder="Search by filename or employee…"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 h-9 rounded-lg border-border/40 bg-muted/5 focus:bg-background transition-all text-xs"
									/>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="gap-2 font-bold text-xs"
								>
									<HugeiconsIcon icon={Sorting05Icon} size={14} />
									Category
								</Button>
							</div>

							<FrameContent className="p-0">
								<Table>
									<TableHeader className="bg-muted/10">
										<TableRow className="hover:bg-transparent border-border/5">
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest pl-6">
												Document
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
												Type
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
												Owner
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
												Uploaded
											</TableHead>
											<TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2 text-right pr-6">
												Action
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filtered.map((doc) => (
											<TableRow
												key={doc.id}
												className="border-border/5 hover:bg-muted/5 transition-colors group"
											>
												<TableCell className="pl-6 py-3">
													<div className="flex items-center gap-3">
														<div className="size-9 rounded-xl bg-muted/5 border border-border/10 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
															<HugeiconsIcon icon={File02Icon} size={16} />
														</div>
														<div>
															<p className="text-sm font-semibold text-foreground/90 leading-none">
																{doc.fileName}
															</p>
															<p className="text-xs font-medium text-muted-foreground/40 mt-1 uppercase tracking-tight">
																{doc.fileSize}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell className="px-2">
													<Badge
														variant="muted"
														className="bg-muted/10 border-none font-bold text-xs uppercase tracking-wider"
													>
														{doc.type}
													</Badge>
												</TableCell>
												<TableCell className="px-2 text-sm font-medium text-foreground/70">
													{doc.employeeName}
												</TableCell>
												<TableCell className="px-2 text-xs font-bold text-muted-foreground/40 tabular-nums">
													{formatDate(doc.uploadedAt)}
												</TableCell>
												<TableCell className="text-right pr-6">
													<div className="flex items-center justify-end gap-1">
														<Button
															variant="outline"
															size="icon-sm"
															className="  transition-opacity"
															aria-label="Download"
														>
															<HugeiconsIcon
																icon={Download01Icon}
																size={16}
																className="text-muted-foreground/40"
															/>
														</Button>
														<Button
															variant="outline"
															size="icon-sm"
															className="  transition-opacity"
															aria-label="More"
														>
															<HugeiconsIcon
																icon={MoreHorizontalIcon}
																size={16}
																className="text-muted-foreground/40"
															/>
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</FrameContent>
							<FrameFooter>
								<span className="text-xs text-muted-foreground/40 font-bold capitalize tracking-widest">
									Secure storage audited daily
								</span>
							</FrameFooter>
						</FramePanel>
					</Frame>
				</section>
			</div>
		</main>
	);
}
