import * as React from "react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

const defaultPageSizeOptions = [10, 20, 50, 100];

export function PageSizeSelector({
    pageSize,
    onPageSizeChange,
    pageSizeOptions = defaultPageSizeOptions,
    className
}: PageSizeSelectorProps) {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
                <SelectTrigger size="sm" >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
