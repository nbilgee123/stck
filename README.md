# Simply Wall St Demo - Mongolian Stock Portfolio App

A "Simply Wall St"-style portfolio application for analyzing Mongolian stocks with Snowflake visualization charts.

## Features

- 🔐 **Admin Authentication**: Secure login system with role-based access control
- 📊 **CSV Import**: Import company financial data from CSV files (Admin only)
- 🏢 **Company Analysis**: View detailed company information and financial metrics
- 📈 **Snowflake Charts**: Interactive radar charts showing 5 key performance metrics
- 💼 **Portfolio Management**: Add/remove companies to/from your portfolio
- 👨‍💼 **Admin Panel**: Comprehensive admin dashboard with statistics and company management
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Key Metrics Analyzed

1. **Valuation** - Based on debt-to-equity ratio and financial stability
2. **Future Growth** - Calculated from revenue growth trends
3. **Past Performance** - Based on profit margins and historical performance
4. **Financial Health** - Current ratio and debt management
5. **Dividend Quality** - Dividend yield and consistency

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLite** - Lightweight database
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - JavaScript UI library
- **Recharts** - Chart library for Snowflake visualization
- **Axios** - HTTP client for API calls

## Setup Instructions

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## CSV Format

Your CSV file should contain the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Company | Company name | Mongol Mining |
| Ticker | Stock symbol | MGLM |
| Sector | Business sector | Mining |
| Year | Financial year | 2024 |
| Revenue | Annual revenue | 100000000 |
| Profit | Annual profit | 20000000 |
| Assets | Total assets | 50000000 |
| Liabilities | Total liabilities | 10000000 |
| Dividends | Dividend payments | 2000000 |

## Sample Data

A sample CSV file with Mongolian companies is included in the `sample_data/` directory. You can use this to test the application.

## API Endpoints

### Authentication
- `POST /login` - Admin login
- `POST /logout` - Logout
- `GET /auth/status` - Check authentication status

### Company Management
- `GET /companies` - Get list of all companies
- `GET /company/<id>` - Get detailed company information
- `POST /import_csv` - Import CSV file with company data (Admin only)
- `DELETE /admin/companies` - Delete company and all its data (Admin only)

### Portfolio Management
- `GET /portfolio` - Get user's portfolio
- `POST /portfolio` - Add company to portfolio
- `DELETE /portfolio/<id>` - Remove company from portfolio

### Admin Panel
- `GET /admin/stats` - Get system statistics (Admin only)

## Usage

### For Regular Users
1. **Browse Companies**: View all companies in the "Companies" tab
2. **Analyze**: Click "View Details" to see Snowflake charts and metrics
3. **Build Portfolio**: Add companies to your portfolio for tracking
4. **Monitor**: View your portfolio in the "Portfolio" tab

### For Admin Users
1. **Login**: Use admin credentials to access admin panel
2. **Import Data**: Upload CSV files with company financial data
3. **Manage Companies**: View statistics and delete companies if needed
4. **Monitor System**: Check system statistics and sector distribution
5. **User Management**: Control access to CSV import functionality

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default admin password in production!

## Development

### Project Structure
```
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── swst_demo.db       # SQLite database (created on first run)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main application
│   │   └── index.js       # Entry point
│   └── package.json       # Node.js dependencies
├── sample_data/
│   └── mongolian_companies.csv  # Sample data
└── README.md
```

### Adding New Features

1. **Backend**: Add new endpoints in `backend/app.py`
2. **Frontend**: Create new components in `frontend/src/components/`
3. **Database**: Modify the database schema in the `init_db()` function

## Future Enhancements

- 📊 Multiple portfolio support
- 🔔 Price alerts and notifications
- 📈 Historical price tracking
- 🎯 Watchlist functionality
- 📱 Mobile app version
- 🔐 User authentication
- 📊 Advanced analytics and reporting

## License

This project is for demonstration purposes. Feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please create an issue in the repository.
