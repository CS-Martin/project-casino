"use client";

import { Button } from "@/components/ui/button"
import { SearchCheck, Loader2 } from "lucide-react"
import { useDiscoverCasinos } from "../hooks/use-discover-casinos"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export const SearchCasinosBtn = () => {
    const { discoverCasinos, isLoading } = useDiscoverCasinos();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-muted"
                type="button"
                onClick={() => setOpen(true)}
                disabled={isLoading}
                aria-disabled={isLoading}
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <SearchCheck className="size-4" />
                )}
                {isLoading ? "Discovering Casinos..." : "Manually Discover Casinos"}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will run the AI web search and may add new casinos. Do you want to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-muted"
                            type="button"
                            onClick={async () => { if (!isLoading) { await discoverCasinos(); setOpen(false); } }}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                            {isLoading ? "Running…" : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}