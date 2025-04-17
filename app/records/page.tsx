"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import FoodJournal from "@/components/records/food-journal"
import CalorieCalculator from "@/components/records/calorie-calculator"
import BmiCalculator from "@/components/records/bmi-calculator"
import WaterIntake from "@/components/records/water-intake"
import SustainableDiet from "@/components/records/sustainable-diet"
import MealRecommendations from "@/components/records/meal-recommendations"

export default function RecordsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("food-journal")

    useEffect(() => {
        async function checkUser() {
            setLoading(true)
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Please sign in to access your records")
                router.push("/sign-in")
                return
            }

            setUserId(user.id)
            setLoading(false)
        }

        checkUser()
    }, [supabase, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Your Health Records
            </h1>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
                    <TabsTrigger value="food-journal">Food Journal</TabsTrigger>
                    {/*<TabsTrigger value="calorie-calculator">Calorie Calculator</TabsTrigger>*/}
                    {/*<TabsTrigger value="bmi-calculator">BMI Calculator</TabsTrigger>*/}
                    {/*<TabsTrigger value="water-intake">Water Intake</TabsTrigger>*/}
                    {/*<TabsTrigger value="sustainable-diet">Sustainable Diet</TabsTrigger>*/}
                    <TabsTrigger value="meal-recommendations">Meal Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="food-journal">
                    <FoodJournal userId={userId} />
                </TabsContent>

                {/*<TabsContent value="calorie-calculator">*/}
                {/*    <CalorieCalculator userId={userId} />*/}
                {/*</TabsContent>*/}

                {/*<TabsContent value="bmi-calculator">*/}
                {/*    <BmiCalculator userId={userId} />*/}
                {/*</TabsContent>*/}

                {/*<TabsContent value="water-intake">*/}
                {/*    <WaterIntake userId={userId} />*/}
                {/*</TabsContent>*/}

                {/*<TabsContent value="sustainable-diet">*/}
                {/*    <SustainableDiet />*/}
                {/*</TabsContent>*/}

                <TabsContent value="meal-recommendations">
                    <MealRecommendations userId={userId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

