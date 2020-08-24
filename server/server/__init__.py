from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from depot.manager import DepotManager
from flask_admin.contrib.sqla import ModelView
from flask_login import LoginManager, current_user
from werkzeug.security import generate_password_hash
from wtforms import PasswordField
from flask_wtf.file import FileField
import PIL

from server.admin_views import AdminHomeView
from server.extensions.forms import validate_image

# Initialise Flask app
app = Flask(__name__)
app.config.from_object('config')

# Register extensions with app
login_manager = LoginManager(app)
db = SQLAlchemy(app)
admin = Admin(app, name='Oxford Mindmap Admin', template_mode='bootstrap3', \
        index_view=AdminHomeView())

# login_manager settings
from server.models import User
@login_manager.user_loader
def load_user(uid):
    return User.query.filter_by(id=uid).first()

# Define back-end file storage
DepotManager.configure('default', {'depot.storage_path': '/tmp/depot/'})
app.wsgi_app = DepotManager.make_middleware(app.wsgi_app)

from server.models import Trigger, Story
from server import views

# Initialise administrative views
class AdminView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

class BaseView(AdminView):
    form_excluded_columns=['date_created', 'date_modified']

class UserView(BaseView):
    column_display_pk=True
    form_columns=('id', 'password2')

    form_extra_fields = {
        'password2': PasswordField('Password')
    }

    def on_model_change(self, form, User, is_created):
        if form.password2.data is not None:
            User.password = generate_password_hash(form.password2.data)

class StoryView(BaseView):
    column_exclude_list = ['display_image']
    form_extra_fields = {
        'display_image2': FileField('Display Image', [validate_image])
    }

    def on_model_change(self, form, User, is_created):
        if form.display_image2.data:
            try:
                User.display_image = form.display_image2.data
            except PIL.UnidentifiedImageError:
                raise UnsupportedMediaType( \
                    description="Uploaded file is not an image")
        else:
            print('no image supplied')


admin.add_view(StoryView(Story, db.session))
admin.add_view(BaseView(Trigger, db.session))
admin.add_view(UserView(User, db.session))

# Build the database
db.create_all()

# Update the database with defaults if specified
if 'GENERATE_TEST_DB' in app.config and app.config['GENERATE_TEST_DB']:
    # Create a test user
    user = User.query.filter_by(id='admin').first()
    if not user:
        user = User(id='admin', password=generate_password_hash('admin'))
        db.session.add(user)
        db.session.commit()

