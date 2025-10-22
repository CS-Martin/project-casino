import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* 404 Number */}
                <div className="relative">
                    <h1 className="text-9xl font-bold text-purple-600 dark:text-purple-400 opacity-20">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-8">
                            <Search className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Go to Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                        <Link href="/dashboard/offer" className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Helpful Links */}
                <div className="pt-8 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                        Looking for something specific?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link
                            href="/dashboard/offer"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                            Offer Dashboard
                        </Link>
                        <Link
                            href="/dashboard/casino"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                        >
                            Casino Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

