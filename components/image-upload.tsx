'use client'

import { useState, useRef } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    
    if (filesArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`)
      filesArray.splice(remainingSlots)
    }

    setUploading(true)

    try {
      const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

      if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        throw new Error(
          'Cloudinary not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.'
        )
      }

      const uploadPromises = filesArray.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (max 10MB for Cloudinary)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`)
        }

        // Create form data for Cloudinary upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', cloudinaryUploadPreset)
        formData.append('folder', 'toplix-properties') // Organize images in a folder

        // Upload to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error?.message || `Upload failed: ${response.statusText}`
          
          // Provide helpful error messages for common issues
          if (errorMessage.includes('Upload preset') || errorMessage.includes('preset')) {
            throw new Error(
              `Upload preset "${cloudinaryUploadPreset}" not found. Please check:\n\n` +
              `1. The preset name in Cloudinary Dashboard matches your environment variable\n` +
              `2. The preset is set to "Unsigned" mode\n` +
              `3. Your .env.local has: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${cloudinaryUploadPreset}\n` +
              `4. You've restarted the dev server after adding environment variables`
            )
          }
          
          throw new Error(errorMessage)
        }

        const data = await response.json()
        return data.secure_url // Return the secure URL from Cloudinary
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...images, ...uploadedUrls])
    } catch (error: any) {
      console.error('Error uploading images:', error)
      alert(`Error uploading images: ${error.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    
    // Note: Cloudinary doesn't support client-side deletion without signed URLs
    // For production, you'd want to create an API route to handle deletion
    // For now, we'll just remove it from the array
    // The image will remain in Cloudinary but won't be associated with the property
    
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const fakeEvent = {
        target: { files },
      } as any
      handleFileSelect(fakeEvent)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Property Images</label>
        <span className="text-xs text-muted-foreground">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/400x300?text=Image+Error'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                    Main
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Uploading images...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>No images uploaded yet. Upload at least one image for the property.</span>
        </div>
      )}
    </div>
  )
}

