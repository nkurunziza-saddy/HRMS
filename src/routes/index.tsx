import {
	ArrowRight01Icon,
	ChartBarLineIcon,
	FlashIcon,
	Globe02Icon,
	Shield01Icon,
	Tick01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCookie } from "@/lib/cookies";
import { store } from "@/lib/redux/store";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		if (typeof window === "undefined") return;

		const token = getCookie("auth_token");
		const state = store.getState();
		const { user } = state.auth;

		if (token && user) {
			const isVerified = user.status === "ACTIVE";
			const needsPasswordChange =
				(user.role === "COMPANY_ADMIN" || user.role === "EMPLOYEE") &&
				!user.passwordResetAt;

			if (isVerified && !needsPasswordChange) {
				if (user.role === "ADMIN") {
					throw redirect({
						to: "/admin",
					});
				}
				throw redirect({
					to: "/dashboard",
				});
			}
		}
	},
	component: Home,
});

function Home() {
	const features = [
		{
			icon: UserGroupIcon,
			title: "Employee Management",
			description:
				"Centralized employee database with comprehensive profile management",
		},
		{
			icon: ChartBarLineIcon,
			title: "Analytics & Reports",
			description:
				"Real-time insights and detailed reports on workforce metrics",
		},
		{
			icon: Shield01Icon,
			title: "Security",
			description: "Enterprise-grade security with role-based access control",
		},
		{
			icon: FlashIcon,
			title: "Performance",
			description: "Lightning-fast load times and seamless user experience",
		},
		{
			icon: Globe02Icon,
			title: "Multi-Company",
			description: "Support for multiple companies with isolated data",
		},
		{
			icon: Tick01Icon,
			title: "Compliance",
			description: "Built-in compliance features for regulatory requirements",
		},
	];

	const stats = [
		{ number: "1M+", label: "Employees Managed" },
		{ number: "500+", label: "Companies" },
		{ number: "99.9%", label: "Uptime" },
		{ number: "24/7", label: "Support" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
			<header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Logo className="size-8" />
						<span className="font-bold text-foreground">HRMS</span>
					</div>
					<nav className="hidden md:flex items-center gap-8">
						<a
							href="#features"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Features
						</a>
						<a
							href="#stats"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Stats
						</a>
						<a
							href="#"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Pricing
						</a>
						<a
							href="#"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Contact
						</a>
					</nav>
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="default"
							render={<Link to="/auth/login" />}
						>
							Sign In
						</Button>
						<Button
							size="default"
							className="bg-primary hover:bg-primary/90 text-primary-foreground"
							render={<Link to="/auth/login" />}
						>
							Get Started
						</Button>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
				<div className="text-center space-y-8 animate-fade-in">
					<div className="space-y-4">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
							Modern HRMS for Growing Companies
						</h1>
						<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
							Streamline your human resources management with our comprehensive,
							enterprise-grade HR system designed for efficiency and compliance.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button
							size="lg"
							className="bg-primary hover:bg-primary/90 text-primary-foreground group"
							render={<Link to="/auth/login" />}
						>
							Start Free Trial
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="group-hover:translate-x-0.5 transition-transform"
							/>
						</Button>
						<Button
							size="lg"
							variant="outline"
							render={<Link to="/auth/login" />}
						>
							View Demo
						</Button>
					</div>

					{/* Stats */}
					<div
						id="stats"
						className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12"
					>
						{stats.map((stat, idx) => (
							<div key={idx} className="space-y-1">
								<p className="text-3xl sm:text-4xl font-bold text-primary">
									{stat.number}
								</p>
								<p className="text-sm text-muted-foreground">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
			>
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground">
						Powerful Features
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Everything you need to manage your workforce effectively
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, idx) => {
						const Icon = feature.icon;
						return (
							<Card key={idx} className="p-6 hover-lift">
								<div className="space-y-4">
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
										<HugeiconsIcon icon={Icon} className="w-6 h-6" />
									</div>
									<div>
										<h3 className="font-bold text-foreground mb-2">
											{feature.title}
										</h3>
										<p className="text-sm text-muted-foreground">
											{feature.description}
										</p>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</section>

			{/* CTA Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
				<Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
					<div className="text-center space-y-6">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground">
							Ready to Transform Your HR?
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Join thousands of companies that have streamlined their HR
							operations with HRMS. Start your free trial today.
						</p>
						<Button
							size="lg"
							className="bg-primary hover:bg-primary/90 text-primary-foreground group"
							render={<Link to="/auth/login" />}
						>
							Get Started Now
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="group-hover:translate-x-0.5 transition-transform"
							/>
						</Button>
					</div>
				</Card>
			</section>

			<footer className="border-t border-border bg-muted/30 mt-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<Logo className="size-6" />
								<span className="font-bold text-foreground">HRMS</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Modern HR management for growing companies
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-4">Product</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Features
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Pricing
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Security
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-4">Company</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										About
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Blog
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Contact
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-4">Legal</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Privacy
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Terms
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-foreground transition-colors"
									>
										Compliance
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground">
							© 2026 HRMS. All rights reserved.
						</p>
						<div className="flex gap-6">
							<a
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								Twitter
							</a>
							<a
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								LinkedIn
							</a>
							<a
								href="#"
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								GitHub
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
