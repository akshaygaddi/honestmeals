"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Volume2, VolumeX } from "lucide-react"
import { toast } from "react-hot-toast"

export default function SoundPermissionRequest({
                                                   onPermissionGranted,
                                               }: {
    onPermissionGranted: () => void
}) {
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [showRequest, setShowRequest] = useState(false)

    // Check if we've already asked for permission
    useEffect(() => {
        const hasAsked = localStorage.getItem("soundPermissionAsked")
        if (!hasAsked) {
            // Delay showing the request to avoid immediate popups
            const timer = setTimeout(() => {
                setShowRequest(true)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const requestPermission = async () => {
        try {
            // Create a dummy audio context to trigger permission prompt
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            await audioContext.resume()
            audioContext.close()

            setPermissionGranted(true)
            localStorage.setItem("soundPermissionAsked", "true")
            onPermissionGranted()
            setShowRequest(false)
            toast.success("Notification sounds enabled")
        } catch (error) {
            console.error("Error requesting audio permission:", error)
            toast.error("Could not enable notification sounds")
        }
    }

    const denyPermission = () => {
        localStorage.setItem("soundPermissionAsked", "true")
        setShowRequest(false)
        toast("Notification sounds disabled", { icon: <VolumeX className="text-gray-500" /> })
    }

    if (!showRequest) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Enable notification sounds?
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get audio alerts when new orders arrive
                        </p>
                        <div className="mt-2 flex space-x-2">
                            <Button
                                size="sm"
                                onClick={requestPermission}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                <Volume2 className="mr-1 h-4 w-4" />
                                Allow
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={denyPermission}
                            >
                                <VolumeX className="mr-1 h-4 w-4" />
                                Deny
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}