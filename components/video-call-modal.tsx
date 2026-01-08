"use client"

import { useState, useEffect } from "react"
import { PhoneOff, Mic, MicOff, Share2 } from "lucide-react"
import { motion } from "framer-motion"

interface VideoCallModalProps {
  isOpen: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onHangUp: () => void
  isMuted?: boolean
  onToggleMute?: () => void
  isSharingScreen?: boolean
  onStartScreenShare?: () => void
  onStopScreenShare?: () => void
  devices?: any
  contactName?: string
}

export default function VideoCallModal({
  isOpen,
  localStream,
  remoteStream,
  onHangUp,
  isMuted = false,
  onToggleMute,
  isSharingScreen = false,
  onStartScreenShare,
  onStopScreenShare,
  contactName = "Contact",
}: VideoCallModalProps) {
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0)
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black"
    >
      {/* Main Video Container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Remote Video (Main) */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {remoteStream ? (
            <video
              ref={(video) => {
                if (video) video.srcObject = remoteStream
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{contactName.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-white text-lg font-semibold">{contactName}</p>
                <p className="text-gray-400 text-sm mt-2">Connecting...</p>
              </div>
            </div>
          )}
        </div>

        {/* Header with Call Info */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6 z-10">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{contactName}</h2>
              <p className="text-gray-300 text-sm">{formatTime(callDuration)}</p>
            </div>
          </div>
        </div>

        {/* Local Video (Picture in Picture) */}
        {localStream && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-24 right-4 w-32 h-40 rounded-lg overflow-hidden border-2 border-white/30 bg-black shadow-lg z-20"
          >
            <video
              ref={(video) => {
                if (video) video.srcObject = localStream
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          </motion.div>
        )}

        {/* Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20"
        >
          <div className="flex justify-center items-center gap-4">
            {/* Mute Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleMute}
              className={`rounded-full p-4 transition-colors ${
                isMuted ? "bg-red-500/20 hover:bg-red-500/30" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </motion.button>

            {/* Screen Share Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={isSharingScreen ? onStopScreenShare : onStartScreenShare}
              className={`rounded-full p-4 transition-colors ${
                isSharingScreen ? "bg-blue-500/30 hover:bg-blue-500/40" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <Share2 className="w-6 h-6 text-white" />
            </motion.button>

            {/* Hang Up Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onHangUp}
              className="rounded-full p-4 bg-red-500 hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
