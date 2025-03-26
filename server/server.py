from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import shutil
from urllib.parse import urlparse
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

app = Flask(__name__)
CORS(app)

REPO_DIR = os.path.abspath("./git_repos")
BAT_FILE_PATH = os.path.abspath("run_python_file.bat")

os.makedirs(REPO_DIR, exist_ok=True)

CORS(app, supports_credentials=True, expose_headers=["Authorization"])

app.config["JWT_SECRET_KEY"] = "Test_Execution_GUI"

jwt = JWTManager(app)

BAT_FILE_PATH = os.path.abspath("run_python_file.bat")  

users = {}

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not email or not password or not name:
        return jsonify({"error": "Username and password and name are required"}), 400

    if email in users:
        return jsonify({"error": "User already exists"}), 409

    users[email] = {"name": name, "password": password}
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("username")
    password = data.get("password")

    print(f"Received credentials: {email}, {password}")  

    if email in users and users[email]["password"] == password:
        access_token = create_access_token(identity=email)
        print(f"Generated token: {access_token}") 
        return jsonify({"access_token": access_token})

    return jsonify({"error": "Invalid credentials"}), 401


def get_folder_structure(path):
    if not os.path.exists(path):
        return {"error": "Path does not exist"}
    
    def traverse(directory):
        items = []
        try:
            for entry in os.scandir(directory):
                if entry.is_dir():
                    sub_items = traverse(entry.path)
                    if sub_items: 
                        items.append({
                            "name": entry.name,
                            "isfolder": True,
                            "path": entry.path,
                            "items": sub_items
                        })
                elif entry.is_file() and entry.name.endswith(".py"):  
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
        return {"error": "No Python files found"}

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
    else:  # Clone new repo
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
    if request.method == "GET":
        path = request.args.get("path")  
    else:
        data = request.json
        path = data.get("path") 

    if path.startswith("https://github.com/"):
        cloned_repo_path = clone_or_update_repo(path)
        if not cloned_repo_path:
            return jsonify({"error": "Failed to clone or update repository"})
        path = cloned_repo_path 

    return jsonify(get_folder_structure(path))

@app.route("/execute", methods=["POST"])
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
    env_path = data.get("env_path")

    # Convert to absolute paths
    file_path = os.path.abspath(file_path)
    env_path = os.path.abspath(env_path)

    # Validate paths
    if not os.path.exists(file_path) or not file_path.endswith(".py"):
        return jsonify({"error": "Invalid file path"}), 400

    if not os.path.exists(env_path):
        return jsonify({"error": f"Invalid virtual environment path: {env_path}"}), 400

    try:
        # Run batch file using cmd.exe /c to ensure correct execution
        command = f'"{BAT_FILE_PATH}" "{file_path}" "{env_path}"'
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        return jsonify({"stdout": result.stdout, "stderr": result.stderr, "return_code": result.returncode})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)

