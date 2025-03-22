from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
import subprocess
import shutil
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)
BAT_FILE_PATH = os.path.abspath("run_python_file.bat")

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

def clone_git_repo(git_url):
    repo_name = os.path.basename(urlparse(git_url).path).replace(".git", "")
    temp_dir = os.path.join(tempfile.gettempdir(), repo_name)
    
    try:
        subprocess.run(["git", "clone", "--depth", "1", git_url, temp_dir], check=True)
        return temp_dir
    except subprocess.CalledProcessError:
        shutil.rmtree(temp_dir)  
        return None

@app.route("/get-folder", methods=["GET", "POST"])
def get_folder():
    if request.method == "GET":
        path = request.args.get("path")  
    else:
        data = request.json
        path = data.get("path") 

    if path.startswith("https://github.com/"):
        cloned_repo_path = clone_git_repo(path)
        if not cloned_repo_path:
            return jsonify({"error": "Failed to clone repository"})
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
def execute_file_script():
    data = request.json
    file_path = data.get("file_path")

    if not os.path.exists(file_path) or not file_path.endswith(".py"):
        return jsonify({"error": "Invalid file path"})

    try:
        result = subprocess.run([BAT_FILE_PATH, file_path], capture_output=True, text=True, shell=True)
        return jsonify({"output": result.stdout, "error": result.stderr})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
