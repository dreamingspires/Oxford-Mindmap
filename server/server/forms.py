from flask_wtf import FlaskForm
from wtforms import validators, StringField, PasswordField, BooleanField, \
        SubmitField

class LoginForm(FlaskForm):
    username = StringField('', validators=[validators.DataRequired()],
        render_kw={'placeholder': 'User name'})
    password = PasswordField('', validators=[
        validators.DataRequired()],
        render_kw={'placeholder': 'Password'})
    remember_me = BooleanField('Remember me', '')
    submit = SubmitField('Log in', render_kw={'class': 'button is-success'})
