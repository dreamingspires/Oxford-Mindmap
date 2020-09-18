from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
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

class PrefixMiddleware(object):
    def __init__(self, app, prefix=''):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):

        if environ['PATH_INFO'].startswith(self.prefix):
            environ['PATH_INFO'] = environ['PATH_INFO'][len(self.prefix):]
            environ['SCRIPT_NAME'] = self.prefix
            return self.app(environ, start_response)
        else:
            start_response('404', [('Content-Type', 'text/plain')])
            return ["This url does not belong to the app.".encode()]

# Initialise Flask app
app = Flask(__name__)
app.config.from_object('config')
app.config.from_object('secret_config')

# Register extensions with app
login_manager = LoginManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
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

try:
    if app.config['PREFIX']:
        app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix=app.config['PREFIX'])
        prefix = app.config['PREFIX']
except KeyError:
    prefix = ''

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
            render_kw={'style': 'width:2%'}) \
        for datum in TriggerWarning}
    form_extra_fields = trigger_fields.copy()
    form_extra_fields['display_image2'] = FileField('Display Image', [validate_image])
    form_excluded_columns = ('trigger_warnings',)

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
try:
    app.config['ADMINS']
except KeyError:
    pass
else:
    for username, password in app.config['ADMINS']:
        user = User.query.filter_by(id=username).first()
        if not user:
            user = User(id=username, password=generate_password_hash(password))
            db.session.add(user)
    db.session.commit()
