import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function KPICard({
    title,
    value,
    isLoading,
    variant = "default"
}: {
    title: string;
    value: string | number;
    isLoading: boolean;
    variant?: "default" | "positive" | "negative";
}) {
    const getVariantStyles = () => {
        switch (variant) {
            case "positive":
                return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
            case "negative":
                return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
            default:
                return "";
        }
    };

    const getValueColor = () => {
        switch (variant) {
            case "positive":
                return "text-green-600 dark:text-green-400";
            case "negative":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-foreground";
        }
    };

    return (
        <Card className={`transition-all duration-200 hover:shadow-md`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className={`text-2xl font-bold ${getValueColor()}`}>
                        {value}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}