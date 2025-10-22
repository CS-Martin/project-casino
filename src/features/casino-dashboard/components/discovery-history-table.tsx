'use client';

import * as React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Calendar, Building2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { TableContainer } from '@/components/custom/table/table-container';
import { useDiscoveryLogs } from '../hooks/use-discovery-logs';
import { DiscoveryLogRow } from './discovery-history/discovery-log-row';

export function DiscoveryHistoryTable() {
    const { logs, stats, isLoading } = useDiscoveryLogs(5);
    const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

    const toggleRow = (logId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(logId)) {
                next.delete(logId);
            } else {
                next.add(logId);
            }
            return next;
        });
    };

    if (isLoading) {
        return (
            <TableContainer
                title="Discovery History"
                description="Last 5 automated casino discovery runs"
                className="flex flex-col h-full"
                contentClassName="flex-1"
            >
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </TableContainer>
        );
    }

    const tableTitle = (
        <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            Discovery History
        </div>
    );

    const tableDescription = (
        <div className="flex items-center justify-between">
            <span>Last 5 automated casino discovery runs</span>
            {stats && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-semibold">{stats.totalRuns}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Total discovery runs tracked</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );

    return (
        <TableContainer
            title={tableTitle}
            description={tableDescription}
            className="flex flex-col h-full"
            contentClassName="flex-1"
        >
            {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No discovery history yet</p>
                    <p className="text-sm">Discovery runs will appear here</p>
                </div>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>When</TableHead>
                                <TableHead className="text-center">Discovered</TableHead>
                                <TableHead className="text-center">Saved</TableHead>
                                <TableHead className="text-center">Skipped</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log: any) => (
                                <DiscoveryLogRow
                                    key={log._id}
                                    log={log}
                                    isExpanded={expandedRows.has(log._id)}
                                    onToggle={() => toggleRow(log._id)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </TableContainer>
    );
}

