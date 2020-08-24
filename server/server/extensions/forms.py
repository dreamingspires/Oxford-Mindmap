from wtforms import validators

def validate_image(form, field):
    if field.data and not str(field.data.filename).endswith(
            ('.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG')):
        raise validators.ValidationError('File must be .jpg or .png')
