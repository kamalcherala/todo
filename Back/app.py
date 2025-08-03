import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from passlib.hash import argon2
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS configuration - FIXED
CORS(app, origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"], 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Fallback to SQLite for development
    DATABASE_URL = 'sqlite:///todo.db'
    print("Warning: Using SQLite. Set DATABASE_URL for PostgreSQL")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# JWT configuration - FIXED
auth_secret = os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY') or 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = auth_secret
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'  # FIXED: Change from 'msg' to 'message'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False   # FIXED: Disable expiration for testing

jwt = JWTManager(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    google_id = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationship
    todos = db.relationship('Todo', backref='user', lazy=True, cascade='all, delete-orphan')

class Todo(db.Model):
    __tablename__ = 'todos'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    priority = db.Column(db.String(10), default='medium')
    category = db.Column(db.String(50), default='General')
    due_date = db.Column(db.DateTime)
    starred = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    completed_at = db.Column(db.DateTime)

# Initialize database
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

# FIXED: Mailgun email sender with proper error handling
def send_todo_email(user_email, todo_title):
    """Send email notification for new todo"""
    MAILGUN_DOMAIN = os.getenv('MAILGUN_DOMAIN')
    MAILGUN_API_KEY = os.getenv('MAILGUN_API_KEY')
    SENDER_EMAIL = os.getenv('SENDER_EMAIL')
    
    if not all([MAILGUN_DOMAIN, MAILGUN_API_KEY, SENDER_EMAIL]):
        print("Mailgun not configured - skipping email")
        return 200  # Return success to avoid breaking the flow
    
    try:
        url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"
        payload = {
            "from": f"Todo App <{SENDER_EMAIL}>",
            "to": [user_email],
            "subject": "New Todo Created",  # FIXED: Ensure this is always a string
            "text": f'Your new todo "{todo_title}" has been created successfully!'
        }

        print(f"Sending email via Mailgun:\nURL: {url}\nPayload: {payload}")

        response = requests.post(url, auth=("api", MAILGUN_API_KEY), data=payload, timeout=10)

        # Print detailed response for debugging
        print(f"Mailgun response [{response.status_code}]: {response.text}")

        # Return success only if Mailgun returns 200
        return response.status_code
    except Exception as e:
        print(f"Email error: {e}")
        return 500

# ADDED: Test endpoint for debugging
@app.route('/test', methods=['GET', 'POST', 'OPTIONS'])
def test_endpoint():
    print(f"Test endpoint called: {request.method}")
    print(f"Headers: {dict(request.headers)}")
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'message': 'Backend is working!', 'method': request.method}), 200

