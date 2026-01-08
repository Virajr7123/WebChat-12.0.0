"use client"

import { useEffect, useState } from "react"
import { PhoneOff } from "lucide-react"
import { motion } from "framer-motion"

interface OutgoingCallModalProps {
  isOpen: boolean
  recipientName: string
  onCancel: () => void
}

export default function OutgoingCallModal({ isOpen, recipientName, onCancel }: OutgoingCallModalProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (!isOpen) return
    let count = 0
    const interval = setInterval(() => {
      count = (count + 1) % 4
      setDots(".".repeat(count))
    }, 500)
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
        {/* Recipient Avatar */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-6 flex items-center justify-center shadow-lg"
          >
            <span className="text-6xl font-bold text-white">{recipientName.charAt(0).toUpperCase()}</span>
          </motion.div>

          {/* Recipient Name */}
          <h2 className="text-3xl font-bold text-foreground mb-2">{recipientName}</h2>

          {/* Status with Animated Dots */}
          <p className="text-muted-foreground text-lg font-medium h-6">Calling{dots}</p>
        </div>

        {/* Dialing Animation */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>

        {/* Cancel Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="w-full rounded-full py-4 px-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center justify-center gap-2"
        >
          <PhoneOff className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-500">Cancel</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
