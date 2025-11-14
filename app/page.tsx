import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home as HomeIcon, Search } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
          alt="Beautiful home"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/20 p-4 backdrop-blur-sm">
            <HomeIcon className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Find Your Home
        </h1>
        
        <p className="mb-8 text-lg text-white/90 sm:text-xl md:text-2xl">
          Discover your perfect property with Toplix. Browse thousands of homes for sale and rent.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-14 text-lg shadow-lg transition-all hover:scale-105"
          >
            <Link href="/buy" className="gap-2">
              <Search className="h-5 w-5" />
              Browse Properties
            </Link>
          </Button>
          
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 border-2 border-white/30 bg-white/10 text-lg text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
          >
            <Link href="/rent" className="gap-2">
              Find Rentals
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">Buy</h3>
            <p className="text-white/80">
              Explore properties for sale with detailed listings and virtual tours
            </p>
          </div>
          
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">Rent</h3>
            <p className="text-white/80">
              Find your next rental with flexible lease options and great locations
            </p>
          </div>
          
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">Explore</h3>
            <p className="text-white/80">
              Use our interactive map to discover properties in your preferred area
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
