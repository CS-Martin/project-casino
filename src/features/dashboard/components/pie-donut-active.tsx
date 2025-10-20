"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TransformedCasinoData, transformCasinoData } from "../lib/market-coverage-utils";
import { useDashboardStats } from "../hooks/use-dashboard-stats";
import { MarketCoverageSkeleton } from "./skeletons";

// Component no longer accepts props; it reads data from the dashboard stats hook

const chartConfig = {
    critical: {
        label: "Critical Opportunity",
        color: "#7c3aed",
    },
    high: {
        label: "High Opportunity",
        color: "#a855f7",
    },
    medium: {
        label: "Medium Opportunity",
        color: "#c084fc",
    },
    low: {
        label: "Low Opportunity",
        color: "#e9d5ff",
    },
} satisfies ChartConfig;

const opportunityColors = {
    CRITICAL: "#7c3aed",
    HIGH: "#a855f7",
    MEDIUM: "#c084fc",
    LOW: "#e9d5ff",
} as const;

const opportunityVariants = {
    CRITICAL: "destructive",
    HIGH: "secondary",
    MEDIUM: "default",
    LOW: "outline",
} as const;

// Custom active shape component for highlighting critical sectors
const ActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
        value,
    } = props;

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 5}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke={fill}
                strokeWidth={2}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
                opacity={0.3}
            />
            <path
                d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                stroke={fill}
                fill="none"
                strokeWidth={2}
            />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                textAnchor={textAnchor}
                fill="#333"
                fontSize={12}
                fontWeight={600}
            >
                {`${payload.state}: ${value.toFixed(1)}%`}
            </text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                dy={18}
                textAnchor={textAnchor}
                fill="#999"
                fontSize={10}
            >
                {`(${(percent * 100).toFixed(1)}%)`}
            </text>
        </g>
    );
};

export function PieDonutActive() {
    const { casinoStateStats, isLoading } = useDashboardStats();
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    const data = React.useMemo(() => transformCasinoData(casinoStateStats ?? []), [casinoStateStats]);

    // Transform data for the pie chart
    const chartData = React.useMemo(() => {
        return data.map((item) => ({
            ...item,
            value: item.gap, // Use gap percentage as the value for the chart
        }));
    }, [data]);

    // Calculate active indices for critical opportunity states
    const criticalIndices = React.useMemo(() => {
        return data
            .map((item, index) => (item.opportunity === "CRITICAL" ? index : null))
            .filter((index): index is number => index !== null);
    }, [data]);

    const handleMouseEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const handleMouseLeave = () => {
        setActiveIndex(null);
    };

    if (isLoading) {
        return (
            <MarketCoverageSkeleton />
        )
    }

    return (
        <Card className="relative h-full 2xl:h-[100%] flex flex-col">
            <CardHeader>
                <CardTitle className="textfont-semibold">Market Coverage Overview</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Track casino coverage gaps and expansion opportunities by state
                </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="flex flex-col lg:flex-row gap-3 mt-5 w-full flex-1">
                    {/* Chart Section */}
                    <div className="w-full 2xl:w-[60%]">
                        <div className="h-fit w-full flex justify-center">
                            <ChartContainer config={chartConfig} className="w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={opportunityColors[entry.opportunity]}
                                                    stroke={opportunityColors[entry.opportunity]}
                                                    strokeWidth={criticalIndices.includes(index) ? 3 : 1}
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="rounded-lg border bg-background p-3 shadow-md">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: data.fill }}
                                                                />
                                                                <span className="font-semibold">{data.state}</span>
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Coverage:</span>
                                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                                        {data.coverage.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Gap:</span>
                                                                    <span className="font-medium text-red-600 dark:text-red-400">
                                                                        {data.gap.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Opportunity:</span>
                                                                    <span className={cn(
                                                                        "px-1.5 py-1 rounded-md lowercase text-xs text-white",
                                                                        data.opportunity === "CRITICAL" && "bg-purple-600",
                                                                        data.opportunity === "HIGH" && "bg-purple-500",
                                                                        data.opportunity === "MEDIUM" && "bg-purple-400",
                                                                        data.opportunity === "LOW" && "bg-purple-300"
                                                                    )}>{data.opportunity}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Total Casinos:</span>
                                                                    <span className="font-medium">{data.total}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {Object.entries(opportunityColors).map(([opportunity, color]) => (
                                <div key={opportunity} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {opportunity.toLowerCase().replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table Section */}
                    <Table className="mt-5 2xl:mt-0">
                        <TableHeader>
                            <TableRow>
                                <TableHead>State</TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-1">
                                        Coverage
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Percentage of casinos we're currently tracking in this state</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-1">
                                        Gap
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Percentage of casinos we're missing or not tracking yet</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        Opportunity
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Priority level for expanding our tracking in this state</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableHead>
                                {/* <TableHead className="text-right">Total</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow
                                    key={item.state}
                                    className={cn(
                                        "transition-colors",
                                        criticalIndices.includes(index) && "bg-red-50 dark:bg-red-950/20"
                                    )}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: opportunityColors[item.opportunity] }}
                                            />
                                            <span className="text-sm truncate">{item.state}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell >
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {item.coverage.toFixed(1)}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                            {item.gap.toFixed(1)}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn(
                                            "px-1.5 py-1 rounded-md lowercase text-xs font-medium text-white",
                                            item.opportunity === "CRITICAL" && "bg-red-500",
                                            item.opportunity === "HIGH" && "bg-orange-500",
                                            item.opportunity === "MEDIUM" && "bg-blue-500",
                                            item.opportunity === "LOW" && "bg-green-500"
                                        )}>{item.opportunity}</span>
                                    </TableCell>
                                    {/* <TableCell className="text-right">
                                        <span className="text-sm font-medium">
                                            {item.total}
                                        </span>
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="font-semibold">
                                    <div className="flex items-center gap-1">
                                        States needing immediate attention:
                                    </div>
                                </TableCell>
                                <TableCell className="flex flex-row items-center gap-2 text-center font-semibold text-red-500">
                                    {data.filter(item => item.opportunity === "CRITICAL").length}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>

            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {data.filter(item => item.opportunity === "CRITICAL").length} states need immediate attention
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-[260px]">These states have the biggest coverage gaps and represent the most urgent opportunities to improve our presence.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="text-muted-foreground leading-none">
                    Average coverage: {(data.reduce((sum, item) => sum + item.coverage, 0) / data.length).toFixed(1)}% across all states
                </div>
            </CardFooter>
        </Card >
    );
}
