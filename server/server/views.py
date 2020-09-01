from flask import render_template, request, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
import json

from server import app, db
from server.models import User, Story
from server.forms import LoginForm

@app.route('/')
def index():
    return ''

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

@app.route('/api/get_stories')
def get_stories():
    def filter_story(d):
        permitted_keys = ['title', 'author', 'description', 'text', 'latitude',
            'longitude', 'trigger_warnings']
        d2 = {k: v for k,v in d.items() if k in permitted_keys}
        if 'display_image' in d and d['display_image'] is not None:
            d2['display_image'] = d['display_image'].url
            d2['thumbnail'] = d['display_image'].thumb_url
        else:
            d2['display_image'] = None
            d2['thumbnail'] = None
        if 'trigger_warnings' in d and d['trigger_warnings'] is not None:
            d2['trigger_warnings'] = [{'name': t.warning.name, \
                                       'value': t.warning.value} \
                for t in d['trigger_warnings']]
        for k in permitted_keys:
            if k not in d2:
                d2[k] = None
        return d2

    stories = Story.query.all()
    d = {story.id: filter_story({**story.__dict__, \
        **{'trigger_warnings': story.trigger_warnings}}) for story in stories}
    return json.dumps(d, indent=2)
