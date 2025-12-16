from flask import Blueprint, request, jsonify
from databse.db import user_collection
from databse.userschema import Signup, LoginUser
from werkzeug.security import generate_password_hash,check_password_hash
auth_bp=Blueprint('auth', __name__)
from flask_jwt_extended import create_access_token

@auth_bp.route('/signin', methods=['POST'])
def signin():
    try:
        data = LoginUser(**request.get_json())
        user = user_collection.find_one({"email": data.email})
        if not user:
            return jsonify({"message": "Invalid credentials"}), 401
        if not check_password_hash(user["password"], data.password):
            return jsonify({"message": "Invalid credentials"}), 401

        token = create_access_token(identity=str(user["_id"]))

        return jsonify({
            "message": "Sign-in successful",
            "access_token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user["name"]
            }
        }), 200

    except Exception as e:
        return jsonify({"message": "Invalid data", "error": str(e)}), 400

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = Signup(**request.get_json())
        user={
            "name":data.name,
            "email":data.email,
            "password":generate_password_hash(data.password)
        }
        if user_collection.find_one({"email":user['email']}):
            return jsonify({'message':'User already exists'}),409
        result=user_collection.insert_one(user)
        user_response={
            "id":str(result.inserted_id),
            "name":user['name'],
            "email":user['email']
        }
        return jsonify({'message':'User created successfully',
                        "user":user_response}),201
    except Exception as e:
        return jsonify({'message': 'Invalid data', 'error': str(e)}), 400
@auth_bp.route('/signout', methods=['POST'])
def signout():
    # Dummy sign-out logic for demonstration
    return jsonify({'message': 'Sign-out successful'}), 200
    
