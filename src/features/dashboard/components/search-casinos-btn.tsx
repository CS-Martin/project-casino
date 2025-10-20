"use client";

import { Button } from "@/components/ui/button"
import { SearchCheck, Loader2 } from "lucide-react"
import { useDiscoverCasinos } from "../hooks/use-discover-casinos"

export const SearchCasinosBtn = () => {
    const { discoverCasinos, isLoading, error } = useDiscoverCasinos();

    return (
        <Button
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-muted"
            type="button"
            onClick={() => { if (!isLoading) { void discoverCasinos(); } }}
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
    )
}