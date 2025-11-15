'use client'

import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Search, Save, X, Filter, Home, Building2, Building } from 'lucide-react'
import { PropertyType, Property } from '@/types/property'
import { FilterSidebar } from '@/components/filter-sidebar'

const propertyTypeIcons: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  house: Home,
  apartment: Building2,
  condo: Building,
  townhouse: Building,
  villa: Home,
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  onCitySearch: (city: string) => void
  onSaveSearch?: () => void
  filteredCount?: number
  properties?: Property[]
}

export interface FilterState {
  city: string
  minPrice: number
  maxPrice: number
  propertyType: PropertyType | 'all'
  bedrooms: number | number[] | 'all'
  bathrooms: number | number[] | 'all'
  minArea: number
  maxArea: number
  features?: ('pool' | 'garage')[]
}

const defaultFilters: FilterState = {
  city: '',
  minPrice: 0,
  maxPrice: 2000000,
  propertyType: 'all',
  bedrooms: 'all',
  bathrooms: 'all',
  minArea: 0,
  maxArea: 500,
  features: [],
}

interface CitySuggestion {
  name: string
  country: string
  coordinates: [number, number]
}

function PropertyFiltersComponent({
  onFiltersChange,
  onCitySearch,
  onSaveSearch,
  filteredCount = 0,
  properties = [],
}: PropertyFiltersProps) {
  // Internal state - completely independent
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [priceMinInput, setPriceMinInput] = useState<string>('')
  const [priceMaxInput, setPriceMaxInput] = useState<string>('')
  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false)
  const [isBedBathPopoverOpen, setIsBedBathPopoverOpen] = useState(false)
  const [isPropertyTypePopoverOpen, setIsPropertyTypePopoverOpen] = useState(false)
  const [selectedBeds, setSelectedBeds] = useState<number[]>([])
  const [selectedBaths, setSelectedBaths] = useState<number[]>([])
  const [areaRange, setAreaRange] = useState([0, 500])
  const [cityInput, setCityInput] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputPosition, setInputPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Store callbacks in refs so they never cause re-renders
  const onFiltersChangeRef = useRef(onFiltersChange)
  const onCitySearchRef = useRef(onCitySearch)
  const onSaveSearchRef = useRef(onSaveSearch)
  
  // Debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastNotifiedRef = useRef<string>('')
  
  // Update refs when callbacks change (but don't cause re-render)
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
    onCitySearchRef.current = onCitySearch
    onSaveSearchRef.current = onSaveSearch
  }, [onFiltersChange, onCitySearch, onSaveSearch])

  // Sync cityInput with filters.city when filters change externally (e.g., clear filters)
  useEffect(() => {
    // Only sync if filters.city is empty (cleared) and cityInput is not empty
    // This prevents infinite loops while allowing external filter clearing
    if (!filters.city && cityInput) {
      setCityInput('')
      setCitySuggestions([])
      setShowSuggestions(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city])

  // Sync price inputs with priceRange
  useEffect(() => {
    if (!isPricePopoverOpen) {
      setPriceMinInput(priceRange[0] === 0 ? '' : priceRange[0].toString())
      setPriceMaxInput(priceRange[1] === 2000000 ? '' : priceRange[1].toString())
    }
  }, [priceRange, isPricePopoverOpen])

  // Sync bed/bath selections with filters
  useEffect(() => {
    if (!isBedBathPopoverOpen) {
      if (filters.bedrooms === 'all') {
        setSelectedBeds([])
      } else if (typeof filters.bedrooms === 'number') {
        setSelectedBeds([filters.bedrooms])
      } else if (Array.isArray(filters.bedrooms)) {
        setSelectedBeds(filters.bedrooms)
      }
      if (filters.bathrooms === 'all') {
        setSelectedBaths([])
      } else if (typeof filters.bathrooms === 'number') {
        setSelectedBaths([filters.bathrooms])
      } else if (Array.isArray(filters.bathrooms)) {
        setSelectedBaths(filters.bathrooms)
      }
    }
  }, [filters.bedrooms, filters.bathrooms, isBedBathPopoverOpen])

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!showSuggestions || !inputRef.current) return

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setInputPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [showSuggestions])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current)
      }
    }
  }, [])
  
  // Debounced notification to parent
  const notifyParent = useCallback((newFilters: FilterState) => {
    const filtersKey = JSON.stringify(newFilters)
    
    // Skip if same as last notified
    if (filtersKey === lastNotifiedRef.current) {
      return
    }
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Debounce the notification
    debounceTimerRef.current = setTimeout(() => {
      lastNotifiedRef.current = filtersKey
      onFiltersChangeRef.current(newFilters)
    }, 300)
  }, [])
  
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
      // Search for places in Portugal (PT) and Spain (ES) only
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
        // Update position when suggestions are loaded
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect()
          setInputPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
          })
        }
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
  const handleCityInputChange = useCallback((value: string) => {
    setCityInput(value)
    
    // Clear existing timer
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current)
    }
    
    // Debounce the search
    searchDebounceTimerRef.current = setTimeout(() => {
      searchCities(value)
    }, 300)
  }, [searchCities])

  // Handle city selection from dropdown
  const handleCitySelect = useCallback((suggestion: CitySuggestion) => {
    setCityInput(suggestion.name)
    setShowSuggestions(false)
    setCitySuggestions([])
    
    setFilters((prev) => {
      const newFilters = { ...prev, city: suggestion.name }
      // Immediate city search for map navigation with coordinates
      onCitySearchRef.current(suggestion.name)
      // Debounced filter update
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])

  // Handle city reset
  const handleCityReset = useCallback(() => {
    setCityInput('')
    setCitySuggestions([])
    setShowSuggestions(false)
    
    setFilters((prev) => {
      const newFilters = { ...prev, city: '' }
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])

  // Handlers - all use refs to prevent re-renders
  const handleCityChange = useCallback((value: string) => {
    handleCityInputChange(value)
  }, [handleCityInputChange])
  
  // Custom step function to snap values to correct steps
  const snapToStep = useCallback((value: number) => {
    if (value < 1000000) {
      // 50k steps from 0 to 1M
      return Math.round(value / 50000) * 50000
    } else {
      // 100k steps from 1M to 5M
      return Math.round((value - 1000000) / 100000) * 100000 + 1000000
    }
  }, [])

  const handlePriceChange = useCallback((values: number[]) => {
    const [min, max] = values
    // Snap values to correct steps
    const snappedMin = snapToStep(min)
    const snappedMax = snapToStep(max)
    const newRange = [snappedMin, snappedMax]
    setPriceRange(newRange)
    setPriceMinInput(snappedMin === 0 ? '' : snappedMin.toString())
    setPriceMaxInput(snappedMax === 2000000 ? '' : snappedMax.toString())
    setFilters((prev) => {
      if (prev.minPrice === snappedMin && prev.maxPrice === snappedMax) return prev
      const newFilters = { ...prev, minPrice: snappedMin, maxPrice: snappedMax }
      // Defer parent update to avoid setState during render
      setTimeout(() => {
        onFiltersChangeRef.current(newFilters)
      }, 0)
      return newFilters
    })
  }, [snapToStep])

  const handlePriceMinInputChange = useCallback((value: string) => {
    setPriceMinInput(value)
    const numValue = parseInt(value) || 0
    const clampedValue = Math.max(0, Math.min(numValue, priceRange[1]))
    const snappedValue = snapToStep(clampedValue)
    const newRange = [snappedValue, priceRange[1]]
    setPriceRange(newRange)
    setFilters((prev) => {
      const newFilters = { ...prev, minPrice: snappedValue, maxPrice: priceRange[1] }
      // Defer parent update to avoid setState during render
      setTimeout(() => {
        onFiltersChangeRef.current(newFilters)
      }, 0)
      return newFilters
    })
  }, [priceRange, snapToStep])

  const handlePriceMaxInputChange = useCallback((value: string) => {
    setPriceMaxInput(value)
    const numValue = parseInt(value) || 0
    const clampedValue = Math.max(priceRange[0], Math.min(numValue, 5000000))
    const snappedValue = snapToStep(clampedValue)
    const newRange = [priceRange[0], snappedValue]
    setPriceRange(newRange)
    setFilters((prev) => {
      const newFilters = { ...prev, minPrice: priceRange[0], maxPrice: snappedValue }
      // Defer parent update to avoid setState during render
      setTimeout(() => {
        onFiltersChangeRef.current(newFilters)
      }, 0)
      return newFilters
    })
  }, [priceRange, snapToStep])

  const handlePriceReset = useCallback(() => {
    const defaultRange = [0, 2000000]
    setPriceRange(defaultRange)
    setPriceMinInput('')
    setPriceMaxInput('')
    setFilters((prev) => {
      const newFilters = { ...prev, minPrice: 0, maxPrice: 2000000 }
      // Defer parent update to avoid setState during render
      setTimeout(() => {
        onFiltersChangeRef.current(newFilters)
      }, 0)
      return newFilters
    })
  }, [])

  const handlePriceDone = useCallback(() => {
    setIsPricePopoverOpen(false)
  }, [])
  
  const handleAreaChange = useCallback((values: number[]) => {
    setAreaRange(values)
    setFilters((prev) => {
      if (prev.minArea === values[0] && prev.maxArea === values[1]) return prev
      const newFilters = { ...prev, minArea: values[0], maxArea: values[1] }
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])
  
  const handlePropertyTypeChange = useCallback((value: string) => {
    setFilters((prev) => {
      if (prev.propertyType === value) return prev
      const newFilters = { ...prev, propertyType: value as PropertyType | 'all' }
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])
  
  const handleBedroomsChange = useCallback((value: string) => {
    const newValue: number | 'all' = value === 'all' ? 'all' : parseInt(value)
    setFilters((prev) => {
      if (prev.bedrooms === newValue) return prev
      const newFilters = { ...prev, bedrooms: newValue }
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])

  const handleBathroomsChange = useCallback((value: string) => {
    const newValue: number | 'all' = value === 'all' ? 'all' : parseInt(value)
    setFilters((prev) => {
      if (prev.bathrooms === newValue) return prev
      const newFilters = { ...prev, bathrooms: newValue }
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])

  // Handle bed selection with multiple value support
  const handleBedClick = useCallback((value: number | 'studio' | 'any') => {
    if (value === 'any') {
      setSelectedBeds([])
      setFilters((prev) => {
        const newFilters = { ...prev, bedrooms: 'all' }
        setTimeout(() => {
          onFiltersChangeRef.current(newFilters)
        }, 0)
        return newFilters
      })
      return
    }

    const numValue = value === 'studio' ? 0 : value
    setSelectedBeds((prev) => {
      let newSelection: number[]
      if (prev.includes(numValue)) {
        // Deselect if already selected
        newSelection = prev.filter((v) => v !== numValue)
      } else {
        // Add to selection (allow multiple selections)
        newSelection = [...prev, numValue]
      }

      // Update filter with selected values
      setFilters((prevFilters) => {
        const newFilters = {
          ...prevFilters,
          bedrooms: newSelection.length === 0 ? 'all' : newSelection.length === 1 ? newSelection[0] : newSelection,
        }
        setTimeout(() => {
          onFiltersChangeRef.current(newFilters)
        }, 0)
        return newFilters
      })
      return newSelection
    })
  }, [])

  // Handle bath selection with multiple value support
  const handleBathClick = useCallback((value: number | 'any') => {
    if (value === 'any') {
      setSelectedBaths([])
      setFilters((prev) => {
        const newFilters = { ...prev, bathrooms: 'all' }
        setTimeout(() => {
          onFiltersChangeRef.current(newFilters)
        }, 0)
        return newFilters
      })
      return
    }

    setSelectedBaths((prev) => {
      let newSelection: number[]
      if (prev.includes(value)) {
        // Deselect if already selected
        newSelection = prev.filter((v) => v !== value)
      } else {
        // Add to selection (allow multiple selections)
        newSelection = [...prev, value]
      }

      // Update filter with selected values
      setFilters((prevFilters) => {
        const newFilters = {
          ...prevFilters,
          bathrooms: newSelection.length === 0 ? 'all' : newSelection.length === 1 ? newSelection[0] : newSelection,
        }
        setTimeout(() => {
          onFiltersChangeRef.current(newFilters)
        }, 0)
        return newFilters
      })
      return newSelection
    })
  }, [])

  const handleBedBathReset = useCallback(() => {
    setSelectedBeds([])
    setSelectedBaths([])
    setFilters((prev) => {
      const newFilters = { ...prev, bedrooms: 'all', bathrooms: 'all' }
      setTimeout(() => {
        onFiltersChangeRef.current(newFilters)
      }, 0)
      return newFilters
    })
  }, [])

  const handleBedBathDone = useCallback(() => {
    setIsBedBathPopoverOpen(false)
  }, [])
  
  const clearFilters = useCallback(() => {
    const cleared = { ...defaultFilters, features: [] }
    setFilters(cleared)
    setCityInput('')
    setCitySuggestions([])
    setShowSuggestions(false)
    setPriceRange([0, 2000000])
    setPriceMinInput('')
    setPriceMaxInput('')
    setSelectedBeds([])
    setSelectedBaths([])
    setAreaRange([0, 500])
    lastNotifiedRef.current = ''
    notifyParent(cleared)
  }, [notifyParent])

  const handleResetAll = useCallback(() => {
    clearFilters()
  }, [clearFilters])
  
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* City Search with Dropdown */}
          <div className="w-[280px] relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                ref={inputRef}
                placeholder="Search for city (Portugal & Spain)"
                value={cityInput}
                onChange={(e) => handleCityChange(e.target.value)}
                onFocus={() => {
                  if (inputRef.current) {
                    const rect = inputRef.current.getBoundingClientRect()
                    setInputPosition({
                      top: rect.bottom + window.scrollY,
                      left: rect.left + window.scrollX,
                      width: rect.width,
                    })
                  }
                  if (citySuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                className="pl-10 pr-10"
              />
              {cityInput && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCityReset()
                    inputRef.current?.focus()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-gray-500/50 hover:bg-gray-500/60 transition-all"
                  aria-label="Clear city search"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          </div>
          
          {/* Render dropdown in portal to appear above everything */}
          {typeof window !== 'undefined' && showSuggestions && citySuggestions.length > 0 && inputPosition && createPortal(
            <div
              className="fixed bg-popover border rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto"
              style={{
                top: `${inputPosition.top + 4}px`,
                left: `${inputPosition.left}px`,
                width: `${inputPosition.width}px`,
              }}
            >
              {citySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCitySelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0"
                >
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">{suggestion.country}</div>
                </button>
              ))}
            </div>,
            document.body
          )}

          {/* Price Range */}
          <Popover open={isPricePopoverOpen} onOpenChange={setIsPricePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[220px] justify-between">
                {priceRange[0] === 0 && priceRange[1] === 2000000
                  ? 'Price'
                  : `€${priceRange[0].toLocaleString()} - €${priceRange[1].toLocaleString()}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  min={0}
                  max={5000000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>€{priceRange[0].toLocaleString()}</span>
                  <span>€{priceRange[1].toLocaleString()}</span>
                </div>
                
                {/* Min/Max Input Fields */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Enter min"
                      value={priceMinInput}
                      onChange={(e) => handlePriceMinInputChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Enter max"
                      value={priceMaxInput}
                      onChange={(e) => handlePriceMaxInputChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Reset and Done Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={handlePriceReset}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handlePriceDone}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Property Type */}
          <Popover open={isPropertyTypePopoverOpen} onOpenChange={setIsPropertyTypePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-between">
                {filters.propertyType === 'all' 
                  ? 'Property Type' 
                  : filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handlePropertyTypeChange('all')
                    setIsPropertyTypePopoverOpen(false)
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
                    filters.propertyType === 'all'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Building2 className="h-6 w-6 mb-1" />
                  <span className="text-sm font-medium">All</span>
                </button>
                {(['house', 'apartment', 'condo', 'townhouse', 'villa'] as PropertyType[]).map((type) => {
                  const Icon = propertyTypeIcons[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        handlePropertyTypeChange(type)
                        setIsPropertyTypePopoverOpen(false)
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
                        filters.propertyType === type
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-1" />
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Bed/Baths Combined Filter */}
          <Popover open={isBedBathPopoverOpen} onOpenChange={setIsBedBathPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-between">
                {(() => {
                  const bedText = filters.bedrooms === 'all' 
                    ? '' 
                    : Array.isArray(filters.bedrooms)
                      ? `${filters.bedrooms.join(', ')} Beds`
                      : `${filters.bedrooms} Beds`
                  const bathText = filters.bathrooms === 'all'
                    ? ''
                    : Array.isArray(filters.bathrooms)
                      ? `${filters.bathrooms.join(', ')} Baths`
                      : `${filters.bathrooms} Baths`
                  
                  if (!bedText && !bathText) return 'Bed/Baths'
                  if (bedText && bathText) return `${bedText} / ${bathText}`
                  return bedText || bathText
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px]">
              <div className="space-y-6">
                {/* Beds Section */}
                <div>
                  <h3 className="text-lg font-bold mb-2">Beds</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tap numbers to select
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleBedClick('any')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                        filters.bedrooms === 'all'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Any
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBedClick('studio')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                        selectedBeds.includes(0)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Studio
                    </button>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleBedClick(num)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                          selectedBeds.includes(num)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleBedClick(5)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                        selectedBeds.includes(5)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      5+
                    </button>
                  </div>
                </div>

                {/* Baths Section */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Baths</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleBathClick('any')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                        filters.bathrooms === 'all'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Any
                    </button>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleBathClick(num)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                          selectedBaths.includes(num)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset and Done Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    onClick={handleBedBathReset}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleBedBathDone}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filters Button */}
          <Button 
            onClick={() => setIsFilterSidebarOpen(true)}
            variant="outline" 
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>

          {/* Save Search */}
          {onSaveSearch && (
            <Button 
              onClick={() => onSaveSearchRef.current?.()} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg border border-red-700 shadow-sm"
            >
              <span>Save search</span>
            </Button>
          )}

          {/* Clear Filters */}
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          notifyParent(newFilters)
        }}
        filteredCount={filteredCount}
        priceRange={priceRange}
        onPriceRangeChange={(range) => {
          setPriceRange(range)
          setFilters((prev) => {
            const newFilters = { ...prev, minPrice: range[0], maxPrice: range[1] }
            notifyParent(newFilters)
            return newFilters
          })
        }}
        areaRange={areaRange}
        onAreaRangeChange={(range) => {
          setAreaRange(range)
          setFilters((prev) => {
            const newFilters = { ...prev, minArea: range[0], maxArea: range[1] }
            notifyParent(newFilters)
            return newFilters
          })
        }}
        selectedBeds={selectedBeds}
        selectedBaths={selectedBaths}
        onBedClick={handleBedClick}
        onBathClick={handleBathClick}
        onReset={handleResetAll}
        properties={properties}
      />
    </div>
  )
}

// Memoize with custom comparison - never re-render from parent props changes
export const PropertyFilters = memo(PropertyFiltersComponent, () => true)
