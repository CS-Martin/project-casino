"use client"

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"
import { ChatbotWidget } from "@/features/chatbot"

export function SiteHeader() {
    const [mounted, setMounted] = useState(false)
    const [chatbotOpen, setChatbotOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Don't render the theme toggle until we're on the client
    if (!mounted) {
        return (
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
                <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                    <h1 className="text-base font-medium">Dashboard</h1>
                </div>
            </header>
        )
    }

    return (
        <>
            <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
                <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                    <div className="ml-auto flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setChatbotOpen(true)}
                            title="Open AI Assistant"
                            className="flex px-3 items-center gap-2 w-full sm:w-auto bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/40 dark:hover:to-blue-900/40 border-purple-200 dark:border-purple-800"
                        >
                            <Sparkles className="h-5 w-5" />
                            Ask AI
                        </Button>
                        <AnimatedThemeToggler />
                    </div>
                </div>
            </header>
            <ChatbotWidget
                open={chatbotOpen}
                onOpenChange={setChatbotOpen}
                showFloatingButton={false}
            />
        </>
    )
}