'use client'

import { useEffect } from 'react'

interface EmbedWrapperProps {
  children: React.ReactNode
}

export default function EmbedWrapper({ children }: EmbedWrapperProps) {
  useEffect(() => {
    // Optional: Auto-resize iframe based on content
    const resizeIframe = () => {
      const height = document.body.scrollHeight
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'resize',
          height: height
        }, '*')
      }
    }

    // Resize on load and when content changes
    resizeIframe()
    const observer = new ResizeObserver(resizeIframe)
    observer.observe(document.body)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="embed-container">
      <div className="embed-form">
        {children}
      </div>
    </div>
  )
}