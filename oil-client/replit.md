#  Beauty E-commerce Application

## Overview

This is a full-stack e-commerce application for the beauty brand "". The application features a modern, responsive interface for browsing and purchasing beauty products including skincare, haircare, makeup, and body care items. It's built with React on the frontend and Express.js on the backend, with TypeScript throughout for type safety.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom beauty theme variables
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints for products and categories
- **Development Server**: Custom Vite integration for hot reloading in development
- **Data Layer**: Abstract storage interface with in-memory implementation for development

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Shared schema definitions between client and server
- **Validation**: Zod schemas for runtime type validation
- **Database Provider**: Configured for Neon Database (PostgreSQL)

## Key Components

### Product Management
- Product catalog with categories (skincare, haircare, makeup, bodycare)
- Product variants, ingredients, benefits, and usage instructions
- Featured products, bestsellers, and new launches
- Product ratings and reviews system
- Inventory tracking and stock status

### UI/UX Features
- Responsive design optimized for mobile and desktop
- Interactive product cards with ratings and badges
- Hero banners with promotional content
- Category browsing with filtering capabilities
- Product detail pages with comprehensive information
- Search functionality (UI ready, backend integration pending)

### Navigation & Layout
- Sticky header with search and cart functionality
- Mobile-responsive navigation with sheet overlay
- Breadcrumb navigation for better UX
- Footer with company information and links

## Data Flow

1. **Product Data**: Server provides product and category data through REST API endpoints
2. **Client Queries**: React Query manages API calls, caching, and state synchronization
3. **Component Updates**: Components reactively update based on query state changes
4. **User Interactions**: Navigation handled by Wouter router, forms managed by React Hook Form

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **drizzle-orm**: Type-safe database queries
- **wouter**: Lightweight React router
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development
- Vite development server with hot module replacement
- Express backend with automatic restarts via tsx
- Integrated frontend and backend serving through custom Vite middleware

### Production Build
1. Frontend built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Static assets served by Express in production
4. Environment-based configuration for database connections

### Database Migration
- Drizzle Kit configured for schema migrations
- PostgreSQL dialect with environment-based connection strings
- Migration files generated in `./migrations` directory

## Changelog
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.