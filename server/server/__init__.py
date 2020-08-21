from flask import Flask
from flask_admin import Admin

app = Flask(__name__)
app.config.from_object('config')

@app.route('/')
def index():
    return 'test'
