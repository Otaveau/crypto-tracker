# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a cryptocurrency portfolio tracker built with Next.js 15, using the Pages Router architecture. The application allows users to track their cryptocurrency investments with real-time price data from CoinGecko API.

## Core Technologies
- **Framework**: Next.js 15 with Pages Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS 4.0
- **Data Fetching**: SWR for client-side data fetching
- **Charts**: Recharts for data visualization
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database operations (requires Prisma CLI)
npx prisma migrate dev      # Run migrations in development
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema changes to database
npx prisma studio           # Open Prisma Studio GUI

# Start PostgreSQL with Docker Compose
docker-compose up -d postgres
```

## Database Architecture

The application uses PostgreSQL with the following core entities:

- **User**: User accounts with email/password authentication
- **Portfolio**: Each user has portfolios to organize their holdings
- **PortfolioHolding**: Individual cryptocurrency positions with buy price tracking
- **Transaction**: BUY/SELL transactions for each holding
- **CryptoData**: Cached cryptocurrency market data

### Key Database Patterns
- All IDs use `cuid()` for better URL-safe identifiers
- Foreign key relationships use `onDelete: Cascade` for data integrity
- User registration automatically creates a default portfolio
- Transactions track both individual trades and aggregate holdings

## Application Structure

### Authentication Flow
- Custom credentials provider with bcrypt password hashing
- JWT-based sessions with 30-day expiration
- Session persistence across browser sessions
- User registration creates default portfolio automatically

### API Integration
- CoinGecko API for real-time cryptocurrency data
- Rate-limited API calls with error handling
- Price data cached in PostgreSQL for performance
- Search functionality for adding new cryptocurrencies

### Key Utilities

**Authentication helpers** (`src/lib/auth.ts`):
- `requireAuth()`: Middleware to protect API routes
- `getAuthSession()`: Get current user session
- `createUser()`: User registration with validation

**Crypto API service** (`src/lib/cryptoApi.ts`):
- `getTopCryptos()`: Fetch market leaders
- `getCurrentPrices()`: Batch price updates for portfolio
- `searchCryptos()`: Search for cryptocurrencies to add

## Environment Setup

The application requires these environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT signing secret
- `NEXTAUTH_URL`: Application base URL

## Development Database

Use Docker Compose for local PostgreSQL:
```bash
docker-compose up -d postgres
```

Database will be available at `localhost:5433` (note non-standard port to avoid conflicts).
Adminer web interface available at `localhost:8080` for database management.

## TypeScript Configuration

Path aliases configured:
- `@/*` maps to `./src/*`

Strict TypeScript enabled with NextAuth type extensions for user session management.

## Image Optimization

Next.js Image component configured for CoinGecko CDN domains:
- `assets.coingecko.com`
- `coin-images.coingecko.com`

## Testing Strategy

Currently no test framework configured. When adding tests, consider:
- Jest + React Testing Library for component tests
- Prisma test database setup
- API route testing patterns

## Performance Considerations

- SWR provides automatic caching and revalidation
- Prisma connection pooling for database efficiency  
- Next.js automatic code splitting and optimization
- Image optimization for cryptocurrency logos