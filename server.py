# server.py
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html", title="Accueil - HRT Rénove")

@app.route("/services")
def services():
    return render_template("services.html", title="Services - HRT Rénove")

@app.route("/apropos")
def apropos():
    return render_template("apropos.html")

if __name__ == "__main__":
    app.run(debug=True)
