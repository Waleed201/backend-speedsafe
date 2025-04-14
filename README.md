# SpeedSafe Backend

This is the backend API for the SpeedSafe website, built with Node.js, Express, and MongoDB.

## Features

- RESTful API architecture
- JWT Authentication for admin panel
- Local file storage for product images and documents
- MongoDB database integration
- Product, service, and partner management
- Contact form submission handling

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/speedsafe
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

### Running the Server

For development:
```
npm run dev
```

For production:
```
npm start
```

### Creating Admin User

To create an initial admin user:
```
npm run seed
```

This will create an admin user with:
- Email: admin@speedsafe.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/users/login` - Admin login
- `POST /api/users` - Register a new admin (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)
- `DELETE /api/products/:id/images/:imageId` - Delete a product image (admin)
- `PUT /api/products/:id/images/:imageId/main` - Set main product image (admin)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact messages (admin)
- `GET /api/contact/:id` - Get a single contact message (admin)
- `PUT /api/contact/:id/read` - Mark contact as read (admin)
- `DELETE /api/contact/:id` - Delete a contact message (admin)

## File Upload

The system uses local storage for file uploads:
- Product images: `/uploads/products/`
- Catalogs: `/uploads/catalogs/`
- Partner logos: `/uploads/partners/`
- Service images: `/uploads/services/` 