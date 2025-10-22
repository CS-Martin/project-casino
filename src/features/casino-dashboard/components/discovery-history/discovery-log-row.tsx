import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    CheckCircle2,
    XCircle,
    Zap,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { DiscoveryLogDetails } from './discovery-log-details';

interface DiscoveryLogRowProps {
    log: any;
    isExpanded: boolean;
    onToggle: () => void;
}

export function DiscoveryLogRow({ log, isExpanded, onToggle }: DiscoveryLogRowProps) {
    const hasSaved = log.saved_casinos && log.saved_casinos.length > 0;
    const hasDuplicates = log.duplicates && log.duplicates.length > 0;
    const hasDetails = hasSaved || hasDuplicates;

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <React.Fragment>
            <TableRow className="hover:bg-muted/50">
                <TableCell>
                    {hasDetails && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={onToggle}
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
                <DiscoveryLogDetails
                    savedCasinos={log.saved_casinos}
                    duplicates={log.duplicates}
                />
            )}
        </React.Fragment>
    );
}

