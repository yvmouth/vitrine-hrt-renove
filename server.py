# server.py
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html", title="Accueil - HRT Rénove")

@app.route("/services")
def services():
    # plus tard, autre template si tu veux une page dédiée
    return render_template("services.html", title="Services - HRT Rénove")

if __name__ == "__main__":
    app.run(debug=True)
