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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useOfferTimeline } from '../hooks/use-offer-timeline';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const chartConfig = {
    offersCreated: {
        label: 'Created',
        color: '#10b981', // Green
    },
    offersSkipped: {
        label: 'Skipped',
        color: '#f59e0b', // Orange
    },
    expiredOffers: {
        label: 'Expired',
        color: '#ef4444', // Red
    },
    casinosResearched: {
        label: 'Casinos Researched',
        color: '#8b5cf6', // Purple
    },
    researchRuns: {
        label: 'Research Runs',
        color: '#06b6d4', // Cyan
    },
} satisfies ChartConfig;

type MetricKey = 'offersCreated' | 'offersSkipped' | 'expiredOffers' | 'casinosResearched' | 'researchRuns';

export default function OfferTimelineChart() {
    const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d'>('7d');
    const [selectedMetrics, setSelectedMetrics] = React.useState<MetricKey[]>([
        'offersCreated',
        'offersSkipped',
        'expiredOffers',
        'casinosResearched',
        'researchRuns',
    ]);
    const { timeline, isLoading } = useOfferTimeline(timeRange);

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
                offersCreated: acc.offersCreated + day.offersCreated,
                offersUpdated: acc.offersUpdated + day.offersUpdated,
                offersSkipped: acc.offersSkipped + day.offersSkipped,
                expiredOffers: acc.expiredOffers + day.expiredOffers,
                casinosResearched: acc.casinosResearched + day.casinosResearched,
                researchRuns: acc.researchRuns + day.researchRuns,
                successfulRuns: acc.successfulRuns + day.successfulRuns,
                totalDuration: acc.totalDuration + day.avgDuration,
            }),
            {
                offersCreated: 0,
                offersUpdated: 0,
                offersSkipped: 0,
                expiredOffers: 0,
                casinosResearched: 0,
                researchRuns: 0,
                successfulRuns: 0,
                totalDuration: 0,
            }
        );

        const successRate = totals.researchRuns > 0
            ? Math.round((totals.successfulRuns / totals.researchRuns) * 100)
            : 0;

        return { ...totals, successRate };
    }, [timeline]);

    const getTimeRangeLabel = () => {
        switch (timeRange) {
            case '7d':
                return 'Last 7 days';
            case '30d':
                return 'Last 30 days';
            case '90d':
                return 'Last 3 months';
            default:
                return 'Last 7 days';
        }
    };

    if (isLoading) {
        return (
            <Card className="pt-0 flex flex-col h-full">
                <CardHeader className="space-y-0 border-b py-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="grid flex-1 gap-1">
                            <CardTitle>Research Activity & Offer Timeline</CardTitle>
                            <CardDescription>
                                Track research runs, offers created/updated, and casino coverage over time
                            </CardDescription>
                        </div>
                        <Skeleton className="h-10 w-[160px]" />
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
                        <CardTitle>Research Activity & Offer Timeline</CardTitle>
                        <CardDescription>
                            Track research runs, offers created/updated, and casino coverage over time
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
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Research Activity & Offer Timeline</CardTitle>
                        <CardDescription>
                            Track research runs, offers created/updated, and casino coverage over time
                        </CardDescription>
                    </div>
                    <Select
                        value={timeRange}
                        onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}
                    >
                        <SelectTrigger
                            className="w-[160px] rounded-lg"
                            aria-label="Select a time range"
                        >
                            <SelectValue placeholder={getTimeRangeLabel()} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Stats */}
                {summaryStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Created</p>
                            <p className="font-semibold">{summaryStats.offersCreated}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Skipped</p>
                            <p className="font-semibold">{summaryStats.offersSkipped}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Expired</p>
                            <p className="font-semibold">{summaryStats.expiredOffers}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Casinos</p>
                            <p className="font-semibold">{summaryStats.casinosResearched}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                            <p className="font-semibold">{summaryStats.successRate}%</p>
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

