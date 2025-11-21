from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Allow React (localhost:3000) to make API calls
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

print("THIS IS THE CORRECT FILE: app.py LOADED")
@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Python Backend!"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
