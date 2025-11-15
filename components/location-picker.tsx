'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Marker, ViewState } from 'react-map-gl/mapbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const MapboxMap = dynamic(() => import('react-map-gl/mapbox').then((mod) => mod.default), {
  ssr: false,
})

interface CitySuggestion {
  name: string
  country: string
  coordinates: [number, number]
}

interface LocationPickerProps {
  initialLatitude?: number
  initialLongitude?: number
  initialCity?: string
  onLocationChange: (data: {
    latitude: number
    longitude: number
    address: string
    city: string
    postalCode: string
  }) => void
}

export function LocationPicker({
  initialLatitude,
  initialLongitude,
  initialCity = '',
  onLocationChange,
}: LocationPickerProps) {
  // Use provided coordinates or default to center of Portugal/Spain viewport
  const defaultLat = 40
  const defaultLng = -5
  
  // Check if we have valid initial coordinates
  const hasValidCoordinates = initialLatitude && initialLongitude && initialLatitude !== 0 && initialLongitude !== 0
  
  const [citySearch, setCitySearch] = useState(initialCity || '')
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    hasValidCoordinates ? (initialLongitude ?? defaultLng) : defaultLng,
    hasValidCoordinates ? (initialLatitude ?? defaultLat) : defaultLat,
  ])
  const [viewState, setViewState] = useState<ViewState>({
    longitude: hasValidCoordinates ? (initialLongitude ?? defaultLng) : defaultLng,
    latitude: hasValidCoordinates ? (initialLatitude ?? defaultLat) : defaultLat,
    zoom: hasValidCoordinates ? 12 : 5, // Zoom in if coordinates provided, else zoom out to show both countries
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  })
  const [isGeocoding, setIsGeocoding] = useState(false)
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Search for cities in Portugal and Spain
  const searchCities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCitySuggestions([])
      setShowSuggestions(false)
      return
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    if (!mapboxToken) return

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=pt,es&types=place&limit=8`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const suggestions: CitySuggestion[] = data.features.map((feature: any) => ({
          name: feature.place_name.split(',')[0], // Get just the city name
          country: feature.context?.find((ctx: any) => ctx.id.startsWith('country'))?.text || '',
          coordinates: feature.center as [number, number],
        }))
        setCitySuggestions(suggestions)
        setShowSuggestions(true)
      } else {
        setCitySuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error searching cities:', error)
      setCitySuggestions([])
      setShowSuggestions(false)
    }
  }, [])

  // Handle city input change with debounced search
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCitySearch(value)

    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current)
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      searchCities(value)
    }, 300)
  }

  // Handle city selection
  const handleCitySelect = (suggestion: CitySuggestion) => {
    setCitySearch(suggestion.name)
    setShowSuggestions(false)
    const [lng, lat] = suggestion.coordinates
    setMarkerPosition([lng, lat])
    setViewState((prev) => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      // Keep current zoom level instead of resetting to 12
      zoom: prev.zoom,
    }))
    // Reverse geocode to get address details
    reverseGeocode(lng, lat)
  }

  // Reverse geocode coordinates to get address details
  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    setIsGeocoding(true)
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    if (!mapboxToken) {
      setIsGeocoding(false)
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&limit=1`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const context = feature.context || []

        // Extract address components
        const address = feature.place_name || ''
        const cityContext = context.find((ctx: any) => ctx.id.startsWith('place'))
        const city = cityContext?.text || ''
        const postalCodeContext = context.find((ctx: any) => ctx.id.startsWith('postcode'))
        const postalCode = postalCodeContext?.text || ''

        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: address,
          city: city,
          postalCode: postalCode,
        })
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    } finally {
      setIsGeocoding(false)
    }
  }, [onLocationChange])

  // Handle map click
  const handleMapClick = (event: any) => {
    event.preventDefault()
    const lng = event.lngLat.lng
    const lat = event.lngLat.lat
    // Only update marker position, don't update viewState to preserve zoom and pan
    setMarkerPosition([lng, lat])
    reverseGeocode(lng, lat)
  }

  // Initialize with existing coordinates if available (but don't auto-reverse geocode)
  useEffect(() => {
    if (hasValidCoordinates && initialLatitude && initialLongitude) {
      setMarkerPosition([initialLongitude, initialLatitude])
      setViewState((prev) => ({
        ...prev,
        longitude: initialLongitude,
        latitude: initialLatitude,
        zoom: 12, // Zoom in for existing properties
      }))
      // Don't auto-reverse geocode on mount - let user drag marker if needed
    }
  }, [initialLatitude, initialLongitude, hasValidCoordinates])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current)
      }
    }
  }, [])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!mapboxToken) {
    return (
      <div className="rounded-lg border bg-muted p-4 text-center text-sm text-muted-foreground">
        Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* City Search */}
      <div className="relative">
        <Input
          id="city-search"
          type="text"
          value={citySearch}
          onChange={handleCityInputChange}
          placeholder="Search for a city in Portugal or Spain..."
          className="w-full"
        />
        {showSuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
            {citySuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCitySelect(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-muted"
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-xs text-muted-foreground">{suggestion.country}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative h-96 w-full overflow-hidden rounded-lg border">
        {isGeocoding && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading address...</p>
            </div>
          </div>
        )}
        <MapboxMap
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={mapboxToken}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          cursor="crosshair"
        >
          <Marker
            longitude={markerPosition[0]}
            latitude={markerPosition[1]}
            anchor="center"
          >
            <div className="pointer-events-none">
              <div className="h-6 w-6 rounded-full border-2 border-white bg-red-500 shadow-lg" />
            </div>
          </Marker>
        </MapboxMap>
      </div>
      <p className="text-xs text-muted-foreground">
        Click on the map to set the exact property location
      </p>
    </div>
  )
}

