"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { Loader2, Info } from "lucide-react"

export default function CalorieCalculator({ userId }: { userId: string | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [healthMetrics, setHealthMetrics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("calculator")

  // Calculator form state
  const [gender, setGender] = useState("male")
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [activityLevel, setActivityLevel] = useState("moderate")
  const [goal, setGoal] = useState("maintain")

  // Results
  const [bmr, setBmr] = useState(0)
  const [tdee, setTdee] = useState(0)
  const [targetCalories, setTargetCalories] = useState(0)
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 })

  useEffect(() => {
    if (!userId) return

    fetchHealthMetrics()
  }, [userId])

  const fetchHealthMetrics = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching health metrics:", error)
      toast.error("Failed to load health metrics")
    } else if (data) {
      setHealthMetrics(data)
      setGender(data.gender || "male")
      setAge(data.age || 30)
      setWeight(data.weight || 70)
      setHeight(data.height || 170)
      setActivityLevel(data.activity_level || "moderate")
      setGoal(data.goal || "maintain")

      // Calculate immediately with loaded data
      calculateCalories({
        gender: data.gender || "male",
        age: data.age || 30,
        weight: data.weight || 70,
        height: data.height || 170,
        activityLevel: data.activity_level || "moderate",
        goal: data.goal || "maintain",
      })
    }

    setLoading(false)
  }

  const saveHealthMetrics = async () => {
    if (!userId) return

    setLoading(true)

    const metricsData = {
      user_id: userId,
      gender,
      age,
      weight,
      height,
      activity_level: activityLevel,
      goal,
      bmr,
      tdee,
      target_calories: targetCalories,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("health_metrics").insert(metricsData)

    if (error) {
      console.error("Error saving health metrics:", error)
      toast.error("Failed to save health metrics")
    } else {
      toast.success("Health metrics saved")
      fetchHealthMetrics()
    }

    setLoading(false)
  }

  const calculateCalories = (data?: any) => {
    // Use provided data or current state
    const calcGender = data?.gender || gender
    const calcAge = data?.age || age
    const calcWeight = data?.weight || weight
    const calcHeight = data?.height || height
    const calcActivityLevel = data?.activityLevel || activityLevel
    const calcGoal = data?.goal || goal

    // Calculate BMR using Mifflin-St Jeor Equation
    let calculatedBmr = 0
    if (calcGender === "male") {
      calculatedBmr = 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + 5
    } else {
      calculatedBmr = 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge - 161
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    let activityMultiplier = 1.2 // sedentary
    if (calcActivityLevel === "light") activityMultiplier = 1.375
    if (calcActivityLevel === "moderate") activityMultiplier = 1.55
    if (calcActivityLevel === "active") activityMultiplier = 1.725
    if (calcActivityLevel === "very_active") activityMultiplier = 1.9

    let calculatedTdee = calculatedBmr * activityMultiplier

    // Calculate target calories based on goal
    let calculatedTargetCalories = calculatedTdee
    if (calcGoal === "lose") calculatedTargetCalories = calculatedTdee - 500
    if (calcGoal === "gain") calculatedTargetCalories = calculatedTdee + 500

    // Calculate macros (protein, carbs, fat)
    const calculatedMacros = { protein: 0, carbs: 0, fat: 0 }

    if (calcGoal === "lose") {
      // Higher protein, moderate fat, lower carbs for weight loss
      calculatedMacros.protein = calcWeight * 2.2 // 2.2g per kg of bodyweight
      calculatedMacros.fat = (calculatedTargetCalories * 0.3) / 9 // 30% of calories from fat
      calculatedMacros.carbs = (calculatedTargetCalories - calculatedMacros.protein * 4 - calculatedMacros.fat * 9) / 4
    } else if (calcGoal === "gain") {
      // Higher protein, higher carbs, moderate fat for muscle gain
      calculatedMacros.protein = calcWeight * 1.8 // 1.8g per kg of bodyweight
      calculatedMacros.fat = (calculatedTargetCalories * 0.25) / 9 // 25% of calories from fat
      calculatedMacros.carbs = (calculatedTargetCalories - calculatedMacros.protein * 4 - calculatedMacros.fat * 9) / 4
    } else {
      // Balanced macros for maintenance
      calculatedMacros.protein = calcWeight * 1.6 // 1.6g per kg of bodyweight
      calculatedMacros.fat = (calculatedTargetCalories * 0.3) / 9 // 30% of calories from fat
      calculatedMacros.carbs = (calculatedTargetCalories - calculatedMacros.protein * 4 - calculatedMacros.fat * 9) / 4
    }

    // Round values
    calculatedBmr = Math.round(calculatedBmr)
    calculatedTdee = Math.round(calculatedTdee)
    calculatedTargetCalories = Math.round(calculatedTargetCalories)
    calculatedMacros.protein = Math.round(calculatedMacros.protein)
    calculatedMacros.carbs = Math.round(calculatedMacros.carbs)
    calculatedMacros.fat = Math.round(calculatedMacros.fat)

    // Update state
    setBmr(calculatedBmr)
    setTdee(calculatedTdee)
    setTargetCalories(calculatedTargetCalories)
    setMacros(calculatedMacros)

    return {
      bmr: calculatedBmr,
      tdee: calculatedTdee,
      targetCalories: calculatedTargetCalories,
      macros: calculatedMacros,
    }
  }

  const handleCalculate = () => {
    calculateCalories()
    setActiveTab("results")
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Calorie Calculator</h2>
        <p className="text-gray-500">Calculate your daily calorie needs based on your goals</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter your details to calculate your calorie needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={15}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={30}
                    max={300}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={100}
                    max={250}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activity-level">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger id="activity-level">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (hard exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal">Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight (calorie deficit)</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight (calorie surplus)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCalculate} className="w-full">
                Calculate
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calorie Needs</CardTitle>
                <CardDescription>Based on your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Basal Metabolic Rate (BMR)</p>
                    <p className="text-2xl font-bold">{bmr} calories</p>
                    <p className="text-xs text-gray-500 mt-1">Calories needed at complete rest</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Daily Energy Expenditure</p>
                    <p className="text-2xl font-bold">{tdee} calories</p>
                    <p className="text-xs text-gray-500 mt-1">Calories needed with activity</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <Info className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Recommended Daily Intake</p>
                      <p className="text-3xl font-bold text-green-700 mt-1">{targetCalories} calories</p>
                      <p className="text-sm text-green-600 mt-1">
                        {goal === "lose"
                          ? "Calorie deficit for weight loss"
                          : goal === "gain"
                            ? "Calorie surplus for weight gain"
                            : "Maintenance calories"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Macros</CardTitle>
                <CardDescription>Protein, carbohydrates and fat distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Protein</p>
                    <p className="text-2xl font-bold text-blue-700">{macros.protein}g</p>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(macros.protein * 4)} calories</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Carbs</p>
                    <p className="text-2xl font-bold text-amber-700">{macros.carbs}g</p>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(macros.carbs * 4)} calories</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Fat</p>
                    <p className="text-2xl font-bold text-red-700">{macros.fat}g</p>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(macros.fat * 9)} calories</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Macro Percentages</p>
                  <div className="h-6 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="flex h-full">
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${Math.round(((macros.protein * 4) / targetCalories) * 100)}%` }}
                      ></div>
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${Math.round(((macros.carbs * 4) / targetCalories) * 100)}%` }}
                      ></div>
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${Math.round(((macros.fat * 9) / targetCalories) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Protein: {Math.round(((macros.protein * 4) / targetCalories) * 100)}%</span>
                    <span>Carbs: {Math.round(((macros.carbs * 4) / targetCalories) * 100)}%</span>
                    <span>Fat: {Math.round(((macros.fat * 9) / targetCalories) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveHealthMetrics} className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Results"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Calorie History</CardTitle>
                <CardDescription>Your saved calorie calculations</CardDescription>
              </CardHeader>
              <CardContent>
                {healthMetrics ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Latest Calculation</p>
                          <p className="text-sm text-gray-500">
                            {new Date(healthMetrics.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{healthMetrics.target_calories} calories</p>
                          <p className="text-sm text-gray-500">
                            {healthMetrics.goal === "lose"
                              ? "Weight Loss"
                              : healthMetrics.goal === "gain"
                                ? "Weight Gain"
                                : "Maintenance"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">BMR</p>
                          <p className="font-medium">{healthMetrics.bmr} cal</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">TDEE</p>
                          <p className="font-medium">{healthMetrics.tdee} cal</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-medium">{healthMetrics.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Activity</p>
                          <p className="font-medium capitalize">{healthMetrics.activity_level.replace("_", " ")}</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("calculator")}>
                      Recalculate
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No saved calculations yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("calculator")}>
                      Calculate Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

