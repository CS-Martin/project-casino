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
    Sparkles,
    SkipForward,
    AlertCircle,
} from 'lucide-react';
import { useResearchLogs } from '../hooks/use-research-logs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableContainer } from '@/components/custom/table/table-container';

interface OfferDetail {
    casino_name: string;
    offer_name: string;
    action: string;
    reason?: string;
    offer_type?: string;
    expected_bonus?: number;
}

export function ResearchHistoryTable() {
    const { logs, stats, isLoading } = useResearchLogs(7);
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

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created':
                return <Sparkles className="h-3 w-3 text-green-600" />;
            case 'expired':
                return <AlertCircle className="h-3 w-3 text-orange-600" />;
            case 'skipped':
                return <SkipForward className="h-3 w-3 text-gray-500" />;
            default:
                return null;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created':
                return 'text-green-600 dark:text-green-400';
            case 'expired':
                return 'text-orange-600 dark:text-orange-400';
            case 'skipped':
                return 'text-gray-600 dark:text-gray-400';
            default:
                return 'text-gray-500';
        }
    };

    if (isLoading) {
        return (
            <TableContainer
                title="Research History"
                description="Last 5 automated offer research runs"
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
            <Clock className="h-5 w-5 text-blue-600" />
            Research History
        </div>
    );

    const tableDescription = (
        <div className="flex items-center justify-between">
            <span>Last 5 automated offer research runs</span>
            {stats && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-semibold">{stats.totalRuns}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Total research runs tracked</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );

    return (
        <TableContainer
            title={tableTitle}
            description={tableDescription}
        >
            {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No research history yet</p>
                    <p className="text-sm">Research runs will appear here</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>When</TableHead>
                                <TableHead>Casinos</TableHead>
                                <TableHead className="text-center">Created</TableHead>
                                <TableHead className="text-center">Skipped</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log: any) => {
                                const isExpanded = expandedRows.has(log._id);
                                const hasDetails = log.offer_details && log.offer_details.length > 0;

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
                                            <TableCell>
                                                {(() => {
                                                    // Deduplicate casinos by combining state and name
                                                    const uniqueCasinos = Array.from(
                                                        new Map(
                                                            log.casinos.map((c: any) => [`${c.state || 'N/A'}-${c.name}`, c])
                                                        ).values()
                                                    );
                                                    return (
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            {uniqueCasinos.slice(0, 1).map((casino: any, idx: number) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {casino.state ? `${casino.state} - ` : ''}{casino.name}
                                                                </Badge>
                                                            ))}
                                                            {uniqueCasinos.length > 1 && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Badge variant="secondary" className="text-xs cursor-help">
                                                                                +{uniqueCasinos.length - 1} more
                                                                            </Badge>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="space-y-1">
                                                                                {uniqueCasinos.slice(1).map((casino: any, idx: number) => (
                                                                                    <div key={idx}>
                                                                                        {casino.state ? `${casino.state} - ` : ''}{casino.name}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {log.offers_created}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-muted-foreground">{log.offers_skipped}</span>
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
                                                            {log.errors && log.errors.length > 0 && (
                                                                <div className="mt-1 text-xs max-w-xs">
                                                                    {log.errors.slice(0, 3).map((err: string, idx: number) => (
                                                                        <div key={idx} className="truncate">• {err}</div>
                                                                    ))}
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
                                                        <h4 className="font-semibold text-sm mb-3">Offer Details</h4>
                                                        <div className="grid gap-2 max-h-64 overflow-y-auto">
                                                            {log.offer_details.map((detail: OfferDetail, idx: number) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-start gap-2 p-2 rounded-md bg-background border text-sm"
                                                                >
                                                                    {getActionIcon(detail.action)}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="font-medium">{detail.casino_name}</span>
                                                                            <span className="text-muted-foreground">→</span>
                                                                            <span className={getActionColor(detail.action)}>
                                                                                {detail.offer_name}
                                                                            </span>
                                                                        </div>
                                                                        {detail.reason && (
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                {detail.reason}
                                                                            </p>
                                                                        )}
                                                                        <div className="flex gap-2 mt-1">
                                                                            {detail.offer_type && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {detail.offer_type}
                                                                                </Badge>
                                                                            )}
                                                                            {detail.expected_bonus && (
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    ${detail.expected_bonus}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Badge
                                                                        variant={
                                                                            detail.action === 'created'
                                                                                ? 'default'
                                                                                : detail.action === 'expired'
                                                                                    ? 'destructive'
                                                                                    : 'secondary'
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {detail.action}
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

