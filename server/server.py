from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import ast
import shutil
from urllib.parse import urlparse
from pymongo import MongoClient
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required ,get_jwt
from flask_jwt_extended import get_jwt_identity
from datetime import timedelta
import random
import string


import uuid

# chech_arg

app = Flask(__name__)
CORS(app)

REPO_DIR = os.path.abspath("./git_repos")
BAT_FILE_PATH = os.path.abspath("run_python_file.bat")

os.makedirs(REPO_DIR, exist_ok=True)

MONGO_URI = "mongodb+srv://nova:nova2346@nova.r5lap4p.mongodb.net/?retryWrites=true&w=majority&appName=nova"  # Local MongoDB connection

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)  # 5-second timeout
    db = client["user_database"]
    users_collection = db["users"]
    user_data_collection = db["user_data"]
    reports_collection = db["reports"]

    # Attempt to ping the database
    client.admin.command('ping')
    print("✅ Connected to local MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    exit(1)  # Exit if DB connection fails
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "Test_Execution_GUI")

jwt = JWTManager(app)
blacklist = set()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def initialize_user_data(email):
    if not user_data_collection.find_one({"email": email}):
        user_data_collection.insert_one({"email": email, "env_path": [], "report": []})

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    print("Received signup data:", data) 
    username = data.get("name")
    password = data.get("password")

    if not username or not password :
        return jsonify({"error": "Username and password   required"}), 400

    if users_collection.find_one({"name": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = hash_password(password)
    users_collection.insert_one({"name": username, "password": hashed_password})
    return jsonify({"message": "User created successfully"}), 201

@app.route("/signin", methods=["POST"])
def signin():
    data = request.json
    print(data)
    username = data.get("name")
    password = data.get("password")

    user = users_collection.find_one({"name": username})
    if not user or not check_password(password, user["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(hours=1))

    print(access_token)
    return jsonify({"access_token": access_token, "message": "Login successful"})

otp_storage = {}

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    username = data.get("name")

    user = users_collection.find_one({"name": username})
    if  not  user:
        return jsonify({"error": "User not found"}), 404

    otp = generate_otp()
    otp_storage[username] = otp  # Save OTP for verification

    # Simulating OTP sending (print instead of email/SMS)
    print(f"OTP for {username}: {otp}")

    return jsonify({"message": otp}), 200

@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    username = data.get("name")
    new_password = data.get("password")
    otp = data.get("otp")

    if not username or not new_password or not otp:
        return jsonify({"error": "All fields are required"}), 400

    # Check if user exists
    user = users_collection.find_one({"name": username})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Validate OTP
    stored_otp = otp_storage.get(username)
    if  stored_otp  != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    # Hash new password and update
    hashed_password = hash_password(new_password)
    users_collection.update_one({"name": username}, {"$set": {"password": hashed_password}})

    # Remove OTP from storage after successful reset
    del otp_storage[username]

    return jsonify({"message": "Password reset successfully"}), 200


@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]  # Get JWT unique identifier
    blacklist.add(jti)
    return jsonify({"message": "Logged out successfully"}), 200

@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    return jwt_payload["jti"] in blacklist

# @app.route("/verify-token", methods=["POST"])
# def verify_token():
#     auth_header = request.headers.get("Authorization")
#     if not auth_header or not auth_header.startswith("Bearer "):
#         return jsonify({"error": "Unauthorized"}), 401

#     token = auth_header.split(" ")[1]

#     try:
#         jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
#         return jsonify({"message": "Token is valid"}), 200
#     except jwt.ExpiredSignatureError:
#         return jsonify({"error": "Token expired"}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({"error": "Invalid token"}), 401


def get_folder_structure(path, test_type=None):
    if not os.path.exists(path):
        return {"error": "Path does not exist"}

    # Define valid test file extensions
    valid_extensions = {
        "python": ".py",
        "java": ".java",
        "cucumber": ".feature",  # Cucumber BDD files
    }

    # Determine file extension filter
    file_extension = valid_extensions.get(test_type.lower()) if test_type else None

    def traverse(directory):
        items = []
        try:
            for entry in os.scandir(directory):
                if entry.is_dir():
                    sub_items = traverse(entry.path)
                    if sub_items or file_extension is None:  
                        items.append({
                            "name": entry.name,
                            "isfolder": True,
                            "path": entry.path,
                            "items": sub_items
                        })
                elif file_extension is None or entry.name.endswith(file_extension):  
                    items.append({
                        "name": entry.name,
                        "isfolder": False,
                        "path": entry.path
                    })
        except PermissionError:
            return []
        return items

    folder_items = traverse(path)

    if not folder_items:
        return {"error": "No matching files found"}

    return {
        "name": os.path.basename(path),
        "isfolder": True,
        "path": path,
        "items": folder_items
    }

def clone_or_update_repo(git_url):
    repo_name = os.path.basename(urlparse(git_url).path).replace(".git", "")
    repo_path = os.path.join(REPO_DIR, repo_name)

    if os.path.exists(repo_path): 
        try:
            subprocess.run(["git", "-C", repo_path, "pull"], check=True)
            return repo_path
        except subprocess.CalledProcessError:
            return None
    else:  
        try:
            subprocess.run(["git", "clone", "--depth", "1", git_url, repo_path], check=True)
            return repo_path
        except subprocess.CalledProcessError:
            shutil.rmtree(repo_path, ignore_errors=True)
            return None

@app.route("/get-folder", methods=["GET", "POST"])
@jwt_required()
def get_folder():
    path = None
    test_type = None

    if request.method == "GET":
        path = request.args.get("path")
        test_type = request.args.get("testType")
    else:
        data = request.json
        path = data.get("path")
        test_type = data.get("testType")

    if path.startswith("https://github.com/"):
        cloned_repo_path = clone_or_update_repo(path)
        if not cloned_repo_path:
            return jsonify({"error": "Failed to clone or update repository"})
        path = cloned_repo_path

    return jsonify(get_folder_structure(path, test_type))

@app.route("/execute", methods=["POST"])
@jwt_required()
def execute_file():
    data = request.json
    file_path = data.get("file_path")
    if not os.path.exists(file_path) or not file_path.endswith(".py"):
        return jsonify({"error": "Invalid file path"})
    try:
        result = subprocess.run(["run_python.bat", file_path], capture_output=True, text=True, shell=True)
        return jsonify({"output": result.stdout, "error": result.stderr})
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/execute-script", methods=["POST"])
@jwt_required()
def execute_file_script():
    data = request.json
    file_path = data.get("file_path")
    env_path = request.json.get("env_path")
    testType = request.json.get("testType")
    args = request.json.get("arg")


    if isinstance(env_path, list):
        env_path = env_path[0] 

    file_path = os.path.abspath(file_path)
    env_path = os.path.abspath(env_path)
    if not os.path.exists(file_path) or not file_path.endswith(".py"):
        return jsonify({"error": "Invalid file path"}), 400

    if not os.path.exists(env_path):
        return jsonify({"error": f"Invalid virtual environment path: {env_path}"}), 400
    flattened_args = [item for sublist in args for item in sublist]
    try:
        result = subprocess.run(
            [BAT_FILE_PATH, file_path, env_path , testType ]+ flattened_args,
            capture_output=True,
            text=True,
            shell=True
        )


        return jsonify({"stdout": result.stdout, "stderr": result.stderr, "return_code": result.returncode})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/validate-env-path", methods=["POST"])
@jwt_required()
def validate_env_path():
    data = request.json
    env_path = data.get("envPath")

    if not env_path:
        return jsonify({"error": "envPath is required"}), 400

    env_path = os.path.abspath(env_path)

    if os.path.exists(env_path):
        return jsonify({"message": "Valid environment path", "valid": True, "path": env_path}), 200
    else:
        return jsonify({"error": "Invalid environment path", "valid": False, "path": env_path}), 400



@app.route("/update-env-path", methods=["POST"])
@jwt_required()
def update_env_path():
    email = get_jwt_identity()  # Get user email from token
    data = request.json
    new_env_path = data.get("env_path")
    print(new_env_path)

    if not new_env_path:
        return jsonify({"error": "env_path is required"}), 400

    initialize_user_data(email)  # Ensure user_data exists

    user_data_collection.update_one(
        {"email": email},
        {"$addToSet": {"env_path": new_env_path}},

    
    )

    return jsonify({"message": "Environment path updated successfully"}), 200

# Route 2: Update Report
@app.route("/update-report", methods=["POST"])
@jwt_required()
def update_report():
    email = get_jwt_identity()  # Get user email from token
    data = request.json
    new_report = data.get("report_id")
    name = data.get("name")

    if not new_report:
        return jsonify({"error": "report is required"}), 400

    initialize_user_data(email)  # Ensure user_data exists

    user_data_collection.update_one(
        {"email": email},
        {"$addToSet": {"report": [name,new_report]}}
    )

    return jsonify({"message": "Report updated successfully"}), 200

@app.route("/get-env-paths", methods=["GET"])
@jwt_required()
def get_env_paths():
    email = get_jwt_identity()  # Extract user email from token
    
    user_data = user_data_collection.find_one({"email": email}, {"env_path": 1, "_id": 0})
    
    if not user_data or "env_path" not in user_data:
        return jsonify({"env_paths": []})  # Return empty list if no paths exist
    
    return jsonify({"env_paths": user_data["env_path"]}), 200

@app.route("/remove-env-path", methods=["DELETE"])
@jwt_required()
def remove_env_path():
    email = get_jwt_identity()  # Extract email from token
    data = request.get_json()
    env_path = data.get("env_path")

    if not env_path:
        return jsonify({"error": "Environment path is required"}), 400

    # Update user document to remove the specific environment path
    result = user_data_collection.update_one(
        {"email": email},
        {"$pull": {"env_path": env_path}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Path not found or already removed"}), 404

    return jsonify({"message": "Environment path removed successfully"}), 200


@app.route("/create-script", methods=["POST"])
@jwt_required()
def create_script():
    """
    Create a .txt file, store the script content, and save metadata in MongoDB.
    """
    user_id = get_jwt_identity()  # Get user ID from token
    data = request.json

    name = data.get("name")
    script_content = data.get("script")

    if not name or not script_content:
        return jsonify({"error": "Name and script content are required"}), 400

    report_id = str(uuid.uuid4())

    # Store metadata in MongoDB
    report_data = {
        "_id": report_id,
        "user_id": user_id,
        "file_name": name,
        "file_data": script_content,
    }
    reports_collection.insert_one(report_data)

    return jsonify({"message": "Script stored successfully", "report_id": report_id}), 201


@app.route("/get-script/<report_id>", methods=["GET"])
@jwt_required()
def get_script(report_id):
    """
    Retrieve the script content from the stored file.
    """
    user_id = get_jwt_identity()  # Get user ID from token

    report = reports_collection.find_one({"_id": report_id, "user_id": user_id})

    if not report:
        return jsonify({"error": "Report not found"}), 404

    file_data = report["file_data"]

    return jsonify({"report_id": report_id, "file_content": file_data})



@app.route("/get-user-reports", methods=["GET"])
@jwt_required()
def get_user_reports():
    email = get_jwt_identity()  # Extract user email from JWT

    user_reports = list(reports_collection.find({"user_id": email}))

    if not user_reports:
        return jsonify({"reports": []}), 200  # Ensure empty list instead of None

    return jsonify({"reports": user_reports}), 200


def extract_options(file_path):
    with open(file_path, "r") as f:
        tree = ast.parse(f.read())

    options = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and hasattr(node.func, 'attr') and node.func.attr == "addoption":
            # Handle both Python versions (pre-3.8 and post-3.8)
            args = [arg.value if isinstance(arg, ast.Constant) else arg.s for arg in node.args if isinstance(arg, (ast.Str, ast.Constant))]
            kwargs = {kw.arg: (kw.value.value if isinstance(kw.value, ast.Constant) else kw.value.s) 
                      for kw in node.keywords if isinstance(kw.value, (ast.Str, ast.Constant))}
            
            options.append([
                args[0] if args else "",
                f"action={kwargs.get('action', '')}",
                f"type={kwargs.get('type', '')}",
                f"help={kwargs.get('help', '')}"
            ])
    return options

@app.route("/chech_arg", methods=["POST"])
def check_arg():
    data = request.get_json()
    file_path = data.get("path")

    if not file_path:
        return jsonify({"error": "Missing path parameter"}), 400
    print(file_path)
    try:
        response = extract_options(file_path)
        return jsonify(response)
    except Exception as e:
        print(f"Error processing file: {str(e)}")  # Log error
        return jsonify({"error": str(e)}), 500





if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)


