from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from depot.manager import DepotManager
from flask_admin.contrib.sqla import ModelView

# Initialise Flask app
app = Flask(__name__)
app.config.from_object('config')

# Register extensions with app
db = SQLAlchemy(app)
admin = Admin(app, name='Oxford Mindmap Admin', template_mode='bootstrap3')

# Define back-end file storage
DepotManager.configure('default', {'depot.storage_path': '/tmp/depot/'})
app.wsgi_app = DepotManager.make_middleware(app.wsgi_app)

from server.models import Trigger, Story
from server import views

# Initialise administrative views
class BaseView(ModelView):
    form_excluded_columns=['date_created', 'date_modified']

admin.add_view(BaseView(Story, db.session))
admin.add_view(BaseView(Trigger, db.session))

# Build the database
db.create_all()
