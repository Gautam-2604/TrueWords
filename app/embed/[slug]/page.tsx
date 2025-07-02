'use client'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import TestimonialEmbed from '../components/TestimonialForm'
import EmbedWrapper from '../components/EmbedWrapper'

interface EmbedPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function resolveParams() {
      try {
        const resolvedParams = await params
        if (isMounted) {
          setSlug(resolvedParams.slug)
        }
      } catch (err) {
        console.error('Error resolving params:', err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    resolveParams()

    return () => {
      isMounted = false
    }
  }, [params])

  useEffect(() => {
    if (!slug) return

    let isMounted = true

    async function fetchFormData() {
      try {
        const response = await fetch(`/api/forms/${slug}`)
        
        if (!response.ok) {
          if (isMounted) {
            setError(true)
            setLoading(false)
          }
          return
        }
        
        const data = await response.json()
        console.log(data)
        
        if (isMounted) {
          setForm(data)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching form data:', err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      }
    }

    fetchFormData()

    return () => {
      isMounted = false
    }
  }, [slug])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !form) {
    notFound()
  }

  return (
    <EmbedWrapper>
      <TestimonialEmbed
        form={form}
      />
    </EmbedWrapper>
  )
}