# SpeedSafe API Testing with Postman

This guide will help you set up and use the Postman collection to test the SpeedSafe API endpoints.

## Setup Instructions

### 1. Import the Collection and Environment

1. Open Postman
2. Click on "Import" in the top left corner
3. Upload both files:
   - `speedsafe_postman_collection.json`
   - `speedsafe_postman_environment.json`
4. After importing, you should see:
   - A new collection called "SpeedSafe API Collection" in your Collections panel
   - A new environment called "SpeedSafe API Environment" in your Environments dropdown

### 2. Select the Environment

1. Select "SpeedSafe API Environment" from the environment dropdown in the top right corner of Postman
2. Make sure your backend server is running (default URL is set to `http://localhost:5001`)
3. If your server runs on a different URL/port, update the `baseUrl` variable in the environment settings

### 3. Prepare Test Files

For endpoints that require file uploads:

1. Create a folder named `test_files` on your local machine
2. Add the following sample files:
   - `product1.jpg` - A sample product image
   - `service1.jpg` - A sample service image
   - `partner1.jpg` - A sample partner logo
   - `sample_catalog.pdf` - A sample product catalog PDF
   - You can also prepare other document types for testing catalogs:
     - `sample_catalog.docx` - A sample Word document
     - `sample_catalog.pptx` - A sample PowerPoint presentation
     - `sample_catalog.xlsx` - A sample Excel spreadsheet

## Using the Collection

### Authentication Flow

1. Start by running the "Login" request in the Auth folder
   - This will automatically save the authentication token to your environment variables
   - All subsequent requests that require authentication will use this token

### Testing API Endpoints

The collection is organized into folders by entity type:

1. **Auth** - Login and authentication
2. **Users** - User profile and management
3. **Products** - Product CRUD operations and searches
4. **Product Catalogs** - Upload, download, and manage product catalogs
5. **Services** - Service CRUD operations
6. **Partners** - Partner CRUD operations
7. **Contact** - Contact form submission and management

### Catalog Features

The application now supports various catalog document types:

1. **Supported file types**: PDF, Word documents (.doc, .docx), PowerPoint presentations (.ppt, .pptx), and Excel spreadsheets (.xls, .xlsx)
2. **Catalog operations**:
   - Upload catalog files for products (admin only)
   - View catalog information
   - Download catalog files
   - Delete product catalogs (admin only)
   - List all products that have catalogs

To test catalog functionality:

1. First, make sure you have a product in the database
2. Use the "Upload Product Catalog" request to attach a catalog file
3. Use the "Get Product Catalog" request to verify the catalog was attached
4. Use the "Download Product Catalog" request to download the file

### Testing Features

1. **Test Full Product Creation**:
   - A special test endpoint is available that shows exactly how catalog files and product images are processed
   - Use the "Test Full Product Creation" request in the Products folder
   - This endpoint allows you to test uploading both product images and catalog files in a single request
   - It returns detailed information about how the files were processed
   - This is helpful for debugging and understanding the file handling process

### Special Features

1. **Variable Chaining**:
   - The collection has built-in test scripts that automatically extract and save IDs
   - When you run "Get All Products", it will save a product ID to use in subsequent requests
   - This makes it easy to test related endpoints without manually copying IDs

2. **Admin Operations**:
   - Many operations require admin privileges
   - Make sure to login with an admin account before attempting these operations

## Troubleshooting

1. **Authentication Issues**:
   - If you get "Not authorized" errors, run the Login request again
   - Check that the token is being properly saved in the environment variables

2. **File Upload Issues**:
   - Make sure you've created the test files with the correct names
   - Check that file paths in the requests correctly point to your test files
   - For catalog files, ensure they are valid documents of the supported types

3. **404 Not Found Errors**:
   - Verify that your server is running
   - Check that the `baseUrl` variable is correctly set in your environment

## Making Changes

Feel free to:
- Add more test cases
- Modify request bodies to test different scenarios
- Add pre-request scripts for more complex test flows
- Add additional environment variables as needed

## Contact

For issues or questions, please contact the SpeedSafe development team. 