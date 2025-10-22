'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Calendar,
    Zap,
    ChevronDown,
    ChevronRight,
    Building2,
    AlertCircle,
} from 'lucide-react';
import { useDiscoveryLogs } from '../hooks/use-discovery-logs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableContainer } from '@/components/custom/table/table-container';

interface Duplicate {
    discovered: string;
    existing: string;
    reason: string;
    score?: number;
}

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

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
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
                            {logs.map((log: any) => {
                                const isExpanded = expandedRows.has(log._id);
                                const hasDetails = log.duplicates && log.duplicates.length > 0;

                                return (
                                    <React.Fragment key={log._id}>
                                        <TableRow className="hover:bg-muted/50">
                                            <TableCell>
                                                {hasDetails && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => toggleRow(log._id)}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-help">
                                                                {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {log.casinos_discovered}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {log.casinos_saved}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-muted-foreground">{log.casinos_skipped}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Zap className="h-3 w-3 text-yellow-600" />
                                                    {formatDuration(log.duration_ms)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={log.triggered_by === 'cron' ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {log.triggered_by === 'cron' ? '🤖 Auto' : '👤 Manual'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex justify-center cursor-help">
                                                                {log.success ? (
                                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {log.success ? 'Successful' : 'Failed'}
                                                            {log.error && (
                                                                <div className="mt-1 text-xs max-w-xs">
                                                                    <div className="truncate">• {log.error}</div>
                                                                </div>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expandable Details Row */}
                                        {isExpanded && hasDetails && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="bg-muted/30 p-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-sm mb-3">
                                                            Duplicate Casinos ({log.duplicates.length})
                                                        </h4>
                                                        <div className="grid gap-2 max-h-64 overflow-y-auto">
                                                            {log.duplicates.map((dup: Duplicate, idx: number) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-start gap-2 p-2 rounded-md bg-background border text-sm"
                                                                >
                                                                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="font-medium">{dup.discovered}</span>
                                                                            <span className="text-muted-foreground">→</span>
                                                                            <span className="text-blue-600 dark:text-blue-400">
                                                                                {dup.existing}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {dup.reason}
                                                                        </p>
                                                                        {dup.score !== undefined && (
                                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                                Similarity: {Math.round(dup.score * 100)}%
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Duplicate
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </TableContainer>
    );
}

