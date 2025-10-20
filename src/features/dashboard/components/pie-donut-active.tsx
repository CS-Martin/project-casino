"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TransformedCasinoData } from "../lib/market-coverage-utils";

interface PieDonutActiveProps {
    data: TransformedCasinoData[];
}

const chartConfig = {
    critical: {
        label: "Critical Opportunity",
        color: "#ef4444",
    },
    high: {
        label: "High Opportunity",
        color: "#f59e0b",
    },
    medium: {
        label: "Medium Opportunity",
        color: "#3b82f6",
    },
    low: {
        label: "Low Opportunity",
        color: "#10b981",
    },
} satisfies ChartConfig;

const opportunityColors = {
    CRITICAL: "#ef4444",
    HIGH: "#f59e0b",
    MEDIUM: "#3b82f6",
    LOW: "#10b981",
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

export function PieDonutActive({ data }: PieDonutActiveProps) {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

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

    const getOpportunityBadgeVariant = (opportunity: TransformedCasinoData["opportunity"]) => {
        return opportunityVariants[opportunity] as "default" | "secondary" | "destructive" | "outline";
    };

    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Market Coverage Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Casino market coverage by state with opportunity analysis
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 lg:grid-cols-5 mt-5">
                    {/* Chart Section */}
                    <div className="col-span-2 space-y-4">
                        <div className="h-fit w-full">
                            <ChartContainer config={chartConfig} className=" -ml-10 w-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={80}
                                            paddingAngle={2}
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
                    <div className="col-span-3 space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[120px]">State</TableHead>
                                            <TableHead className="min-w-[80px] text-center">Coverage</TableHead>
                                            <TableHead className="min-w-[80px] text-center">Gap</TableHead>
                                            <TableHead className="min-w-[100px] text-center">Opportunity</TableHead>
                                            <TableHead className="min-w-[60px] text-center">Total</TableHead>
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
                                                <TableCell className="text-center">
                                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                        {item.coverage.toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                                        {item.gap.toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={getOpportunityBadgeVariant(item.opportunity)}
                                                        className="text-xs"
                                                    >
                                                        {item.opportunity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-sm font-medium">
                                                        {item.total}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Critical States</div>
                                <div className="font-semibold text-red-600 dark:text-red-400">
                                    {data.filter(item => item.opportunity === "CRITICAL").length}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Avg Coverage</div>
                                <div className="font-semibold">
                                    {(data.reduce((sum, item) => sum + item.coverage, 0) / data.length).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
