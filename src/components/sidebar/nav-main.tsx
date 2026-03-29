"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: React.ReactNode;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const { pathname } = useLocation();

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu className="gap-1 mt-2">
					{items.map((item) => {
						const hasChildren = item.items && item.items.length > 0;
						const isParentActive = hasChildren
							? item.items?.some((sub) => pathname.startsWith(sub.url))
							: pathname === item.url ||
								(item.url !== "/dashboard" &&
									item.url !== "/admin" &&
									pathname.startsWith(`${item.url}/`));

						if (!hasChildren) {
							return (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										tooltip={item.title}
										isActive={isParentActive}
										render={<Link to={item.url} />}
										className="group/nav relative"
									>
										<div
											className={cn(
												"transition-colors duration-200",
												isParentActive
													? "text-primary"
													: "text-muted-foreground/60 group-hover/nav:text-foreground",
											)}
										>
											{item.icon}
										</div>
										<span
											className={cn(
												"text-sm tracking-tight transition-colors duration-200",
												isParentActive
													? "text-primary font-bold"
													: "text-inherit",
											)}
										>
											{item.title}
										</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						}

						return (
							<Collapsible
								key={item.title}
								defaultOpen={isParentActive}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger
										render={
											<SidebarMenuButton
												tooltip={item.title}
												className="group/nav w-full justify-between"
											/>
										}
									>
										<div className="flex items-center gap-2">
											<div
												className={cn(
													"transition-colors duration-200",
													isParentActive
														? "text-primary"
														: "text-muted-foreground/60 group-hover/nav:text-foreground",
												)}
											>
												{item.icon}
											</div>
											<span
												className={cn(
													"text-sm tracking-tight",
													isParentActive ? "text-primary font-bold" : "",
												)}
											>
												{item.title}
											</span>
										</div>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											size={14}
											className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-open/collapsible:rotate-90 group-data-panel-open/nav:rotate-90 group-data-[state=open]/nav:rotate-90 group-data-open/nav:rotate-90 text-muted-foreground/40 shrink-0"
										/>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => {
												const isSubActive = pathname === subItem.url;
												return (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton
															isActive={isSubActive}
															render={<Link to={subItem.url as any} />}
														>
															<span
																className={cn(
																	"transition-colors",
																	isSubActive
																		? "text-primary font-bold"
																		: "text-muted-foreground hover:text-foreground",
																)}
															>
																{subItem.title}
															</span>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												);
											})}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
