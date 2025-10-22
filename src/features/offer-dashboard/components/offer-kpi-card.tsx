import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface OfferKpiCardProps {
    title: string;
    value: string | number;
    isLoading: boolean;
    variant?: "default" | "positive" | "negative";
    icon: LucideIcon;
    tooltip?: string;
    trend?: {
        value: number;
        period: string;
    };
    subtitle?: string;
}

export default function OfferKpiCard({
    title,
    value,
    isLoading,
    variant = "default",
    icon: Icon,
    tooltip,
    trend,
    subtitle
}: OfferKpiCardProps) {
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

    const getIconColor = () => {
        switch (variant) {
            case "positive":
                return "text-green-600 dark:text-green-400";
            case "negative":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-muted-foreground";
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend.value > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
        if (trend.value < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    };

    const getTrendColor = () => {
        if (!trend) return "text-muted-foreground";

        if (trend.value > 0) return "text-green-600 dark:text-green-400";
        if (trend.value < 0) return "text-red-600 dark:text-red-400";
        return "text-muted-foreground";
    };

    // Parse the value to extract number and any suffix
    const parseValue = (val: string | number) => {
        // Handle undefined/null values
        if (val === undefined || val === null) {
            return { numericValue: 0, suffix: '' };
        }

        if (typeof val === 'number') {
            return { numericValue: val, suffix: '' };
        }

        // Match numbers with optional decimal points and any trailing characters
        const match = val.toString().match(/^([0-9]+\.?[0-9]*)(.*)$/);

        if (match) {
            return {
                numericValue: parseFloat(match[1]),
                suffix: match[2].trim()
            };
        }

        // Fallback: try to parse the whole string as number
        const numericValue = parseFloat(val.toString());
        return {
            numericValue: isNaN(numericValue) ? 0 : numericValue,
            suffix: isNaN(numericValue) ? val.toString() : ''
        };
    };

    const { numericValue, suffix } = parseValue(value);

    const cardContent = (
        <Card className={`transition-all duration-200 hover:shadow-md ${getVariantStyles()}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {tooltip && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help md:hidden" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <Icon className={`h-4 w-4 ${getIconColor()}`} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-baseline">
                            <NumberTicker
                                value={numericValue}
                                className={`text-xl font-bold ${getValueColor()}`}
                            />
                            {suffix && (
                                <span className={`text-xl font-bold ${getValueColor()}`}>{suffix}</span>
                            )}
                        </div>

                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}

                        {trend && (
                            <div className="flex items-center gap-1 text-xs">
                                {getTrendIcon()}
                                <span className={getTrendColor()}>
                                    {Math.abs(trend.value)}% {trend.period}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // On desktop, wrap the entire card in a tooltip for hover behavior
    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild className="hidden md:block cursor-help">
                        {cardContent}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
                {/* Mobile version without full card tooltip */}
                <div className="md:hidden">
                    {cardContent}
                </div>
            </TooltipProvider>
        );
    }

    return cardContent;
}
