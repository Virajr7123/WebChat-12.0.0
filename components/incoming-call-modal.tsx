"use client"

import { useEffect, useState } from "react"
import { Phone, PhoneOff } from "lucide-react"
import { motion } from "framer-motion"

interface IncomingCallModalProps {
  isOpen: boolean
  callerName: string
  onAccept: () => void
  onDecline: () => void
}

export default function IncomingCallModal({ isOpen, callerName, onAccept, onDecline }: IncomingCallModalProps) {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => setPulse((prev) => !prev), 1500)
    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      >
        {/* Caller Avatar */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: pulse ? 1 : 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-6 flex items-center justify-center shadow-lg"
          >
            <span className="text-6xl font-bold text-white">{callerName.charAt(0).toUpperCase()}</span>
          </motion.div>

          {/* Caller Name and Status */}
          <h2 className="text-3xl font-bold text-foreground mb-2">{callerName}</h2>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            className="text-muted-foreground text-lg font-medium"
          >
            Calling...
          </motion.p>
        </div>

        {/* Ring Animation */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center"
          >
            <Phone className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Decline Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDecline}
            className="flex-1 rounded-full py-4 px-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-500">Decline</span>
          </motion.button>

          {/* Accept Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            className="flex-1 rounded-full py-4 px-6 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-green-500">Accept</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
