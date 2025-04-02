"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

export default function BmiCalculator({ userId }: { userId: string | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [healthMetrics, setHealthMetrics] = useState<any>(null)
  const [weightHistory, setWeightHistory] = useState<any[]>([])

  // BMI form state
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [bmi, setBmi] = useState(0)
  const [bmiCategory, setBmiCategory] = useState("")

  useEffect(() => {
    if (!userId) return

    fetchHealthMetrics()
    fetchWeightHistory()
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
      setWeight(data.weight || 70)
      setHeight(data.height || 170)

      // Calculate BMI with loaded data
      calculateBmi(data.weight, data.height)
    }

    setLoading(false)
  }

  const fetchWeightHistory = async () => {
    const { data, error } = await supabase
      .from("health_metrics")
      .select("id, weight, height, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching weight history:", error)
    } else {
      setWeightHistory(data || [])
    }
  }

  const saveHealthMetrics = async () => {
    if (!userId) return

    setLoading(true)

    // Check if we need to update existing metrics or create new ones
    if (healthMetrics) {
      // Get other fields from existing metrics
      const { gender, age, activity_level, goal, bmr, tdee, target_calories } = healthMetrics

      const metricsData = {
        user_id: userId,
        gender: gender || "male",
        age: age || 30,
        weight,
        height,
        activity_level: activity_level || "moderate",
        goal: goal || "maintain",
        bmr: bmr || 0,
        tdee: tdee || 0,
        target_calories: target_calories || 0,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("health_metrics").insert(metricsData)

      if (error) {
        console.error("Error saving health metrics:", error)
        toast.error("Failed to save health metrics")
      } else {
        toast.success("Weight and height updated")
        fetchHealthMetrics()
        fetchWeightHistory()
      }
    } else {
      // Create new metrics with minimal data
      const metricsData = {
        user_id: userId,
        gender: "male",
        age: 30,
        weight,
        height,
        activity_level: "moderate",
        goal: "maintain",
        bmr: 0,
        tdee: 0,
        target_calories: 0,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("health_metrics").insert(metricsData)

      if (error) {
        console.error("Error saving health metrics:", error)
        toast.error("Failed to save health metrics")
      } else {
        toast.success("Weight and height saved")
        fetchHealthMetrics()
        fetchWeightHistory()
      }
    }

    setLoading(false)
  }

  const calculateBmi = (w = weight, h = height) => {
    // BMI formula: weight (kg) / (height (m))^2
    const heightInMeters = h / 100
    const calculatedBmi = w / (heightInMeters * heightInMeters)
    const roundedBmi = Math.round(calculatedBmi * 10) / 10

    setBmi(roundedBmi)
    setBmiCategory(getBmiCategory(roundedBmi))

    return roundedBmi
  }

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return "Underweight"
    if (bmiValue < 25) return "Normal weight"
    if (bmiValue < 30) return "Overweight"
    return "Obese"
  }

  const getBmiColor = (category: string) => {
    switch (category) {
      case "Underweight":
        return "text-blue-600"
      case "Normal weight":
        return "text-green-600"
      case "Overweight":
        return "text-orange-600"
      case "Obese":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const handleCalculate = () => {
    calculateBmi()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">BMI Calculator</h2>
        <p className="text-gray-500">Calculate your Body Mass Index</p>
      </div>

      <Tabs defaultValue="calculator">
        <TabsList className="mb-6">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">Weight History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculate BMI</CardTitle>
                <CardDescription>Enter your weight and height to calculate your BMI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button onClick={handleCalculate} className="w-full">
                  Calculate BMI
                </Button>

                <Button onClick={saveHealthMetrics} variant="outline" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Measurements"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>BMI Result</CardTitle>
                <CardDescription>Your Body Mass Index calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="text-5xl font-bold mb-2">{bmi.toFixed(1)}</div>
                  <div className={`text-xl font-medium ${getBmiColor(bmiCategory)}`}>{bmiCategory}</div>
                </div>

                <div className="relative pt-6">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div className="bg-blue-500 h-full w-[20%]"></div>
                      <div className="bg-green-500 h-full w-[25%]"></div>
                      <div className="bg-orange-500 h-full w-[20%]"></div>
                      <div className="bg-red-500 h-full w-[35%]"></div>
                    </div>
                  </div>

                  <div
                    className="absolute top-0 w-4 h-4 bg-black rounded-full transform -translate-x-1/2"
                    style={{
                      left: `${Math.min(Math.max((bmi / 40) * 100, 0), 100)}%`,
                    }}
                  ></div>

                  <div className="flex justify-between text-xs mt-1">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-500">
                    <span>&lt;18.5</span>
                    <span>18.5-24.9</span>
                    <span>25-29.9</span>
                    <span>&gt;30</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What your BMI means:</h4>
                  <p className="text-sm text-gray-600">
                    {bmiCategory === "Underweight" &&
                      "Being underweight could indicate nutritional deficiencies or other health issues. Consider consulting with a healthcare provider."}
                    {bmiCategory === "Normal weight" &&
                      "Your weight is within the healthy range for your height. Maintain a balanced diet and regular physical activity."}
                    {bmiCategory === "Overweight" &&
                      "Being overweight may increase your risk of health problems. Consider making lifestyle changes to reach a healthier weight."}
                    {bmiCategory === "Obese" &&
                      "Obesity is associated with increased health risks. It's recommended to consult with a healthcare provider about weight management strategies."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Weight History</CardTitle>
              <CardDescription>Track your weight changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                </div>
              ) : weightHistory.length > 0 ? (
                <div className="space-y-4">
                  {weightHistory.map((record, index) => {
                    const recordBmi = calculateBmi(record.weight, record.height)
                    const category = getBmiCategory(recordBmi)

                    return (
                      <div key={record.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(record.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">{record.height} cm</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{record.weight} kg</p>
                          <p className={`text-sm ${getBmiColor(category)}`}>
                            BMI: {recordBmi.toFixed(1)} ({category})
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No weight history available</p>
                  <Button variant="outline" className="mt-4" onClick={() => saveHealthMetrics()}>
                    Save Current Weight
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

