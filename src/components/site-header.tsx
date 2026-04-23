"use client";

import {
	Moon01Icon,
	Notification01Icon,
	Search02Icon,
	Settings02Icon,
	Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetCompanyQuery } from "@/lib/redux/api/company";
import { useGetEmployeeQuery } from "@/lib/redux/api/employee";
import { useGetJobPostingQuery } from "@/lib/redux/api/job-posting";

const routeLabels: Record<string, string> = {
	dashboard: "Overview",
	employees: "Employees",
	reports: "Reports",
	calendar: "Calendar",
	payroll: "Payroll",
	analytics: "Analytics",
	recruitment: "Recruitment",
	settings: "Settings",
	help: "Help Center",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function SiteHeader() {
	const { pathname } = useLocation();
	const segments = pathname.split("/").filter(Boolean);
	const { theme, setTheme } = useTheme();

	const lastSegment = segments[segments.length - 1] ?? "";
	const parentSegment = segments[segments.length - 2] ?? "";
	const isEmployeeDetail = parentSegment === "employees" && UUID_RE.test(lastSegment);
	const isRecruitmentDetail = parentSegment === "recruitment" && UUID_RE.test(lastSegment);
	const isCompanyDetail = parentSegment === "companies" && UUID_RE.test(lastSegment);

	const { data: employee } = useGetEmployeeQuery(lastSegment, {
		skip: !isEmployeeDetail,
	});
	const { data: jobPosting } = useGetJobPostingQuery(lastSegment, {
		skip: !isRecruitmentDetail,
	});
	const { data: company } = useGetCompanyQuery(lastSegment, {
		skip: !isCompanyDetail,
	});

	const getLabel = (s: string) => {
		if (UUID_RE.test(s) && parentSegment === "employees") {
			return employee ? `${employee.firstName} ${employee.lastName}` : "…";
		}
		if (UUID_RE.test(s) && parentSegment === "recruitment") {
			return jobPosting ? jobPosting.title : "…";
		}
		if (UUID_RE.test(s) && parentSegment === "companies") {
			return company ? company.name : "…";
		}
		return routeLabels[s] || s;
	};

	const labels = segments.map(getLabel);
	const currentLabel = labels[labels.length - 1] || "Dashboard";
	const parentLabel = labels.length > 1 ? labels[labels.length - 2] : null;

	return (
		<header className="flex h-(--header-height) w-full shrink-0 items-center justify-between gap-2 border-b border-border/20 bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-50">
			<div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ms-1 text-muted-foreground hover:text-foreground transition-colors" />
				<Separator
					orientation="vertical"
					className="mx-2 h-4 data-vertical:self-auto bg-border/40"
				/>
				<div className="flex items-center gap-2">
					<div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground/60 tracking-wide">
						{parentLabel && (
							<>
								<span className="hover:text-foreground cursor-pointer transition-colors capitalize">
									{parentLabel}
								</span>
								<span className="text-border/60">/</span>
							</>
						)}
						<span className="text-foreground tracking-tight capitalize">
							{currentLabel}
						</span>
					</div>
					<div className="sm:hidden text-sm font-semibold tracking-tight text-foreground capitalize">
						{currentLabel}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-3 px-4 lg:px-6">
				<div className="hidden md:flex relative group">
					<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
						<HugeiconsIcon
							icon={Search02Icon}
							className="size-4"
							strokeWidth={2}
						/>
					</div>
					<input
						type="text"
						placeholder="Search directory…"
						className="h-9 w-64 rounded-xl border border-border/40 bg-muted/10 pl-9 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/30 hover:border-border/60 focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/5"
					/>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2">
						<kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-lg border border-border/40 bg-muted/5 px-2 font-sans text-xs font-medium text-muted-foreground/70">
							<span className="text-xs leading-none">⌘</span>K
						</kbd>
					</div>
				</div>

				<div className="flex items-center gap-0.5 pl-2">
					<Button
						variant="ghost"
						size="icon-lg"
						className="relative text-muted-foreground/70"
						aria-label="Theme toggle"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						<HugeiconsIcon
							icon={theme === "dark" ? Sun01Icon : Moon01Icon}
							className="size-5 group-hover/button:scale-105 transition-transform"
							strokeWidth={1.5}
						/>
					</Button>

					<Button
						variant="ghost"
						size="icon-lg"
						className="relative text-muted-foreground/70"
						aria-label="Notifications"
					>
						<HugeiconsIcon
							icon={Notification01Icon}
							className="size-5 group-hover/button:scale-105 transition-transform"
							strokeWidth={1.5}
						/>
						<span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-destructive shadow-[0_0_4px_--theme(--color-destructive)] animate-pulse" />
					</Button>

					<Button
						variant="ghost"
						size="icon-lg"
						className="relative text-muted-foreground/70"
						aria-label="Settings"
						render={<Link to="/dashboard/settings" />}
					>
						<HugeiconsIcon
							icon={Settings02Icon}
							className="size-5 group-hover/button:scale-105 transition-transform"
							strokeWidth={1.5}
						/>
					</Button>
				</div>
			</div>
		</header>
	);
}
