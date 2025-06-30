'use client'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import TestimonialForm from '@/components/TestimonialForm'
import EmbedWrapper from '@/components/EmbedWrapper'

interface EmbedPageProps {
  params: {
    slug: string
  }
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchFormData() {
      try {
        const response = await fetch(`/api/forms/${params.slug}`)
        
        if (!response.ok) {
          if (isMounted) {
            setError(true)
            setLoading(false)
          }
          return
        }
        
        const data = await response.json()
        console.log(data);
        
        
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
  }, [params.slug])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !form) {
    notFound()
  }

  return (
    <EmbedWrapper>
      <TestimonialForm 
        form={form}
      />
    </EmbedWrapper>
  )
}