# Auth Routes
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        name = data.get('name', '').strip()

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Create new user
        password_hash = argon2.hash(password)
        user = User(email=email, password_hash=password_hash, name=name)
        db.session.add(user)
        db.session.commit()

        # Create token
        token = create_access_token(identity=str(user.id))
        
        print(f"User registered successfully: {email}")
        return jsonify({
            'message': 'User registered successfully', 
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 201

    except Exception as e:
        print(f"Registration error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user
        user = User.query.filter_by(email=email).first()
        if not user or not argon2.verify(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create token
        token = create_access_token(identity=str(user.id))
        
        print(f"User logged in successfully: {email}")
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        credential = request.json.get('credential')
        if not credential:
            return jsonify({'error': 'Missing credential'}), 400
            
        CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
        if not CLIENT_ID:
            return jsonify({'error': 'Google auth not configured'}), 500
            
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(credential, grequests.Request(), CLIENT_ID)
        email = idinfo.get('email', '').lower()
        name = idinfo.get('name', '')
        google_id = idinfo.get('sub')
        
        if not email:
            return jsonify({'error': 'Invalid Google token'}), 400

        # Find or create user
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, name=name, google_id=google_id)
            db.session.add(user)
            db.session.commit()
            print(f"New Google user created: {email}")
        else:
            print(f"Existing Google user logged in: {email}")

        # Create token
        token = create_access_token(identity=str(user.id))
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 200

    except Exception as e:
        print(f"Google auth error: {e}")
        return jsonify({'error': 'Google authentication failed'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    """Logout route - with JWTs we just return success, client handles token removal"""
    return jsonify({'message': 'Logged out successfully'}), 200

# User Profile Route
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()  # This will now be a string
        user = User.query.get(int(user_id))  # Convert back to int for DB query
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
        }), 200
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'error': 'Failed to get profile'}), 500

# Todo Routes
@app.route('/todos', methods=['GET', 'POST'])
@jwt_required()
def todos():
    try:
        user_id = get_jwt_identity()  # This will now be a string
        user = User.query.get(int(user_id))  # Convert back to int for DB query
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if request.method == 'POST':
            # ... rest of your POST logic
            todo = Todo(
                title=title,
                description=data.get('description', '').strip(),
                priority=data.get('priority', 'medium'),
                category=data.get('category', 'General'),
                due_date=data.get('dueDate'),
                user_id=int(user_id)  # Convert to int for DB
            )
            
            db.session.add(todo)
            db.session.commit()
            
            # Send email notification
            email_result = send_todo_email(user.email, todo.title)
            print(f"Email sending result: {email_result}")
            
            print(f"Todo created successfully: {todo.title} for user {user.email}")
            
            return jsonify({
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'completed': todo.completed,
                'priority': todo.priority,
                'category': todo.category,
                'due_date': todo.due_date.isoformat() if todo.due_date else None,
                'starred': todo.starred,
                'created_at': todo.created_at.isoformat() if todo.created_at else None
            }), 201

        else:  # GET request
            todos = Todo.query.filter_by(user_id=int(user_id)).order_by(Todo.created_at.desc()).all()
            return jsonify([{
                'id': t.id,
                'title': t.title,
                'description': t.description,
                'completed': t.completed,
                'priority': t.priority,
                'category': t.category,
                'due_date': t.due_date.isoformat() if t.due_date else None,
                'starred': t.starred,
                'created_at': t.created_at.isoformat() if t.created_at else None,
                'completed_at': t.completed_at.isoformat() if t.completed_at else None
            } for t in todos]), 200

    
    except Exception as e:
        print(f"Todos error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to process todos'}), 500

@app.route('/todos/<int:todo_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modify_todo(todo_id):
    try:
        user_id = get_jwt_identity()  # This will now be a string
        todo = Todo.query.filter_by(id=todo_id, user_id=int(user_id)).first()
        
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404

        if request.method == 'PUT':
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Update todo fields
            if 'title' in data:
                todo.title = data['title'].strip()
            if 'description' in data:
                todo.description = data['description'].strip()
            if 'completed' in data:
                todo.completed = bool(data['completed'])
                if todo.completed and not todo.completed_at:
                    todo.completed_at = db.func.now()
                elif not todo.completed:
                    todo.completed_at = None
            if 'priority' in data:
                todo.priority = data['priority']
            if 'category' in data:
                todo.category = data['category']
            if 'starred' in data:
                todo.starred = bool(data['starred'])
            if 'due_date' in data:
                todo.due_date = data['due_date']

            db.session.commit()
            print(f"Todo updated successfully: {todo.title}")
            
            return jsonify({
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'completed': todo.completed,
                'priority': todo.priority,
                'category': todo.category,
                'due_date': todo.due_date.isoformat() if todo.due_date else None,
                'starred': todo.starred,
                'created_at': todo.created_at.isoformat() if todo.created_at else None,
                'completed_at': todo.completed_at.isoformat() if todo.completed_at else None
            }), 200

        else:  # DELETE request
            db.session.delete(todo)
            db.session.commit()
            print(f"Todo deleted successfully: {todo.title}")
            
            return jsonify({'message': 'Todo deleted successfully'}), 200

    except Exception as e:
        print(f"Modify todo error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to modify todo'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Health check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Todo API is running'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting Flask app on port {port}")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
