import pdb

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from depot.manager import DepotManager
from flask_admin.contrib.sqla import ModelView
from flask_login import LoginManager, current_user
from werkzeug.security import generate_password_hash
from wtforms import PasswordField, BooleanField
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

from server.models import Trigger, Story, TriggerWarning
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
    trigger_fields = {datum.name: BooleanField(datum.value, 
            render_kw={'style': 'width:0'}) \
        for datum in TriggerWarning}
    form_extra_fields = trigger_fields.copy()
    form_extra_fields['display_image2'] = FileField('Display Image', [validate_image])

    def on_form_prefill(self, form, id):
        story = Story.query.filter_by(id=id).first()
        if story:
            print('Story exists')
            for t in story.trigger_warnings:
                trigger_field = getattr(form, t.warning.name)
                setattr(trigger_field, 'checked', True)
                print(t.warning)

    def on_model_change(self, form, User, is_created):
        if form.display_image2.data:
            try:
                User.display_image = form.display_image2.data
            except PIL.UnidentifiedImageError:
                raise UnsupportedMediaType( \
                    description="Uploaded file is not an image")
        else:
            print('no image supplied')
        
        # Update trigger warnings
        existing_triggers = {t.warning: t for t in User.trigger_warnings}
        for name in self.trigger_fields.keys():
            is_trigger = getattr(form, name).data
            if is_trigger:
                if not TriggerWarning[name] in existing_triggers.keys():
                    # Add the trigger warning
                    t = Trigger(warning=TriggerWarning[name])
                    User.trigger_warnings.append(t)
            else:
                if TriggerWarning[name] in existing_triggers.keys():
                    # Remove the trigger warning
                    db.session.delete(existing_triggers[TriggerWarning[name]])

    def delete_model(self, model):
        trigger_warnings = model.trigger_warnings
        for t in trigger_warnings:
            db.session.delete(t)
        db.session.delete(model)
        db.session.commit()


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

