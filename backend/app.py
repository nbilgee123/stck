from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import csv
import os
from datetime import datetime
import json
import hashlib
import secrets

app = Flask(__name__)
# CORS settings for development and production
CORS(app, origins=[
    'http://localhost:3000',  # Development
    'https://mongolian-stocks-frontend.onrender.com',  # Production frontend URL
    'https://stck-frontend.onrender.com'  # Alternative frontend URL
], supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')

DB = "swst_demo.db"

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')  # Change this in production

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    
    # Create companies table
    c.execute('''
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            ticker TEXT UNIQUE NOT NULL,
            sector TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create financials table
    c.execute('''
        CREATE TABLE IF NOT EXISTS financials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER,
            year INTEGER,
            revenue REAL,
            profit REAL,
            assets REAL,
            liabilities REAL,
            dividends REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )
    ''')
    
    # Create portfolio table
    c.execute('''
        CREATE TABLE IF NOT EXISTS portfolio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER,
            shares INTEGER DEFAULT 1,
            purchase_price REAL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )
    ''')
    
    # Create users table for admin authentication
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create admin user if not exists
    admin_password_hash = hashlib.sha256(ADMIN_PASSWORD.encode()).hexdigest()
    c.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', (ADMIN_USERNAME, admin_password_hash, 'admin'))
    
    conn.commit()
    conn.close()

def is_admin():
    """Check if current user is admin"""
    return session.get('user_role') == 'admin'

def require_admin(f):
    """Decorator to require admin access"""
    def decorated_function(*args, **kwargs):
        if not is_admin():
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def calculate_metrics(company_id):
    """Calculate the 5 key metrics for a company"""
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    
    # Get financial data for the company
    c.execute('''
        SELECT year, revenue, profit, assets, liabilities, dividends
        FROM financials 
        WHERE company_id = ? 
        ORDER BY year DESC
    ''', (company_id,))
    
    financials = c.fetchall()
    conn.close()
    
    if not financials:
        return {
            "valuation": 0,
            "future_growth": 0,
            "past_performance": 0,
            "financial_health": 0,
            "dividend_quality": 0
        }
    
    # Calculate metrics based on financial data
    latest = financials[0]  # Most recent year
    previous = financials[1] if len(financials) > 1 else latest
    
    # 1. Valuation (P/E ratio simulation, debt-to-equity)
    debt_to_equity = latest[4] / (latest[2] - latest[4]) if (latest[2] - latest[4]) > 0 else 1
    valuation_score = max(0, min(100, 100 - (debt_to_equity * 20)))
    
    # 2. Future Growth (revenue growth rate)
    revenue_growth = ((latest[1] - previous[1]) / previous[1] * 100) if previous[1] > 0 else 0
    future_growth_score = max(0, min(100, 50 + revenue_growth))
    
    # 3. Past Performance (profit margin trend)
    profit_margin = (latest[2] / latest[1] * 100) if latest[1] > 0 else 0
    past_performance_score = max(0, min(100, profit_margin * 2))
    
    # 4. Financial Health (current ratio, debt ratio)
    current_ratio = latest[2] / latest[4] if latest[4] > 0 else 1
    financial_health_score = max(0, min(100, current_ratio * 20))
    
    # 5. Dividend Quality (dividend yield, consistency)
    dividend_yield = (latest[5] / latest[1] * 100) if latest[1] > 0 else 0
    dividend_quality_score = max(0, min(100, dividend_yield * 10))
    
    return {
        "valuation": round(valuation_score, 1),
        "future_growth": round(future_growth_score, 1),
        "past_performance": round(past_performance_score, 1),
        "financial_health": round(financial_health_score, 1),
        "dividend_quality": round(dividend_quality_score, 1)
    }

@app.route("/login", methods=["POST"])
def login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        # Check user credentials
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        c.execute('''
            SELECT id, username, role FROM users 
            WHERE username = ? AND password_hash = ?
        ''', (username, password_hash))
        
        user = c.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['user_role'] = user[2]
            
            return jsonify({
                "status": "success",
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "role": user[2]
                }
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    """Logout endpoint"""
    session.clear()
    return jsonify({"status": "success"}), 200

@app.route("/auth/status", methods=["GET"])
def auth_status():
    """Check authentication status"""
    if 'user_id' in session:
        return jsonify({
            "authenticated": True,
            "user": {
                "id": session['user_id'],
                "username": session['username'],
                "role": session['user_role']
            }
        }), 200
    else:
        return jsonify({"authenticated": False}), 200

@app.route("/import_csv", methods=["POST"])
@require_admin
def import_csv():
    """Import CSV file with company financial data"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read CSV content
        content = file.stream.read().decode("utf-8")
        reader = csv.DictReader(content.splitlines())
        
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        imported_count = 0
        
        for row in reader:
            try:
                # Insert or update company
                c.execute('''
                    INSERT OR REPLACE INTO companies (name, ticker, sector) 
                    VALUES (?, ?, ?)
                ''', (row['Company'], row['Ticker'], row['Sector']))
                
                # Get company ID
                c.execute("SELECT id FROM companies WHERE ticker = ?", (row['Ticker'],))
                company_id = c.fetchone()[0]
                
                # Insert financial data
                c.execute('''
                    INSERT INTO financials (company_id, year, revenue, profit, assets, liabilities, dividends)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    company_id,
                    int(row['Year']),
                    float(row['Revenue']),
                    float(row['Profit']),
                    float(row['Assets']),
                    float(row['Liabilities']),
                    float(row['Dividends'])
                ))
                
                imported_count += 1
                
            except Exception as e:
                print(f"Error importing row: {e}")
                continue
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "imported_count": imported_count
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/companies", methods=["GET"])
def get_companies():
    """Get list of all companies"""
    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        c.execute('''
            SELECT c.id, c.name, c.ticker, c.sector, 
                   f.year, f.revenue, f.profit, f.assets, f.liabilities, f.dividends
            FROM companies c
            LEFT JOIN financials f ON c.id = f.company_id
            WHERE f.year = (SELECT MAX(year) FROM financials WHERE company_id = c.id)
            ORDER BY c.name
        ''')
        
        companies = []
        for row in c.fetchall():
            companies.append({
                "id": row[0],
                "name": row[1],
                "ticker": row[2],
                "sector": row[3],
                "latest_year": row[4],
                "revenue": row[5],
                "profit": row[6],
                "assets": row[7],
                "liabilities": row[8],
                "dividends": row[9]
            })
        
        conn.close()
        return jsonify(companies), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/company/<int:company_id>", methods=["GET"])
