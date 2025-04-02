"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import {
  CalendarIcon,
  Plus,
  Minus,
  Droplets,
  CupSodaIcon as Cup,
  GlassWater,
  BoxIcon as Bottle,
  Loader2,
} from "lucide-react"

export default function WaterIntake({ userId }: { userId: string | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date>(new Date())
  const [waterIntake, setWaterIntake] = useState<any>(null)
  const [waterAmount, setWaterAmount] = useState(0)
  const [waterGoal, setWaterGoal] = useState(2000) // Default 2L (2000ml)
  const [waterHistory, setWaterHistory] = useState<any[]>([])
  const [weight, setWeight] = useState(70) // Default weight in kg

  useEffect(() => {
    if (!userId) return

    fetchWaterIntake()
    fetchWaterHistory()
    fetchUserWeight()
  }, [userId, date])

  const fetchWaterIntake = async () => {
    setLoading(true)

    const formattedDate = format(date, "yyyy-MM-dd")

    const { data, error } = await supabase
      .from("water_intake")
      .select("*")
      .eq("user_id", userId)
      .eq("date", formattedDate)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching water intake:", error)
      toast.error("Failed to load water intake data")
    } else if (data) {
      setWaterIntake(data)
      setWaterAmount(data.amount)
      setWaterGoal(data.goal)
    } else {
      // No record for today, set defaults
      setWaterIntake(null)
      setWaterAmount(0)
      // Calculate recommended water intake based on weight
      const recommendedGoal = Math.round(weight * 30) // 30ml per kg of body weight
      setWaterGoal(recommendedGoal)
    }

    setLoading(false)
  }

  const fetchWaterHistory = async () => {
    const { data, error } = await supabase
      .from("water_intake")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(7)

    if (error) {
      console.error("Error fetching water history:", error)
    } else {
      setWaterHistory(data || [])
    }
  }

  const fetchUserWeight = async () => {
    const { data, error } = await supabase
      .from("health_metrics")
      .select("weight")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user weight:", error)
    } else if (data) {
      setWeight(data.weight)
      // Update goal if we don't have a record yet
      if (!waterIntake) {
        const recommendedGoal = Math.round(data.weight * 30) // 30ml per kg of body weight
        setWaterGoal(recommendedGoal)
      }
    }
  }

  const saveWaterIntake = async () => {
    if (!userId) return

    setLoading(true)

    const formattedDate = format(date, "yyyy-MM-dd")

    if (waterIntake) {
      // Update existing record
      const { error } = await supabase
        .from("water_intake")
        .update({
          amount: waterAmount,
          goal: waterGoal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", waterIntake.id)

      if (error) {
        console.error("Error updating water intake:", error)
        toast.error("Failed to update water intake")
      } else {
        toast.success("Water intake updated")
        fetchWaterIntake()
        fetchWaterHistory()
      }
    } else {
      // Create new record
      const { error } = await supabase.from("water_intake").insert({
        user_id: userId,
        date: formattedDate,
        amount: waterAmount,
        goal: waterGoal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating water intake:", error)
        toast.error("Failed to save water intake")
      } else {
        toast.success("Water intake saved")
        fetchWaterIntake()
        fetchWaterHistory()
      }
    }

    setLoading(false)
  }

  const addWater = (amount: number) => {
    setWaterAmount((prev) => Math.min(prev + amount, 5000)) // Cap at 5L
  }

  const subtractWater = (amount: number) => {
    setWaterAmount((prev) => Math.max(prev - amount, 0)) // Min 0
  }

  const getWaterPercentage = () => {
    return Math.min(Math.round((waterAmount / waterGoal) * 100), 100)
  }

  const getWaterStatusMessage = () => {
    const percentage = getWaterPercentage()

    if (percentage === 0) return "Start drinking water!"
    if (percentage < 25) return "You need more water!"
    if (percentage < 50) return "Keep drinking!"
    if (percentage < 75) return "Doing well!"
    if (percentage < 100) return "Almost there!"
    return "Goal achieved! Great job!"
  }

  const getWaterStatusColor = () => {
    const percentage = getWaterPercentage()

    if (percentage < 25) return "text-red-600"
    if (percentage < 50) return "text-orange-600"
    if (percentage < 75) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Water Intake Tracker</h2>
          <p className="text-gray-500">Track your daily water consumption</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={date} onSelect={(newDate) => newDate && setDate(newDate)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Water Intake</CardTitle>
            <CardDescription>{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{(waterAmount / 1000).toFixed(1)}L</div>
                    <div className="text-sm text-gray-500">of {(waterGoal / 1000).toFixed(1)}L goal</div>
                  </div>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${getWaterPercentage() * 2.51} 251`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>

              <div className={`mt-2 font-medium ${getWaterStatusColor()}`}>{getWaterStatusMessage()}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>0L</span>
                <span>{(waterGoal / 1000).toFixed(1)}L</span>
              </div>
              <Progress value={getWaterPercentage()} className="h-2" />
            </div>

            <div>
              <Label htmlFor="water-goal">Daily Water Goal (ml)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="icon" onClick={() => setWaterGoal((prev) => Math.max(prev - 100, 500))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="water-goal"
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  min={500}
                  max={5000}
                  step={100}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWaterGoal((prev) => Math.min(prev + 100, 5000))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: {Math.round(weight * 30)}ml ({(weight * 0.03).toFixed(1)}L) based on your weight
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveWaterIntake} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Water Intake"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Add</CardTitle>
              <CardDescription>Add water by container size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => addWater(200)}
                >
                  <Cup className="h-6 w-6 mb-1 text-blue-500" />
                  <span className="text-sm font-medium">Cup</span>
                  <span className="text-xs text-gray-500">200ml</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => addWater(250)}
                >
                  <GlassWater className="h-6 w-6 mb-1 text-blue-500" />
                  <span className="text-sm font-medium">Glass</span>
                  <span className="text-xs text-gray-500">250ml</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => addWater(500)}
                >
                  <Bottle className="h-6 w-6 mb-1 text-blue-500" />
                  <span className="text-sm font-medium">Bottle</span>
                  <span className="text-xs text-gray-500">500ml</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => addWater(1000)}
                >
                  <Droplets className="h-6 w-6 mb-1 text-blue-500" />
                  <span className="text-sm font-medium">Liter</span>
                  <span className="text-xs text-gray-500">1000ml</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => subtractWater(100)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Slider
                  value={[waterAmount]}
                  min={0}
                  max={waterGoal * 1.5}
                  step={50}
                  onValueChange={(value) => setWaterAmount(value[0])}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => addWater(100)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-500">Current: {waterAmount}ml</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Water Intake History</CardTitle>
              <CardDescription>Your recent water consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              ) : waterHistory.length > 0 ? (
                <div className="space-y-3">
                  {waterHistory.map((record) => (
                    <div key={record.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {new Date(record.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((record.amount / record.goal) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {(record.amount / 1000).toFixed(1)}L / {(record.goal / 1000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No water intake history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

