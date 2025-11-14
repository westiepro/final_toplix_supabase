'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import Map, { Marker, Popup, ViewState } from 'react-map-gl/mapbox'
import { Property } from '@/types/property'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Map as MapIcon, Satellite } from 'lucide-react'
import Image from 'next/image'

// Format price based on listing type
function formatPrice(price: number, listingType: 'buy' | 'rent'): string {
  if (listingType === 'rent') {
    // For rent, display full price with € symbol: 1500 -> €1,500
    return `€${price.toLocaleString()}`
  } else {
    // For buy, format with K or M
    if (price >= 1000000) {
      // Format millions: 1500000 -> 1.5M, 2000000 -> 2M
      const millions = price / 1000000
      // Remove trailing .0 if present
      const formatted = millions % 1 === 0 
        ? millions.toString() 
        : millions.toFixed(1)
      return `€${formatted}M`
    } else if (price >= 1000) {
      // Format thousands: 250000 -> 250K, 150000 -> 150K
      const thousands = price / 1000
      return `€${thousands.toFixed(0)}K`
    } else {
      // For prices less than 1000, show full price
      return `€${price.toLocaleString()}`
    }
  }
}

interface PropertyMapProps {
  properties: Property[]
  onViewportChange?: (bounds: { ne: [number, number]; sw: [number, number] }) => void
  initialCenter?: [number, number]
  initialZoom?: number
}

export interface PropertyMapRef {
  flyToLocation: (lng: number, lat: number, zoom?: number) => void
}

export const PropertyMap = forwardRef<PropertyMapRef, PropertyMapProps>(
  function PropertyMap(
    {
      properties,
      onViewportChange,
      initialCenter = [-7.9322, 37.0194], // Default to Faro, Algarve
      initialZoom = 10,
    },
    ref
  ) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: initialCenter[0],
    latitude: initialCenter[1],
    zoom: initialZoom,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  })
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [mapStyle, setMapStyle] = useState<'map' | 'satellite'>('map')
    const mapRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    flyToLocation: (lng: number, lat: number, zoom: number = 12) => {
      if (mapRef.current) {
        const map = mapRef.current.getMap()
        if (map) {
          // Use Mapbox's flyTo for smooth animation
          map.flyTo({
            center: [lng, lat],
            zoom: zoom,
            duration: 2000, // Animation duration in milliseconds (2 seconds)
            essential: true, // Animation is essential and won't be skipped
            easing: (t: number) => {
              // Easing function for smooth acceleration and deceleration
              return t * (2 - t)
            },
          })
          
          // Update viewState after animation completes
          map.once('moveend', () => {
            setViewState({
              longitude: lng,
              latitude: lat,
              zoom,
              pitch: viewState.pitch,
              bearing: viewState.bearing,
              padding: viewState.padding,
            })
          })
        }
      } else {
        // Fallback: set viewState if map isn't ready yet
        setViewState({
          longitude: lng,
          latitude: lat,
          zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
          padding: viewState.padding,
        })
      }
    },
  }))

    // Store callback in ref to prevent re-renders
    const onViewportChangeRef = useRef(onViewportChange)
    
    useEffect(() => {
      onViewportChangeRef.current = onViewportChange
    }, [onViewportChange])
    
    // Debounce viewport changes
    const viewportTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    
    useEffect(() => {
      // Clear existing timeout
      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current)
      }
      
      // Debounce the viewport change notification
      viewportTimeoutRef.current = setTimeout(() => {
        if (mapRef.current && onViewportChangeRef.current) {
          const map = mapRef.current.getMap()
          if (map) {
            const bounds = map.getBounds()
            onViewportChangeRef.current({
              ne: bounds.getNorthEast().toArray() as [number, number],
              sw: bounds.getSouthWest().toArray() as [number, number],
            })
          }
        }
      }, 300)
      
      return () => {
        if (viewportTimeoutRef.current) {
          clearTimeout(viewportTimeoutRef.current)
        }
      }
    }, [viewState])

    const handleMove = useCallback((evt: { viewState: ViewState }) => {
      setViewState(evt.viewState)
      // Don't call onViewportChange here - let the useEffect handle it
      // This prevents the infinite loop
    }, [])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  if (!mapboxToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">
          Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file
        </p>
      </div>
    )
  }

  const toggleMapStyle = () => {
    setMapStyle((prev) => (prev === 'map' ? 'satellite' : 'map'))
  }

  const currentMapStyle = mapStyle === 'satellite' 
    ? 'mapbox://styles/mapbox/satellite-v9'
    : 'mapbox://styles/mapbox/streets-v12'

  return (
    <div className="relative h-full w-full">
      {/* Map Style Toggle Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={toggleMapStyle}
          variant="secondary"
          size="sm"
          className="gap-2 shadow-lg bg-white hover:bg-gray-100"
        >
          {mapStyle === 'map' ? (
            <>
              <Satellite className="h-4 w-4" />
              <span className="hidden sm:inline">Satellite</span>
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </>
          )}
        </Button>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={currentMapStyle}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.longitude}
            latitude={property.latitude}
            anchor="bottom"
          >
            <button
              onClick={() => setSelectedProperty(property)}
              className="cursor-pointer group"
            >
              <div className="bg-blue-600 text-white px-[1px] py-[1px] rounded-lg shadow-lg border-2 border-white font-normal text-xs whitespace-nowrap hover:scale-105 transition-transform">
                {formatPrice(property.price, property.listing_type)}
              </div>
            </button>
          </Marker>
        ))}

                 {selectedProperty && (
                   <Popup
                     longitude={selectedProperty.longitude}
                     latitude={selectedProperty.latitude}
                     anchor="bottom"
                     onClose={() => setSelectedProperty(null)}
                     closeButton={true}
                     closeOnClick={false}
                   >
                     <Link 
                       href={`/property/${selectedProperty.id}`}
                       className="block no-underline"
                       onClick={(e) => {
                         // Allow the link to work
                         e.stopPropagation()
                       }}
                     >
                       <Card className="w-64 cursor-pointer hover:shadow-lg transition-shadow">
                         <CardContent className="p-0">
                           <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
                             {selectedProperty.images && selectedProperty.images.length > 0 ? (
                               <Image
                                 src={selectedProperty.images[0]}
                                 alt={selectedProperty.title}
                                 fill
                                 className="object-cover"
                               />
                             ) : (
                               <div className="flex h-full items-center justify-center text-muted-foreground">
                                 No Image
                               </div>
                             )}
                           </div>
                           <div className="p-3">
                             <div className="flex items-start justify-between mb-2">
                               <h4 className="font-semibold text-sm line-clamp-1">
                                 {selectedProperty.title}
                               </h4>
                               <Badge variant="secondary" className="ml-2 text-xs">
                                 {selectedProperty.property_type}
                               </Badge>
                             </div>
                             <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                               {selectedProperty.address}, {selectedProperty.city}
                             </p>
                             <p className="text-lg font-bold text-primary">
                               €{selectedProperty.price.toLocaleString()}
                             </p>
                             <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                               <span>{selectedProperty.bedrooms} bed</span>
                               <span>{selectedProperty.bathrooms} bath</span>
                               <span>{selectedProperty.area} sqft</span>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     </Link>
                   </Popup>
                 )}
      </Map>
    </div>
  )
  }
)

// Helper function to geocode city name to coordinates (Portugal & Spain only)
export async function geocodeCity(city: string): Promise<[number, number] | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
  if (!mapboxToken) return null

  try {
    // Search for places in Portugal (PT) and Spain (ES) only
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&country=pt,es&types=place&limit=1`
    )
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return [lng, lat]
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }
  return null
}

