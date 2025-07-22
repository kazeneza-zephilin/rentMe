# RentMe - Rental Marketplace Platform

A full-stack rental marketplace application where users can rent items from electronics to sports equipment.

## Tech Stack

### Backend

-   **Node.js** with Express.js
-   **Prisma** ORM with PostgreSQL
-   **Clerk** for authentication
-   **Multer** for file uploads
-   **Express Rate Limiting** for API protection

### Frontend

-   **React** with Vite
-   **Tailwind CSS** for styling
-   **ShadCN UI** components
-   **GSAP** for animations
-   **Clerk React SDK** for authentication
-   **React Query** for data fetching
-   **React Router** for navigation

## Features

-   User authentication with Clerk
-   Browse and search listings
-   Create and manage listings
-   Booking system
-   Review and rating system
-   Responsive design with animations
-   Protected routes and API endpoints

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   PostgreSQL database
-   Clerk account for authentication

### Backend Setup

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your database URL and Clerk credentials.

4. Set up the database:

    ```bash
    npm run db:generate
    npm run db:push
    npm run db:seed
    ```

5. Start the development server:
    ```bash
    npm run dev
    ```

The backend will be running at http://localhost:3001

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your Clerk publishable key.

4. Start the development server:
    ```bash
    npm run dev
    ```

The frontend will be running at http://localhost:3000

## Database Schema

The application uses the following main models:

-   **User**: User profiles synced with Clerk
-   **Listing**: Items available for rent
-   **Booking**: Rental bookings between users
-   **Review**: User reviews and ratings

## API Endpoints

### Authentication

-   `POST /api/auth/webhooks/clerk` - Clerk webhook for user sync

### Users

-   `GET /api/users/profile` - Get current user profile
-   `PUT /api/users/profile` - Update user profile
-   `GET /api/users/:id` - Get user by ID

### Listings

-   `GET /api/listings` - Get all listings (with search/filters)
-   `GET /api/listings/:id` - Get single listing
-   `POST /api/listings` - Create new listing
-   `PUT /api/listings/:id` - Update listing
-   `DELETE /api/listings/:id` - Delete listing

### Bookings

-   `GET /api/bookings` - Get user's bookings
-   `GET /api/bookings/received` - Get bookings for user's listings
-   `POST /api/bookings` - Create new booking
-   `PATCH /api/bookings/:id/status` - Update booking status
-   `GET /api/bookings/:id` - Get single booking

### Reviews

-   `GET /api/reviews/listing/:listingId` - Get reviews for listing
-   `POST /api/reviews` - Create new review
-   `PUT /api/reviews/:id` - Update review
-   `DELETE /api/reviews/:id` - Delete review
-   `GET /api/reviews/user` - Get user's reviews

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://username:password@localhost:5432/rentme_db
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3001/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
