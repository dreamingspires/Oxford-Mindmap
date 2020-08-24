from flask import request, url_for
from flask_admin import AdminIndexView, expose
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash

from server.forms import LoginForm

class AdminHomeView(AdminIndexView):
        @expose('/')
        def index(self):
            form = LoginForm(request.form)
            return self.render('admin/home.html', form=form,
                    login_url=url_for('admin_login'))
