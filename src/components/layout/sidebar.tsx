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
import { LayoutDashboard, BarChart3, Brain, MessageCircle } from "lucide-react"
import { Label } from "../ui/label"
import { ChatbotWidget } from "@/features/chatbot"
import { AskAiBtn } from "@/features/chatbot/components/ask-ai-btn"

const data = {

    navMain: [
        {
            title: "Casino Dashboard",
            url: "/dashboard/casino",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            title: "Offer Dashboard",
            url: "/dashboard/offer",
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            title: "AI Usage",
            url: "/dashboard/ai-usage",
            icon: <Brain className="h-5 w-5" />,
        },
    ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [chatbotOpen, setChatbotOpen] = useState(false)

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
                <AskAiBtn className="w-full mt-5" />
                <Label className="text-gray-500 text-xs px-2">Main</Label>
                <NavMain items={data.navMain} />
                {/* <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>

        </Sidebar>
    )
}