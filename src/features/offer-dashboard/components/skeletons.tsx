import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

interface BestOfferSkeletonProps {
    showAnalyzingText?: boolean;
}

export function BestOfferSkeleton({ showAnalyzingText = false }: BestOfferSkeletonProps) {
    return (
        <div className="bg-linear-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-purple-950/50 rounded-lg p-4 md:p-6 border-2 border-purple-200 dark:border-purple-800 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`h-6 w-6 text-purple-600 ${showAnalyzingText ? 'animate-spin' : 'animate-pulse'}`} />
                {showAnalyzingText ? (
                    <h4 className="font-bold text-lg">AI is analyzing offers...</h4>
                ) : (
                    <Skeleton className="h-7 w-64" />
                )}
            </div>

            <div className="space-y-4">
                {/* Best Offer Card Skeleton */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-20 ml-auto" />
                            <Skeleton className="h-3 w-24 ml-auto" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-full" />
                </div>

                {/* Reasoning Section Skeleton */}
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>

                {/* Strengths Section Skeleton */}
                <div>
                    <Skeleton className="h-5 w-28 mb-2" />
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </div>

                {/* Considerations Section Skeleton */}
                <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                </div>

                {/* Ranking Factors Skeleton */}
                <div>
                    <Skeleton className="h-5 w-56 mb-3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2 p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-10" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t">
                    <Skeleton className="h-3 w-72" />
                </div>
            </div>
        </div>
    );
}

