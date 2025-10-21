import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { StateChartSkeleton } from "./skeletons";

export default function StateChart() {
    const stateStats = useQuery(api.casinos.index.getCasinosByStateStats);

    if (stateStats === undefined) {
        return (
            <StateChartSkeleton />
        );
    }

    if (!stateStats || stateStats.length === 0) {
        return (
            <Card className="h-full 2xl:h-[100%] flex flex-col">
                <CardHeader>
                    <CardTitle>State-by-State Market Analysis</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartConfig = {
        total: {
            label: "Total Casinos",
            color: "#6b21a8",
        },
        tracked: {
            label: "Tracked",
            color: "#9911fa",
        },
        untracked: {
            label: "Untracked",
            color: "#d676e0",
        },
    };

    return (
        <Card className="h-full 2xl:h-[100%] flex flex-col gap-0">
            <CardHeader>
                <CardTitle>State-by-State Market Analysis</CardTitle>
                <CardDescription>Showing tracked and untracked casinos for each state.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer config={chartConfig} className="-ml-10">
                    <BarChart data={stateStats} accessibilityLayer margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                        <CartesianGrid />
                        <XAxis
                            dataKey="state"
                            height={40}
                            fontSize={12}
                            interval={0}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent payload={[]} />} />
                        <Bar
                            dataKey="total"
                            fill="var(--color-total)"
                            name="Total"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="tracked"
                            fill="var(--color-tracked)"
                            name="Tracked"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="untracked"
                            fill="var(--color-untracked)"
                            name="Untracked"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {((stateStats.reduce((sum, state) => sum + state.tracked, 0) / stateStats.reduce((sum, state) => sum + state.total, 0)) * 100).toFixed(1)}% tracking rate across all states
                </div>
                <div className="text-muted-foreground leading-none">
                    {stateStats.reduce((sum, state) => sum + state.tracked, 0)} tracked, {stateStats.reduce((sum, state) => sum + state.untracked, 0)} untracked casinos
                </div>
            </CardFooter>
        </Card >
    );
}