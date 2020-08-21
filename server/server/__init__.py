from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from depot.manager import DepotManager

# Initialise Flask app
app = Flask(__name__)
app.config.from_object('config')

# Register extensions with app
db = SQLAlchemy(app)
admin = Admin(app, name='Oxford Mindmap Admin', template_mode='bootstrap3')

# Define back-end file storage
DepotManager.configure('default', {'depot.storage_path': '/tmp/depot/'})
app.wsgi_app = DepotManager.make_middleware(app.wsgi_app)

# Initialise administrative views

from server import views
from server import models

# Build the database
db.create_all()