def get_company_details(company_id):
    """Get detailed company information including Snowflake metrics"""
    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        # Get company basic info
        c.execute('SELECT id, name, ticker, sector FROM companies WHERE id = ?', (company_id,))
        company = c.fetchone()
        
        if not company:
            return jsonify({"error": "Company not found"}), 404
        
        # Get financial history
        c.execute('''
            SELECT year, revenue, profit, assets, liabilities, dividends
            FROM financials 
            WHERE company_id = ? 
            ORDER BY year DESC
        ''', (company_id,))
        
        financials = c.fetchall()
        
        # Calculate metrics
        metrics = calculate_metrics(company_id)
        
        # Format data for Snowflake chart
        snowflake_data = [
            {"metric": "Valuation", "value": metrics["valuation"]},
            {"metric": "Future Growth", "value": metrics["future_growth"]},
            {"metric": "Past Performance", "value": metrics["past_performance"]},
            {"metric": "Financial Health", "value": metrics["financial_health"]},
            {"metric": "Dividend Quality", "value": metrics["dividend_quality"]}
        ]
        
        conn.close()
        
        return jsonify({
            "id": company[0],
            "name": company[1],
            "ticker": company[2],
            "sector": company[3],
            "financials": [
                {
                    "year": row[0],
                    "revenue": row[1],
                    "profit": row[2],
                    "assets": row[3],
                    "liabilities": row[4],
                    "dividends": row[5]
                } for row in financials
            ],
            "metrics": metrics,
            "snowflake_data": snowflake_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/portfolio", methods=["GET"])
def get_portfolio():
    """Get user's portfolio"""
    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        c.execute('''
            SELECT p.id, p.shares, p.purchase_price, p.added_at,
                   c.id, c.name, c.ticker, c.sector
            FROM portfolio p
            JOIN companies c ON p.company_id = c.id
            ORDER BY p.added_at DESC
        ''')
        
        portfolio = []
        for row in c.fetchall():
            portfolio.append({
                "id": row[0],
                "shares": row[1],
                "purchase_price": row[2],
                "added_at": row[3],
                "company": {
                    "id": row[4],
                    "name": row[5],
                    "ticker": row[6],
                    "sector": row[7]
                }
            })
        
        conn.close()
        return jsonify(portfolio), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/portfolio", methods=["POST"])
def add_to_portfolio():
    """Add company to portfolio"""
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        shares = data.get('shares', 1)
        purchase_price = data.get('purchase_price', 0)
        
        if not company_id:
            return jsonify({"error": "Company ID is required"}), 400
        
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        # Check if company already in portfolio
        c.execute('SELECT id FROM portfolio WHERE company_id = ?', (company_id,))
        if c.fetchone():
            return jsonify({"error": "Company already in portfolio"}), 400
        
        # Add to portfolio
        c.execute('''
            INSERT INTO portfolio (company_id, shares, purchase_price)
            VALUES (?, ?, ?)
        ''', (company_id, shares, purchase_price))
        
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/portfolio/<int:portfolio_id>", methods=["DELETE"])
def remove_from_portfolio(portfolio_id):
    """Remove company from portfolio"""
    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        c.execute('DELETE FROM portfolio WHERE id = ?', (portfolio_id,))
        
        if c.rowcount == 0:
            return jsonify({"error": "Portfolio item not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    """Get admin dashboard statistics"""
    try:
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        # Get company count
        c.execute('SELECT COUNT(*) FROM companies')
        company_count = c.fetchone()[0]
        
        # Get financial records count
        c.execute('SELECT COUNT(*) FROM financials')
        financial_count = c.fetchone()[0]
        
        # Get portfolio count
        c.execute('SELECT COUNT(*) FROM portfolio')
        portfolio_count = c.fetchone()[0]
        
        # Get recent imports (last 7 days)
        c.execute('''
            SELECT COUNT(*) FROM companies 
            WHERE created_at >= datetime('now', '-7 days')
        ''')
        recent_imports = c.fetchone()[0]
        
        # Get companies by sector
        c.execute('''
            SELECT sector, COUNT(*) as count 
            FROM companies 
            GROUP BY sector 
            ORDER BY count DESC
        ''')
        sector_stats = [{"sector": row[0], "count": row[1]} for row in c.fetchall()]
        
        conn.close()
        
        return jsonify({
            "company_count": company_count,
            "financial_count": financial_count,
            "portfolio_count": portfolio_count,
            "recent_imports": recent_imports,
            "sector_stats": sector_stats
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admin/companies", methods=["DELETE"])
@require_admin
def admin_delete_company():
    """Delete a company and all its data"""
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        
        if not company_id:
            return jsonify({"error": "Company ID required"}), 400
        
        conn = sqlite3.connect(DB)
        c = conn.cursor()
        
        # Delete from portfolio first (foreign key constraint)
        c.execute('DELETE FROM portfolio WHERE company_id = ?', (company_id,))
        
        # Delete financial records
        c.execute('DELETE FROM financials WHERE company_id = ?', (company_id,))
        
        # Delete company
        c.execute('DELETE FROM companies WHERE id = ?', (company_id,))
        
        if c.rowcount == 0:
            return jsonify({"error": "Company not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
