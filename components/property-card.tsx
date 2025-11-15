'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Property } from '@/types/property'
import { MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface PropertyCardProps {
  property: Property
  onClick?: () => void
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
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

  return (
    <Link 
      href={`/property/${property.id}`}
      className="block w-full"
      onClick={onClick}
    >
      <Card 
        className="cursor-pointer transition-all hover:shadow-lg h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
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
            <Badge
              className="absolute right-2 top-2 z-10"
              variant="secondary"
            >
              {property.property_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {property.description}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {property.address}, {property.city}, {property.state}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span>{property.area} sqft</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="w-full">
            <p className="text-2xl font-bold text-primary">
              €{property.price.toLocaleString()}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}


