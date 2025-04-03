// #app/meals/page.tsx

import { Suspense } from "react"
import MealsPage from "@/components/MealsPage" // Adjust the import path as needed
import { Skeleton } from "@/components/ui/skeleton" // Optional: for fallback UI

// Optional fallback component for loading state
function MealsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
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

