'use client'

import { useEffect } from 'react'
import WorkoutApp from '@/components/WorkoutApp'

export default function WorkoutPage() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/workout-sw.js').then((reg) => {
        // Check for updates every time the page loads
        reg.update()
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New version available — reload to get it
                window.location.reload()
              }
            })
          }
        })
      })
    }
  }, [])

  return <WorkoutApp />
}
