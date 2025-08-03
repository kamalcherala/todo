# auth.py
from flask import Blueprint, request, jsonify, current_app
import os, jwt
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def generate_jwt(user):
    payload = {
        "email": user.email,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").lower()
    password = data.get("password", "") 
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    User.create_with_password(email, password)
    return jsonify({"message": "Registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").lower()
    password = data.get("password", "")
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = generate_jwt(user)
    return jsonify({"token": token}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    # With JWTs we typically just drop the token client-side
    return jsonify({"message": "Logged out"}), 200

@auth_bp.route("/google", methods=["POST"])
def google_auth():
    try:
        data = request.get_json() or {}
        token = data.get("credential")
        if not token:
            return jsonify({"error": "Missing credential"}), 400

        idinfo = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
        email = idinfo["email"].lower()

        # find or create a user record
        User.get_or_create_google(email)
        jwt_token = generate_jwt(email)
        return jsonify({"token": jwt_token, "email": email}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401
