'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Property } from '@/types/property'
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight, Share2, Heart } from 'lucide-react'
import Image from 'next/image'

interface PropertyCardProps {
  property: Property
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function PropertyCard({ property, onClick, onMouseEnter, onMouseLeave }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const images = property.images && property.images.length > 0 ? property.images : []
  const hasMultipleImages = images.length > 1

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const propertyUrl = `${window.location.origin}/property/${property.id}`
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: propertyUrl,
      }).catch((error) => {
        console.log('Error sharing:', error)
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(propertyUrl).then(() => {
        alert('Property link copied to clipboard!')
      }).catch(() => {
        alert(`Property URL: ${propertyUrl}`)
      })
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited((prev) => !prev)
    // TODO: Implement actual favorite functionality with Supabase
    // For now, just toggles local state
  }

  return (
    <Link 
      href={`/property/${property.id}`}
      className="block w-full"
      onClick={onClick}
    >
      <Card 
        className="cursor-pointer transition-all hover:shadow-lg h-full flex flex-col pt-0 pb-0 gap-0"
        onMouseEnter={() => {
          setIsHovered(true)
          onMouseEnter?.()
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          onMouseLeave?.()
        }}
      >
        <CardHeader className="p-0 m-0 flex-shrink-0">
          <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-muted">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                {hasMultipleImages && isHovered && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gray-500/50 hover:bg-gray-500/60 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gray-500/50 hover:bg-gray-500/60 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                  </>
                )}
                {/* Image counter - only show when on 2nd image or beyond and hovering */}
                {hasMultipleImages && currentImageIndex > 0 && isHovered && (
                  <div className="absolute bottom-2 left-2 z-20 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 pt-2 pb-2 flex-1 relative">
          {/* Price and action icons */}
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-2xl font-bold text-blue-600">
              €{property.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Share property"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleFavorite}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Add to favorites"
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${
                    isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`} 
                />
              </button>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {property.title}
          </h3>
          
          {/* Location - only city with flag */}
          <div className="flex items-center gap-1 text-base text-muted-foreground mb-1.5">
            <MapPin className="h-4 w-4" />
            <span>{property.city}</span>
            <span className="text-lg">🇵🇹</span>
          </div>
          
          {/* Divider line */}
          <div className="border-t border-gray-200 my-1.5"></div>
          
          {/* Property details */}
          <div className="flex items-center gap-4 text-base">
            <div className="flex items-center gap-1.5">
              <Bed className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{property.area} m²</span>
            </div>
            
            {/* Property type at bottom right */}
            <div className="ml-auto">
              <span className="text-sm font-medium capitalize">{property.property_type}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


