import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StateChart() {
    const stateStats = useQuery(api.casinos.index.getCasinosByStateStats);

    if (stateStats === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>State-by-State Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] flex items-center justify-center">
                        <Skeleton className="h-[350px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stateStats || stateStats.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>State-by-State Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
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
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>State-by-State Market Analysis</CardTitle>
                <CardDescription>Showing tracked and untracked casinos for each state.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mt-5 -ml-10">
                    <BarChart data={stateStats} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="state"
                            height={100}
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
        </Card>
    );
}