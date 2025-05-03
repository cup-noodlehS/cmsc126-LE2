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
- Secure JWT-based user registration, login, and session management
- Protected routes with automatic redirection to login page for unauthenticated users
- Token persistence across browser sessions with refresh token capability
- User profile access and management
- Middleware for secure API request authentication
- Loading state management during authentication checks

### 💰 Transaction Management
- Create, view, edit, and delete financial transactions
- Detailed transaction recording with title, amount, date, type (income/expense), category, and description
- Transaction filtering by type, date range, and category
- Recent transactions display on dashboard for quick access
- Sortable transaction list with pagination support
- Transaction amount validation with minimum value checks
- Visual differentiation between income and expense entries
- Transaction search functionality

### 🗂 Category System
- Create and manage up to 20 custom categories per user
- Custom color selection with automatic text color contrast adjustment
- Category usage analytics (transaction count, total amounts)
- Category filtering in transactions and reports
- Ability to add new categories directly during transaction creation
- Color-coded category tags for visual identification in transaction lists
- Category-specific expense tracking and reporting
- Foreign key relationships ensuring data integrity

### 💵 Budget Management
- Total monthly budget allocation and tracking
- Category-specific budget allocation within total budget
- Budget progress visualization with color-coded status indicators
- Budget validation to prevent overspending across categories
- Real-time budget calculations showing allocated vs. remaining amounts
- Monthly budget summaries with total budget, total spent, and remaining balance
- Warning indicators for approaching or exceeding budget limits
- Budget tracking across multiple months and years
- Budget-to-actual expenditure comparison

### 📊 Dashboard & Visualization
- Real-time financial summary showing income, expenses, and balance
- Interactive pie chart displaying expenses by category with custom category colors
- Multi-month bar graph comparing income vs. expenses
- Recent transactions feed with category highlighting
- Responsive data visualization adapting to screen sizes
- Dynamic loading states during data fetching
- Error handling and retry capabilities
- Summary cards with key financial metrics

### 📈 Reports & Analytics
- Comprehensive financial reporting by month and category
- Monthly trends analysis with percentage change indicators
- Savings rate calculation and display
- Interactive filtering by date range (up to 6 months) and category
- Detailed breakdowns of spending patterns
- Multiple visualization types (pie charts, bar graphs, line charts)
- Month-to-month comparison of financial performance
- Toggle between summary and detailed views

### 💱 Data Export
- CSV export functionality for financial data
- Customizable exports with filtering by month and category
- Export formatting for spreadsheet compatibility
- Comprehensive data inclusion (transactions, monthly summaries, category breakdowns)
- Automatic filename generation with date and filter information
- User-friendly export interface with progress indicators
- Error handling during export process

### 💡 UI/UX Features
- Responsive design for mobile, tablet, and desktop viewports
- Dark mode support throughout the application
- Loading states and indicators during data operations
- Form validation with helpful error messages
- Confirmation modals for destructive actions
- Consistent color coding for income (green) and expenses (red)
- Philippine Peso (₱) currency formatting
- User-friendly date selectors and filters
- Accessible form controls and interactive elements
- Intuitive navigation between related sections


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