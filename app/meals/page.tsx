// #app/meals/page.tsx

import { Suspense } from "react"
import MealsPage from "@/components/MealsPage" // Adjust the import path as needed
import { Skeleton } from "@/components/ui/skeleton" // Optional: for fallback UI

// Enhanced fallback component for loading state
function MealsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header skeleton */}
            <div className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm mb-6">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Skeleton className="h-8 w-36" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </div>
            
            {/* Search and filter skeleton */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            
            {/* Category tabs skeleton */}
            <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-24 rounded-full" />
                    ))}
                </div>
            </div>
            
            {/* Meal cards skeleton - grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex gap-2 pt-2">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <Skeleton key={j} className="h-6 w-16 rounded-full" />
                                ))}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-9 flex-1" />
                                <Skeleton className="h-9 flex-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Mobile bottom navigation skeleton */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
                <div className="flex justify-around items-center h-16 px-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center justify-center">
                            <Skeleton className="h-6 w-6 rounded-full mb-1" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function MealsPageWrapper() {
    return (
        <Suspense fallback={<MealsPageSkeleton />}>
            <MealsPage />
        </Suspense>
    )
}
