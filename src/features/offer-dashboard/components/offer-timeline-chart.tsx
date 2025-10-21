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

const chartConfig = {
    newOffers: {
        label: 'New Offers',
        color: 'hsl(var(--chart-1))',
    },
    expiredOffers: {
        label: 'Expired Offers',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

export default function OfferTimelineChart() {
    const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d'>('7d');
    const { timeline, isLoading } = useOfferTimeline(timeRange);

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
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Offer Update Timeline & Distribution</CardTitle>
                        <CardDescription>
                            New offers added and offers expired over time
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!timeline || timeline.length === 0) {
        return (
            <Card className="pt-0 flex flex-col h-full">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Offer Update Timeline & Distribution</CardTitle>
                        <CardDescription>
                            New offers added and offers expired over time
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
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Offer Update Timeline & Distribution</CardTitle>
                    <CardDescription>
                        Showing new offers added and offers expired for {getTimeRangeLabel().toLowerCase()}
                    </CardDescription>
                </div>
                <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}
                >
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
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
            </CardHeader>
            <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[350px] w-full"
                >
                    <AreaChart data={timeline}>
                        <defs>
                            <linearGradient id="fillNewOffers" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-newOffers)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-newOffers)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillExpiredOffers" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-expiredOffers)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-expiredOffers)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
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
                        <Area
                            dataKey="newOffers"
                            type="natural"
                            fill="#800080" // Purple
                            stroke="#800080" // Purple
                            stackId="a"
                        />
                        <Area
                            dataKey="expiredOffers"
                            type="natural"
                            fill="#b366ff" // Light Purple
                            stroke="#b366ff" // Purple
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

