'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

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
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useOfferTypeBreakdown } from '../hooks/use-offer-type-breakdown';
import { Skeleton } from '@/components/ui/skeleton';

// Define colors for different offer types - shades of purple
const CHART_COLORS = [
    '#9333ea', // Purple 600
    '#a855f7', // Purple 500
    '#c084fc', // Purple 400
    '#d8b4fe', // Purple 300
    '#e9d5ff', // Purple 200
    '#7c3aed', // Violet 600
    '#8b5cf6', // Violet 500
    '#a78bfa', // Violet 400
];

export default function OfferTypeBreakdownChart() {
    const { breakdown, isLoading } = useOfferTypeBreakdown();

    // Calculate total offers for the center label
    const totalOffers = React.useMemo(() => {
        if (!breakdown) return 0;
        return breakdown.reduce((sum, item) => sum + item.count, 0);
    }, [breakdown]);

    // Transform data for the chart - only top 5 offer types
    const chartData = React.useMemo(() => {
        if (!breakdown) return [];

        // Sort by count descending and take top 5
        const sortedBreakdown = [...breakdown].sort((a, b) => b.count - a.count);
        const top5 = sortedBreakdown.slice(0, 5);

        return top5.map((item, index) => ({
            offerType: item.offerType,
            count: item.count,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }, [breakdown]);

    const chartConfig = React.useMemo(() => {
        if (!breakdown) return {} as ChartConfig;

        const config: ChartConfig = {};
        const sortedBreakdown = [...breakdown].sort((a, b) => b.count - a.count);
        const top5 = sortedBreakdown.slice(0, 5);

        top5.forEach((item, index) => {
            config[item.offerType] = {
                label: item.offerType,
                color: CHART_COLORS[index % CHART_COLORS.length],
            };
        });
        return config;
    }, [breakdown]) satisfies ChartConfig;

    // Get top 5 for legend display
    const top5Breakdown = React.useMemo(() => {
        if (!breakdown) return [];
        return [...breakdown].sort((a, b) => b.count - a.count).slice(0, 5);
    }, [breakdown]);

    if (isLoading) {
        return (
            <Card className="flex flex-col h-full">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Offer Type Breakdown</CardTitle>
                    <CardDescription>Distribution of promotional types</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="h-full flex items-center justify-center">
                        <Skeleton className="h-[250px] w-[250px] rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!breakdown || breakdown.length === 0) {
        return (
            <Card className="flex flex-col h-full">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Offer Type Breakdown</CardTitle>
                    <CardDescription>Distribution of promotional types</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No offer data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center">
                <CardTitle>Offer Type Breakdown</CardTitle>
                <CardDescription>Distribution of active promotional types</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="shrink-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square h-[250px] 2xl:w-[250px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="offerType"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalOffers.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Active Offers
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>

                {/* Legend - Top 5 only */}
                <div className="mt-4 grid grid-cols-1 gap-2 text-sm overflow-auto">
                    {top5Breakdown.map((item, index) => (
                        <div key={item.offerType} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-sm"
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-muted-foreground">{item.offerType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{item.count}</span>
                                <span className="text-muted-foreground">({item.percentage}%)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

