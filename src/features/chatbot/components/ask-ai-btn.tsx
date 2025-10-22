import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { ChatbotWidget } from "./chatbot-widget"
import { cn } from "@/lib/utils"

export const AskAiBtn = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
    const [chatbotOpen, setChatbotOpen] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setChatbotOpen(true)}
                title="Open AI Assistant"
                className={cn("flex px-3 items-center gap-2 w-full sm:w-auto bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/40 dark:hover:to-blue-900/40 border-purple-200 dark:border-purple-800", className)}
                {...props}
            >
                <Sparkles className="h-5 w-5" />
                Ask AI
            </Button>
            <ChatbotWidget
                open={chatbotOpen}
                onOpenChange={setChatbotOpen}
                showFloatingButton={false}
            />
        </>
    )
}