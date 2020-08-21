import os.path

FLASK_ADMIN_SWATCH = 'cerulean'

# SQLAlchemy settings
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
DATABASE_CONNECT_OPTIONS = {}

# Secret key for signing cookies
SECRET_KEY = "secret"

# Turn off flask-sqlalchemy track modifications (pre-deprecation)
SQLALCHEMY_TRACK_MODIFICATIONS = False
