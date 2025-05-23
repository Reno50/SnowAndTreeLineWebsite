from flask import Flask, send_from_directory, Response

app = Flask(__name__)

@app.route("/")
def main_page() -> Response:
    return send_from_directory("../dist", "index.html")

@app.route("/assets/<path:path>")
def assets(path: str) -> Response:
    return send_from_directory("../dist/assets", path)

@app.route("/<path:path>")
def local_assets(path: str) -> Response:
    print("Grabbed " + path)
    return send_from_directory("../dist/", path)