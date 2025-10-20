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
        <Card>
            <CardHeader>
                <CardTitle>State-by-State Market Analysis</CardTitle>
                <CardDescription>Showing tracked and untracked casinos for each state.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <BarChart data={stateStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="state"
                            height={100}
                            fontSize={12}
                            interval={0}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
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