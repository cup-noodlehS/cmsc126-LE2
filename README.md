# cmsc126-LE2

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python (v3.8 or higher)
- pip

## Links
- [DB Model](https://lucid.app/lucidchart/5ab4801f-b1ce-4743-b0e5-b6d24caae0aa/edit?viewport_loc=-1087%2C942%2C1345%2C1023%2C0_0&invitationId=inv_652a4829-a71a-4cbb-bdb8-cd4eb45aadfa)

The frontend is built with Next.js and the backend uses Django.


## Setup
This project requires running both a frontend and backend server. You'll need two terminal windows open to run both simultaneously.

### Frontend Setup
1. Navigate to the client directory and install dependencies:
    ```
    cd client
    npm install
    ```

1. Start the Next.js development server:
    ```
    npm run dev
    ```
    > This will launch the frontend at http://localhost:3000 by default.

    > Note: If the backend server isn't running on port 8000, update `API_URL` in `/client/.env`.

### Backend Setup
1. Navigate to the server directory:
    ```
    cd server
    ```

1. Setup venv
    For Mac/Linux:
    ```
    python3 -m venv venv
    ```
    
    For Windows:
    ```
    python -m venv venv
    ```

1. Activate the Python virtual environment:

    For Mac:
    ```
    source venv/bin/activate
    ```

    For Windows:
    ```
    venv\Scripts\activate
    ```

1. Install dependencies
    ```
    pip install -r requirements.txt
    ```

1. Start the Django development server:
    ```
    python src/manage.py runserver
    ```
    > This will start the backend API server at http://localhost:8000.



## ✅ Feature List

### 🔐 User Authentication
- Secure register, login, and logout functionality
- JWT-based authentication with token persistence
- Protected routes for authenticated users
- User-specific data access and management

### 💰 Transaction Management
- Create, view, edit, and delete income/expense entries
- Comprehensive transaction details: title, amount, date, type, notes
- Advanced filtering, sorting, and search capabilities
- Pagination for better performance with large datasets

### 🗂 Category System
- Dynamic category creation with custom colors
- Automatic text color contrast adjustment for readability
- Interactive category management interface
- Up to 20 categories per user with usage statistics
- Color-coded transaction display

### 💵 Budget Management
- Total budget allocation with remaining balance tracking
- Category-specific budget allocation within total budget
- Visual budget progress bars with warning indicators
- Budget validation to prevent overspending
- Monthly budget tracking and analysis

### 📊 Dashboard & Visualization
- Interactive pie chart displaying expenses by category
- Multi-month bar graph comparing income vs. expenses
- Real-time financial summary with key metrics
- Recent transactions feed with quick access
- Dynamic date range selection

### 📈 Reports & Analytics
- Comprehensive financial reporting interface
- Interactive filtering by date range and categories
- Multiple chart types for different analytical perspectives
- Detailed spending analysis by category and time period
- Monthly comparison views

### 💱 Data Export
- CSV export functionality with customizable filters
- Export transactions, categories, or budget data
- Filter exports by date range, category, or transaction type

### 💡 UI/UX Features
- Responsive layout for all device sizes
- Persistent sidebar navigation
- Confirmation modals for destructive actions
- Consistent design system


## Testing
### Login credentials
> User with mock data
```
username: jace
password: 123
```

## Division of Labor

### Sheldon (cup-noodlehS)
- Backend Development
    - Established Django project structure with authentication system
    - Designed and implemented comprehensive database models and tests
    - Created RESTful API endpoints with serializers and validation
    - Built reusable generic API views for standardized CRUD operations
    - Implemented search functionality and performance optimizations
    - Set up admin interface for data management
    - Created mock data generation scripts for testing
- Frontend Integration
    - Implemented JWT-based authentication flow with token persistence
    - Architected global state management using Zustand
    - Built transaction management interface with pagination
    - Developed dynamic dashboard with real-time data visualization
    - Created category management system with dynamic color generation
    - Set up Axios for API communication
    - Created TypeScript interfaces for type safety

### Anton (Panxi793)
- Budget Management System
    - Designed and implemented comprehensive budget tracking functionality
    - Created interactive budget progress bars with visual indicators
    - Implemented category-specific budget allocations
    - Added budget validation to prevent overspending
    - Built budget management UI with forms and summary sections
- Reports & Analytics
    - Developed advanced reporting system with interactive charts
    - Created CSV export functionality with filtering options
    - Implemented date range and category filtering for reports
    - Added detailed financial insights and visualizations
    - Improved UI/UX for the reports page with tabs and better styling

### Jourdan (jourdancatarina3)
- Frontend & UI Development
    - Created transaction management interface with filtering
    - Implemented category management system with color contrast adjustment
    - Built budget page with real-time transaction integration
    - Added confirmation modals for destructive actions
    - Implemented responsive sidebar navigation
    - Created category usage statistics display
- Feature Integration
    - Connected budget tracking with transaction system
    - Implemented remaining budget calculations and validations
    - Added category-specific budget validation
    - Integrated transaction data with budget tracking system
    - Converted currency display to Philippine Peso (₱)
    - Fixed authentication and state management issues