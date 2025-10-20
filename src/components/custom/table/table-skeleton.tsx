// components/table/table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
    rows?: number;
    columns: number;
    columnWidths?: string[]; // e.g., ["w-32", "w-24", "w-20"]
}

export function TableSkeleton({ rows = 5, columns, columnWidths }: TableSkeletonProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {Array.from({ length: columns }).map((_, i) => (
                        <TableHead key={i}>
                            <Skeleton className={`h-4 ${columnWidths?.[i] || "w-20"}`} />
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <TableCell key={colIndex}>
                                <Skeleton className={`h-4 ${columnWidths?.[colIndex] || "w-20"}`} />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}