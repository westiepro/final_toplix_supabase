'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { X, Filter, Home, Building2, Building, Warehouse, Waves, Car } from 'lucide-react'
import { PropertyType, Property } from '@/types/property'
import { FilterState } from '@/components/property-filters'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  filteredCount: number
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  areaRange: [number, number]
  onAreaRangeChange: (range: [number, number]) => void
  selectedBeds: number[]
  selectedBaths: number[]
  onBedClick: (value: number | 'studio' | 'any') => void
  onBathClick: (value: number | 'any') => void
  onReset: () => void
  properties?: Property[]
}

const propertyTypeIcons: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  house: Home,
  apartment: Building2,
  condo: Building,
  townhouse: Building,
  villa: Home,
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filteredCount,
  priceRange,
  onPriceRangeChange,
  areaRange,
  onAreaRangeChange,
  selectedBeds,
  selectedBaths,
  onBedClick,
  onBathClick,
  onReset,
  properties = [],
}: FilterSidebarProps) {
  const [priceMinInput, setPriceMinInput] = useState<string>('')
  const [priceMaxInput, setPriceMaxInput] = useState<string>('')
  const [areaMinInput, setAreaMinInput] = useState<string>('')
  const [areaMaxInput, setAreaMaxInput] = useState<string>('')

  // Calculate price histogram
  const histogramData = useMemo(() => {
    if (!properties || properties.length === 0) return []
    
    const minPrice = 0
    const maxPrice = 5000000
    const bucketCount = 20 // Number of bars in the histogram
    const bucketSize = (maxPrice - minPrice) / bucketCount
    
    const buckets = Array.from({ length: bucketCount }, () => 0)
    
    properties.forEach((property) => {
      const bucketIndex = Math.min(
        Math.floor((property.price - minPrice) / bucketSize),
        bucketCount - 1
      )
      if (bucketIndex >= 0) {
        buckets[bucketIndex]++
      }
    })
    
    const maxCount = Math.max(...buckets, 1) // Avoid division by zero
    
    return buckets.map((count, index) => {
      const bucketStart = minPrice + (index * bucketSize)
      const bucketEnd = minPrice + ((index + 1) * bucketSize)
      // Check if this bucket overlaps with the selected price range
      const isInRange = bucketStart < priceRange[1] && bucketEnd > priceRange[0]
      
      return {
        count,
        height: (count / maxCount) * 100, // Percentage height
        isInRange,
      }
    })
  }, [properties, priceRange])

  // Sync inputs with ranges
  useEffect(() => {
    setPriceMinInput(priceRange[0] === 0 ? '' : priceRange[0].toString())
    setPriceMaxInput(priceRange[1] === 2000000 ? '' : priceRange[1].toString())
  }, [priceRange])

  useEffect(() => {
    setAreaMinInput(areaRange[0] === 0 ? '' : areaRange[0].toString())
    setAreaMaxInput(areaRange[1] === 500 ? '' : areaRange[1].toString())
  }, [areaRange])

  const snapToStep = useCallback((value: number) => {
    if (value < 1000000) {
      return Math.round(value / 50000) * 50000
    } else {
      return Math.round((value - 1000000) / 100000) * 100000 + 1000000
    }
  }, [])

  const handlePriceChange = useCallback((values: number[]) => {
    const [min, max] = values
    const snappedMin = snapToStep(min)
    const snappedMax = snapToStep(max)
    onPriceRangeChange([snappedMin, snappedMax])
    setPriceMinInput(snappedMin === 0 ? '' : snappedMin.toString())
    setPriceMaxInput(snappedMax === 2000000 ? '' : snappedMax.toString())
  }, [snapToStep, onPriceRangeChange])

  const handlePriceMinInputChange = useCallback((value: string) => {
    setPriceMinInput(value)
    const numValue = parseInt(value) || 0
    const clampedValue = Math.max(0, Math.min(numValue, priceRange[1]))
    const snappedValue = snapToStep(clampedValue)
    onPriceRangeChange([snappedValue, priceRange[1]])
  }, [priceRange, snapToStep, onPriceRangeChange])

  const handlePriceMaxInputChange = useCallback((value: string) => {
    setPriceMaxInput(value)
    const numValue = parseInt(value) || 0
    const clampedValue = Math.max(priceRange[0], Math.min(numValue, 5000000))
    const snappedValue = snapToStep(clampedValue)
    onPriceRangeChange([priceRange[0], snappedValue])
  }, [priceRange, snapToStep, onPriceRangeChange])

  const handleAreaChange = useCallback((values: number[]) => {
    onAreaRangeChange([values[0], values[1]])
    setAreaMinInput(values[0] === 0 ? '' : values[0].toString())
    setAreaMaxInput(values[1] === 500 ? '' : values[1].toString())
  }, [onAreaRangeChange])

  const handlePropertyTypeChange = useCallback((type: PropertyType | 'all') => {
    onFiltersChange({ ...filters, propertyType: type })
  }, [filters, onFiltersChange])

  const handleFeatureToggle = useCallback((feature: 'pool' | 'garage') => {
    const currentFeatures = filters.features || []
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature]
    onFiltersChange({ ...filters, features: newFeatures })
  }, [filters, onFiltersChange])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[650px] sm:max-w-[650px] flex flex-col p-0 overflow-x-hidden">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 mt-6 space-y-8 pb-24">
          {/* Price */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Price</Label>
            
            {/* Histogram and Slider Container */}
            <div className="relative w-full mb-2">
              {/* Histogram */}
              <div className="relative w-full h-16 mb-2 flex items-end justify-between">
                {histogramData.map((bar, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-t-sm transition-all duration-200 hover:opacity-80 ${
                      bar.isInRange ? 'bg-blue-300' : 'bg-gray-300'
                    }`}
                    style={{
                      height: `${Math.max(bar.height, 2)}%`,
                      minHeight: '2px',
                      marginRight: index < histogramData.length - 1 ? '2px' : '0',
                    }}
                    title={`${bar.count} properties`}
                  />
                ))}
              </div>
              
              {/* Slider */}
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                min={0}
                max={5000000}
                step={50000}
                className="w-full mb-4 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-thumb]]:border-blue-500"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>€{priceRange[0].toLocaleString()}</span>
              <span>€{priceRange[1].toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={priceMinInput}
                onChange={(e) => handlePriceMinInputChange(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="2000000"
                value={priceMaxInput}
                onChange={(e) => handlePriceMaxInputChange(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Bed/Baths */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Beds</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Tap numbers to select
            </p>
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => onBedClick('any')}
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
                onClick={() => onBedClick('studio')}
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
                  onClick={() => onBedClick(num)}
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
                onClick={() => onBedClick(5)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${
                  selectedBeds.includes(5)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                5+
              </button>
            </div>

            <Label className="text-lg font-semibold mb-4 block">Baths</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onBathClick('any')}
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
                  onClick={() => onBathClick(num)}
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

          {/* Total Area */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Total Area m²</Label>
            <Slider
              value={areaRange}
              onValueChange={handleAreaChange}
              min={0}
              max={500}
              step={10}
              className="w-full mb-4 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-thumb]]:border-blue-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              <span>{areaRange[0]} m²</span>
              <span>{areaRange[1]} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={areaMinInput}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  handleAreaChange([value, areaRange[1]])
                }}
                className="flex-1"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="500"
                value={areaMaxInput}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  handleAreaChange([areaRange[0], value])
                }}
                className="flex-1"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Property Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handlePropertyTypeChange('all')}
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
                    onClick={() => handlePropertyTypeChange(type)}
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
          </div>

          {/* Features */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Features</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleFeatureToggle('pool')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors flex-1 ${
                  filters.features?.includes('pool')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Waves className="h-6 w-6 text-blue-600" />
                <span className="font-medium">Pool</span>
              </button>
              <button
                type="button"
                onClick={() => handleFeatureToggle('garage')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors flex-1 ${
                  filters.features?.includes('garage')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Car className={`h-6 w-6 ${filters.features?.includes('garage') ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="font-medium">Garage</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-background p-4 flex items-center justify-between gap-4 mt-auto">
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-blue-600 hover:text-blue-700"
          >
            Reset all
          </Button>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            See {filteredCount} {filteredCount === 1 ? 'home' : 'homes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

