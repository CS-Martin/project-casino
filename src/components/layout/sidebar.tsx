"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavMain } from "./nav-main"
import Image from "next/image"
import { useTheme } from "next-themes"
import { FolderKanban, LayoutDashboard, BarChart3 } from "lucide-react"
import { Label } from "../ui/label"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            title: "Analytics",
            url: "/dashboard/analytics",
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            title: "Transactions",
            url: "/transaction",
            icon: <FolderKanban className="h-5 w-5" />,
        },
    ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            {!mounted ? (
                                // Show a placeholder during hydration to prevent mismatch
                                <div className="!h-12 !w-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            ) : theme === "dark" ? (
                                <Image src={'/sophons-logo-light.png'} alt="Sophons logo" height={500} width={500} className="!h-12 !w-auto" />
                            ) : (
                                <Image src={'/sophons-logo-dark.png'} alt="Sophons logo" height={500} width={500} className="!h-12 !w-auto" />
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <Label className="text-gray-500 text-xs px-2">Main</Label>
                <NavMain items={data.navMain} />
                {/* <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>
            <SidebarFooter>
                Footer
            </SidebarFooter>
        </Sidebar>
    )
}