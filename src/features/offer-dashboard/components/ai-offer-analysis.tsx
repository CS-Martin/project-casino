import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Sparkles,
    Award,
    CheckCircle,
    Info,
    HelpCircle,
    Target,
    Calculator,
    AlertTriangle,
} from 'lucide-react';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import { BestOfferSkeleton } from './skeletons';

interface AiOfferAnalysisProps {
    aiAnalysis: any | null;
    isAnalyzing: boolean;
    activeOffers: OfferWithChanges[];
    onClose: () => void;
}

export function AiOfferAnalysis({
    aiAnalysis,
    isAnalyzing,
    activeOffers,
    onClose,
}: AiOfferAnalysisProps) {
    // Show skeleton while analyzing
    if (isAnalyzing) {
        return <BestOfferSkeleton showAnalyzingText={true} />;
    }

    // Don't render if no analysis
    if (!aiAnalysis) return null;

    return (
        <div className="bg-linear-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-purple-950/50 rounded-lg p-4 md:p-6 border-2 border-purple-200 dark:border-purple-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Award className="h-6 w-6 text-purple-600" />
                    <h4 className="font-bold text-lg">AI Recommended Best Offer</h4>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                    Our AI analyzes all offers based on value score, bonus amounts,
                                    wagering requirements, and ease of use to recommend the best offer
                                    for typical players.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0"
                >
                    ×
                </Button>
            </div>

            <div className="space-y-4">
                {/* Best Offer Highlight with Score Explanation */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Recommended Offer</span>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-help">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {aiAnalysis.score}<span className="text-lg">/100</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Overall Score</div>
                                        </div>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="text-sm font-semibold mb-1">Overall Score (0-100)</p>
                                    <p className="text-xs">
                                        Combines all ranking factors into a single score.
                                        <strong className="block mt-1">
                                            • 90-100: Excellent value
                                            <br />• 75-89: Very good value
                                            <br />• 60-74: Good value
                                            <br />• Below 60: Fair value
                                        </strong>
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <p className="font-semibold text-lg">
                        {activeOffers.find(o => o._id === aiAnalysis.bestOfferId)?.offer_name}
                    </p>
                </div>

                {/* Reasoning */}
                <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Why This Offer?
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiAnalysis.reasoning}
                    </p>
                </div>

                {/* Strengths */}
                <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Strengths
                    </h5>
                    <ul className="space-y-1">
                        {aiAnalysis.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Considerations */}
                <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Important Considerations
                    </h5>
                    <ul className="space-y-1">
                        {aiAnalysis.considerations.map((consideration: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="text-orange-600 mt-0.5">!</span>
                                <span>{consideration}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Ranking Factors with Explanations */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-5 w-5" />
                        <h5 className="font-semibold">How We Ranked This Offer</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <RankingFactor
                            name="Value Score"
                            score={aiAnalysis.rankingFactors.valueScore}
                            description="Bonus value vs wagering required"
                            tooltip="Measures the actual value you get from the bonus compared to the wagering requirements. Higher scores mean better ROI."
                            color="bg-purple-600"
                        />
                        <RankingFactor
                            name="Bonus Amount"
                            score={aiAnalysis.rankingFactors.bonusAmount}
                            description="Size of the bonus offered"
                            tooltip="How much money you can potentially receive. Considers both the expected bonus and maximum bonus cap."
                            color="bg-green-600"
                        />
                        <RankingFactor
                            name="Wagering Terms"
                            score={aiAnalysis.rankingFactors.wageringRequirement}
                            description="Favorability of wagering requirements"
                            tooltip="Lower requirements = higher score. Shows how achievable the bonus is (1x = excellent, 50x = poor)."
                            color="bg-blue-600"
                        />
                        <RankingFactor
                            name="Ease of Use"
                            score={aiAnalysis.rankingFactors.easeOfUse}
                            description="How easy to claim and use"
                            tooltip="Considers deposit requirements, claim process, and restrictions. No deposit bonuses score highest."
                            color="bg-orange-600"
                        />
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground italic">
                        ✨ Analysis powered by AI. Always review full offer terms before claiming.
                    </p>
                </div>
            </div>
        </div>
    );
}

interface RankingFactorProps {
    name: string;
    score: number;
    description: string;
    tooltip: string;
    color: string;
}

function RankingFactor({ name, score, description, tooltip, color }: RankingFactorProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="space-y-1 cursor-help p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-900/50 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                                <span className="font-medium">{name}</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <span className="font-semibold">{score}/10</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${color} transition-all duration-500`}
                                style={{ width: `${score * 10}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                        <strong>{name}:</strong> {tooltip}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

