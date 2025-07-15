
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS!
  }
})

export async function POST(request: NextRequest) {
  try {
    const { key, contentType, operation } = await request.json()

    if (!key || !contentType || !operation) {
      return NextResponse.json(
        { error: 'Missing required fields: key, contentType, operation' },
        { status: 400 }
      )
    }

    if (!contentType.startsWith('image/') && !contentType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid content type. Only images and videos are allowed.' },
        { status: 400 }
      )
    }

    if (operation !== 'upload') {
      return NextResponse.json(
        { error: 'Invalid operation. Only "upload" is supported.' },
        { status: 400 }
      )
    }

    const command = new PutObjectCommand({
      Bucket: 'truewords',
      Key: key,
      ContentType: contentType,
      Metadata: {
        'uploaded-by': 'testimonial-form',
        'upload-timestamp': new Date().toISOString()
      }
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 360000 // 1 hour
    })

    return NextResponse.json({ 
      presignedUrl,
      key,
      publicUrl: `https://truewords.s3.ap-south-1.amazonaws.com/${key}`
    })

  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    )
  }
}