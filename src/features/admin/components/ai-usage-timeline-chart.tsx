'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const chartConfig = {
    totalCalls: {
        label: 'Total Calls',
        color: '#3b82f6', // Blue
    },
    successfulCalls: {
        label: 'Successful Calls',
        color: '#10b981', // Green
    },
    failedCalls: {
        label: 'Failed Calls',
        color: '#ef4444', // Red
    },
    totalTokens: {
        label: 'Total Tokens',
        color: '#8b5cf6', // Purple
    },
    totalCost: {
        label: 'Total Cost ($)',
        color: '#f59e0b', // Orange
    },
} satisfies ChartConfig;

type MetricKey = 'totalCalls' | 'successfulCalls' | 'failedCalls' | 'totalTokens' | 'totalCost';

interface TimelineDataPoint {
    date: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    avgDuration: number;
    successRate: number;
    avgTokensPerCall: number;
    avgCostPerCall: number;
}

interface AIUsageTimelineChartProps {
    timeline?: TimelineDataPoint[];
    isLoading?: boolean;
}

export default function AIUsageTimelineChart({ timeline, isLoading }: AIUsageTimelineChartProps) {
    const [selectedMetrics, setSelectedMetrics] = React.useState<MetricKey[]>([
        'totalCalls',
        'successfulCalls',
        'failedCalls',
        'totalTokens',
        'totalCost',
    ]);

    const toggleMetric = (metric: MetricKey) => {
        setSelectedMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    // Calculate summary stats
    const summaryStats = React.useMemo(() => {
        if (!timeline) return null;

        const totals = timeline.reduce(
            (acc, day) => ({
                totalCalls: acc.totalCalls + day.totalCalls,
                successfulCalls: acc.successfulCalls + day.successfulCalls,
                failedCalls: acc.failedCalls + day.failedCalls,
                totalTokens: acc.totalTokens + day.totalTokens,
                totalCost: acc.totalCost + day.totalCost,
                totalDuration: acc.totalDuration + (day.avgDuration * day.totalCalls),
            }),
            {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                totalTokens: 0,
                totalCost: 0,
                totalDuration: 0,
            }
        );

        const successRate = totals.totalCalls > 0
            ? Math.round((totals.successfulCalls / totals.totalCalls) * 100)
            : 0;

        const avgDuration = totals.totalCalls > 0
            ? totals.totalDuration / totals.totalCalls
            : 0;

        return { ...totals, successRate, avgDuration };
    }, [timeline]);

    if (isLoading) {
        return (
            <Card className="pt-0 flex flex-col h-full">
                <CardHeader className="space-y-0 border-b py-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="grid flex-1 gap-1">
                            <CardTitle>AI Usage Timeline</CardTitle>
                            <CardDescription>
                                Track API calls, tokens, costs, and performance over time
                            </CardDescription>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="rounded-lg border bg-card p-3 shadow-sm">
                                <Skeleton className="h-4 w-16 mb-1" />
                                <Skeleton className="h-8 w-12" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                        <Skeleton className="h-4 w-24 mb-1" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-28" />
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!timeline || timeline.length === 0) {
        return (
            <Card className="pt-0 flex flex-col h-full">
                <CardHeader className="space-y-0 border-b py-5">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>AI Usage Timeline</CardTitle>
                        <CardDescription>
                            Track API calls, tokens, costs, and performance over time
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No timeline data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="pt-0 flex flex-col h-full">
            <CardHeader className="space-y-0 border-b py-5">
                <div className="flex flex-col 2xl:flex-row items-start justify-between gap-4 mb-4">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>AI Usage Timeline</CardTitle>
                        <CardDescription>
                            Track API calls, tokens, costs, and performance over time
                        </CardDescription>
                    </div>
                </div>

                {/* Summary Stats */}
                {summaryStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Total Calls</p>
                            <p className="font-semibold">{summaryStats.totalCalls.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                            <p className="font-semibold">${summaryStats.totalCost.toFixed(4)}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
                            <p className="font-semibold">{summaryStats.totalTokens.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                            <p className="font-semibold">{summaryStats.successRate}%</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
                            <p className="font-semibold">{(summaryStats.avgDuration / 1000).toFixed(1)}s</p>
                        </div>
                    </div>
                )}

                {/* Metric Toggles */}
                <div className="flex flex-wrap gap-2 pt-4">
                    <p className="text-xs text-muted-foreground w-full mb-1">Show metrics:</p>
                    {(Object.keys(chartConfig) as MetricKey[]).map((metric) => (
                        <Button
                            key={metric}
                            onClick={() => toggleMetric(metric)}
                            size="sm"
                            className={`text-xs font-medium transition-colors ${selectedMetrics.includes(metric)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            <span
                                className="inline-block w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: chartConfig[metric].color }}
                            />
                            {chartConfig[metric].label}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
                {selectedMetrics.length === 0 ? (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                        Please select at least one metric to display
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={timeline}>
                            <defs>
                                {selectedMetrics.map((metric) => (
                                    <linearGradient key={metric} id={`fill${metric}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig[metric].color}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig[metric].color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    });
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            });
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            {selectedMetrics.map((metric, index) => (
                                <Area
                                    key={metric}
                                    dataKey={metric}
                                    type="natural"
                                    fill={`url(#fill${metric})`}
                                    stroke={chartConfig[metric].color}
                                    strokeWidth={2}
                                    stackId={index % 2 === 0 ? 'a' : 'b'} // Alternate stacking for better visibility
                                />
                            ))}
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

