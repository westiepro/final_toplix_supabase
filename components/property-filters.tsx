'use client'

import { useState, useCallback, useRef, useEffect, memo } from 'react'
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
import { Search, Save, X } from 'lucide-react'
import { PropertyType } from '@/types/property'

interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  onCitySearch: (city: string) => void
  onSaveSearch?: () => void
}

export interface FilterState {
  city: string
  minPrice: number
  maxPrice: number
  propertyType: PropertyType | 'all'
  bedrooms: number | 'all'
  bathrooms: number | 'all'
  minArea: number
  maxArea: number
}

const defaultFilters: FilterState = {
  city: '',
  minPrice: 0,
  maxPrice: 5000000,
  propertyType: 'all',
  bedrooms: 'all',
  bathrooms: 'all',
  minArea: 0,
  maxArea: 10000,
}

function PropertyFiltersComponent({
  onFiltersChange,
  onCitySearch,
  onSaveSearch,
}: PropertyFiltersProps) {
  // Internal state - completely independent
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [priceRange, setPriceRange] = useState([defaultFilters.minPrice, defaultFilters.maxPrice])
  const [areaRange, setAreaRange] = useState([defaultFilters.minArea, defaultFilters.maxArea])
  
  // Store callbacks in refs so they never cause re-renders
  const onFiltersChangeRef = useRef(onFiltersChange)
  const onCitySearchRef = useRef(onCitySearch)
  const onSaveSearchRef = useRef(onSaveSearch)
  
  // Debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastNotifiedRef = useRef<string>('')
  
  // Update refs when callbacks change (but don't cause re-render)
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
    onCitySearchRef.current = onCitySearch
    onSaveSearchRef.current = onSaveSearch
  }, [onFiltersChange, onCitySearch, onSaveSearch])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
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
  
  // Handlers - all use refs to prevent re-renders
  const handleCityChange = useCallback((value: string) => {
    setFilters((prev) => {
      if (prev.city === value) return prev
      const newFilters = { ...prev, city: value }
      // Immediate city search for map navigation
      if (value) {
        onCitySearchRef.current(value)
      }
      // Debounced filter update
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])
  
  const handlePriceChange = useCallback((values: number[]) => {
    setPriceRange(values)
    setFilters((prev) => {
      if (prev.minPrice === values[0] && prev.maxPrice === values[1]) return prev
      const newFilters = { ...prev, minPrice: values[0], maxPrice: values[1] }
      notifyParent(newFilters)
      return newFilters
    })
  }, [notifyParent])
  
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
  
  const clearFilters = useCallback(() => {
    const cleared = defaultFilters
    setFilters(cleared)
    setPriceRange([0, 5000000])
    setAreaRange([0, 10000])
    lastNotifiedRef.current = ''
    notifyParent(cleared)
  }, [notifyParent])
  
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* City Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for city"
                value={filters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Price Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-between">
                Price: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  min={0}
                  max={5000000}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Property Type */}
          <Select
            value={filters.propertyType}
            onValueChange={handlePropertyTypeChange}
          >
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
            </SelectContent>
          </Select>

          {/* Bedrooms */}
          <Select
            value={filters.bedrooms.toString()}
            onValueChange={handleBedroomsChange}
          >
            <SelectTrigger className="min-w-[120px]">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Beds</SelectItem>
              <SelectItem value="1">1+ Bed</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
              <SelectItem value="5">5+ Beds</SelectItem>
            </SelectContent>
          </Select>

          {/* Bathrooms */}
          <Select
            value={filters.bathrooms.toString()}
            onValueChange={handleBathroomsChange}
          >
            <SelectTrigger className="min-w-[120px]">
              <SelectValue placeholder="Bathrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Baths</SelectItem>
              <SelectItem value="1">1+ Bath</SelectItem>
              <SelectItem value="2">2+ Baths</SelectItem>
              <SelectItem value="3">3+ Baths</SelectItem>
              <SelectItem value="4">4+ Baths</SelectItem>
            </SelectContent>
          </Select>

          {/* Total Area */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-between">
                Area: {areaRange[0]} - {areaRange[1]} sqft
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <Label>Total Area (sqft)</Label>
                <Slider
                  value={areaRange}
                  onValueChange={handleAreaChange}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{areaRange[0]} sqft</span>
                  <span>{areaRange[1]} sqft</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Save Search */}
          {onSaveSearch && (
            <Button 
              onClick={() => onSaveSearchRef.current?.()} 
              variant="outline" 
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Search</span>
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
    </div>
  )
}

// Memoize with custom comparison - never re-render from parent props changes
export const PropertyFilters = memo(PropertyFiltersComponent, () => true)
