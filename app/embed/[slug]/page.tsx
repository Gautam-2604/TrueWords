'use client'
import { notFound } from 'next/navigation'
import TestimonialForm from '@/components/TestimonialForm'
import EmbedWrapper from '@/components/EmbedWrapper'

interface EmbedPageProps {
  params: {
    slug: string
  }
}

async function getFormData(slug: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/forms/${slug}`, {
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching form data:', error)
    return null
  }
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const form = await getFormData(params.slug)
  
  if (!form) {
    notFound()
  }

  return (
    <EmbedWrapper>
      <TestimonialForm 
        form={form}
        isEmbedded={true}
      />
    </EmbedWrapper>
  )
}

