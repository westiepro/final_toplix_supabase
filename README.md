# Toplix - Property Listing Portal

A modern property listing portal built with Next.js, featuring interactive maps, advanced filtering, and comprehensive dashboards for users, agents, and administrators.

## Features

### 🏠 Property Listings
- **Buy & Rent Pages**: Separate pages for buying and renting properties
- **Interactive Mapbox Integration**: 
  - City search with automatic map navigation
  - Property markers with clickable popups
  - Viewport-based property filtering
  - Real-time property display based on map bounds

### 🔍 Advanced Filtering
- City search with geocoding
- Price range slider
- Property type selection
- Bedrooms/Bathrooms filters
- Total area range slider
- Save search functionality

### 📱 Responsive Design
- Fully mobile-optimized
- Responsive two-column layout (cards + map)
- Mobile-friendly filter interface
- Touch-optimized interactions

### 👥 User Dashboards

#### User Dashboard
- Favorites management
- Recently viewed properties
- Saved searches

#### Agent Dashboard
- Property management (CRUD operations)
- Add/Edit/Delete properties
- Company property listings

#### Admin Panel
- Manage real estate companies
- Manage site users
- User role management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Maps**: Mapbox GL
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Mapbox account (for map functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-js-toplix-final
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
next-js-toplix-final/
├── app/
│   ├── buy/              # Buy properties page
│   ├── rent/             # Rent properties page
│   ├── dashboard/
│   │   ├── user/         # User dashboard
│   │   ├── agent/        # Agent dashboard
│   │   └── admin/        # Admin panel
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects to /buy)
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Main navigation
│   ├── property-filters.tsx  # Filter component
│   ├── property-card.tsx     # Property card component
│   └── property-map.tsx      # Mapbox integration
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
└── types/
    └── property.ts       # TypeScript types
```

## Database Schema

The application uses the following main entities:

- **Properties**: Property listings with location, pricing, and details
- **Users**: Site users with roles (user, agent, admin)
- **Companies**: Real estate companies
- **Favorites**: User favorite properties
- **Recently Viewed**: User viewing history
- **Saved Searches**: User saved search filters

## Features in Detail

### Map Integration
- Uses Mapbox GL for interactive maps
- Geocoding API for city search
- Marker clustering for better performance
- Popup cards with property details
- Viewport-based filtering

### Filtering System
- Real-time filter updates
- Multiple filter combinations
- Price and area range sliders
- Dropdown selectors for property types and amenities

### Mobile Optimization
- Responsive breakpoints
- Touch-friendly controls
- Stacked layout on mobile
- Optimized map viewport

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

## Development

### Adding New Components

The project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### TypeScript

The project is fully typed. Types are defined in the `types/` directory.

## Testing

Currently using mock data for development. To connect to Supabase:

1. Set up your Supabase project
2. Create the database tables
3. Update the queries in the page components to use Supabase client

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
