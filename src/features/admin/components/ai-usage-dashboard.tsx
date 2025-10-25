'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Brain, TrendingUp, DollarSign, Zap, Clock, AlertCircle } from 'lucide-react';

interface AIStats {
    total: {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        totalTokens: number;
        inputTokens: number;
        outputTokens: number;
        totalCost: number;
        averageCostPerCall: number;
        averageTokensPerCall: number;
        averageDuration: number;
        successRate: number;
    };
    byOperation: Record<
        string,
        {
            calls: number;
            tokens: number;
            cost: number;
            avgDuration: number;
            successRate: number;
        }
    >;
    byModel: Record<string, { calls: number; tokens: number; cost: number }>;
    timeRange: {
        since: number;
        now: number;
        durationMs: number;
    };
}

interface RecentUsage {
    _id: string;
    _creationTime: number;
    model: string;
    operation: string;
    total_tokens: number;
    estimated_cost: number;
    success: boolean;
    duration_ms?: number;
}

export function AIUsageDashboard() {
    const [stats, setStats] = useState<AIStats | null>(null);
    const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('24h');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/ai-usage?period=${period}`);
            const result = await response.json();

            if (result.success) {
                setStats(result.data.stats);
                setRecentUsage(result.data.recentUsage);
            }
        } catch (error) {
            // Error silently handled - user will see empty state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [period]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No AI usage data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Period Selector */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Usage Analytics</h2>
                    <p className="text-muted-foreground">
                        Monitor OpenAI API costs and performance
                    </p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="24h">Last 24h</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 90 Days</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats.total.totalCost.toFixed(4)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg ${stats.total.averageCostPerCall.toFixed(6)} per call
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total.totalCalls}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total.successRate.toFixed(1)}% success rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total.totalTokens.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg {stats.total.averageTokensPerCall.toFixed(0)} per call
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats.total.averageDuration / 1000).toFixed(1)}s
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total.failedCalls} failed calls
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Usage by Operation */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage by Operation</CardTitle>
                    <CardDescription>Breakdown of AI usage across different operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(stats.byOperation).map(([operation, data]) => (
                            <div key={operation} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium capitalize">
                                            {operation.replace(/-/g, ' ')}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {data.calls} calls
                                        </Badge>
                                    </div>
                                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                        <span>{data.tokens.toLocaleString()} tokens</span>
                                        <span>{(data.avgDuration / 1000).toFixed(1)}s avg</span>
                                        <span className="text-green-600">
                                            {data.successRate.toFixed(0)}% success
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">${data.cost.toFixed(4)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        ${(data.cost / data.calls).toFixed(6)}/call
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Last 10 AI operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {recentUsage.map((usage) => (
                            <div
                                key={usage._id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {usage.success ? (
                                        <Zap className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <div>
                                        <div className="font-medium capitalize">
                                            {usage.operation.replace(/-/g, ' ')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(usage._creationTime).toLocaleTimeString()} •{' '}
                                            {usage.model}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm">
                                        ${usage.estimated_cost.toFixed(6)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {usage.total_tokens.toLocaleString()} tokens
                                        {usage.duration_ms && ` • ${(usage.duration_ms / 1000).toFixed(1)}s`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

