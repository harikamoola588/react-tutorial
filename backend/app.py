from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)

# This is critical for allowing the React app (on port 3000) to access the Flask app (on port 5000)
CORS(app)

# --- In-Memory Data Store ---
users = {
    "1234": {"id": "1234", "username": "Alice", "phone": "555-0101"},
    "5678": {"id": "5678", "username": "Bob", "phone": "555-0202"}
}
# -----------------------------

# Basic health check endpoint - Returns JSON
@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Python Backend! CRUD routes available."})

# --- CRUD ROUTES ---

# GET All Users (READ)
@app.route("/api/users", methods=["GET"])
def get_users():
    # Flask's jsonify automatically handles CORS headers correctly when returning a JSON response
    return jsonify(list(users.values()))

# POST Create User (CREATE)
@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.json
    if not data or 'username' not in data or 'phone' not in data:
        # 400 Bad Request
        return jsonify({"error": "Missing username or phone number"}), 400

    new_id = str(uuid.uuid4())
    new_user = {
        "id": new_id,
        "username": data['username'],
        "phone": data['phone']
    }
    users[new_id] = new_user
    # 201 Created
    return jsonify(new_user), 201

# PUT Update User (UPDATE)
@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    if user_id not in users:
        # 404 Not Found
        return jsonify({"error": "User not found"}), 404
        
    data = request.json
    
    if 'username' in data:
        users[user_id]['username'] = data['username']
    if 'phone' in data:
        users[user_id]['phone'] = data['phone']

    return jsonify(users[user_id])

# DELETE User (DELETE)
@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    if user_id not in users:
        return jsonify({"error": "User not found"}), 404
    
    del users[user_id]
    # 204 No Content (Standard response for successful deletion)
    return ('', 204) # Returning an empty response with 204 status

# This route MUST NOT exist if you only want API endpoints. If you request "/" and it serves HTML, you get the error.
# @app.route("/") 
# def index():
#     return "<h1>This is HTML, NOT JSON!</h1>"

if __name__ == "__main__":
    # Ensure this server is running on port 5000 and debugging is on
    app.run(host="0.0.0.0", port=5000, debug=True)