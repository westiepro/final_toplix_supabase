'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import Map, { Marker, Popup, ViewState } from 'react-map-gl/mapbox'
import { Property } from '@/types/property'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import Image from 'next/image'

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
      initialCenter = [-74.006, 40.7128], // Default to NYC
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
    const mapRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    flyToLocation: (lng: number, lat: number, zoom: number = 12) => {
      setViewState({
        longitude: lng,
        latitude: lat,
        zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
        padding: viewState.padding,
      })
    },
  }))

    useEffect(() => {
      if (mapRef.current && onViewportChange) {
        const map = mapRef.current.getMap()
        if (map) {
          const bounds = map.getBounds()
          onViewportChange({
            ne: bounds.getNorthEast().toArray() as [number, number],
            sw: bounds.getSouthWest().toArray() as [number, number],
          })
        }
      }
    }, [viewState, onViewportChange])

    const handleMove = (evt: { viewState: ViewState }) => {
      setViewState(evt.viewState)
      if (mapRef.current && onViewportChange) {
        const map = mapRef.current.getMap()
        if (map) {
          const bounds = map.getBounds()
          onViewportChange({
            ne: bounds.getNorthEast().toArray() as [number, number],
            sw: bounds.getSouthWest().toArray() as [number, number],
          })
        }
      }
    }

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

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
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
              className="cursor-pointer"
            >
              <MapPin className="h-8 w-8 text-primary fill-primary" />
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
            <Card className="w-64">
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
                    ${selectedProperty.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{selectedProperty.bedrooms} bed</span>
                    <span>{selectedProperty.bathrooms} bath</span>
                    <span>{selectedProperty.area} sqft</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Popup>
        )}
      </Map>
    </div>
  )
  }
)

// Helper function to geocode city name to coordinates
export async function geocodeCity(city: string): Promise<[number, number] | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
  if (!mapboxToken) return null

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&limit=1`
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

