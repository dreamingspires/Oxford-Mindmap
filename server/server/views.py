from flask import render_template, request, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash

from server import app, db
from server.models import User
from server.forms import LoginForm

@app.route('/')
def index():
    return 'test'

@app.route('/admin_login', methods=['GET', 'POST'])
def admin_login():
    form = LoginForm(request.form)
    if form.validate_on_submit():
        user = User.query.filter_by(id=form.username.data).first()
        if user and check_password_hash(user.password, form.password.data):
            # Keep the user info in the session using Flask-Login
            login_user(user, remember=form.remember_me.data)

            next = request.args.get('next')
            #if not is_safe_url(next):
            #    return abort(400)
            #return redirect(next or url_for('profile.landing_page'))
            return redirect('/admin')

        pass

    return 'validation failed'

@app.route('/admin_logout')
def admin_logout():
    logout_user()
    return redirect('/admin')

from server.models import User

@app.route('/generate/')
def generate():
    user = User(id='edd', password=generate_password_hash('test'))
    db.session.add(user)
    db.session.commit()
    return('Generation complete')
