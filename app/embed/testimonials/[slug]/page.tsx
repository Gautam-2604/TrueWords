'use client'
import TestimonialsDisplay from "@/components/TestimonialDisplay";
import { useParams } from "next/navigation";

export default function EmbedPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <TestimonialsDisplay 
      slug={slug}
      apiBaseUrl="/api" 
    />
  );
}