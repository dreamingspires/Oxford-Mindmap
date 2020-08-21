from server import db
from sqlalchemy.types import Text
from depot.fields.sqlalchemy import UploadedFileField
from depot.fields.specialized.image import UploadedImageWithThumb
import uuid 
from enum import Enum

# Define types
LEN_UUID = 32

class TriggerWarning(Enum):
    sexual_assault = 'sexual assualt'
    abuse = 'abuse'
    child_abuse = 'child abuse/paedophilia/incest'
    animal_cruelty = 'animal cruelty/animal death'
    self_harm = 'self harm'
    suicide = 'suicide'
    eating_disorders = 'eating disorders'
    violence = 'violence'
    kidnapping = 'kidnapping/abduction'
    death = 'death'
    pregnancy = 'pregnancy/childbirth'
    miscarriages = 'miscarriages/abortion'
    blood = 'blood'
    racism = 'racism/racial slurs'
    sexism = 'sexism/misogyny'
    classism = 'classism'
    religious_hatred = 'hateful language directed at religious groups'

class Base(db.Model):
    __abstract__  = True
    id = db.Column(db.String(LEN_UUID), primary_key=True, default=lambda:uuid.uuid4().hex)
    date_created = db.Column(db.DateTime,  default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime,  default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp())


class Trigger(Base):
    __tablename__ = 'trigger_warnings'
    warning = db.Column(db.Enum(TriggerWarning))
    story_id = db.Column(db.String(LEN_UUID), db.ForeignKey('stories.id'),
        nullable=False)
    story = db.relationship('Story', backref='trigger_warnings')

class Story(Base):
    __tablename__ = 'stories'
    title = db.Column(Text(), nullable=False)
    author = db.Column(Text())
    display_image = db.Column(UploadedFileField( \
        upload_type=UploadedImageWithThumb))
    description = db.Column(Text(), nullable=False)
    text = db.Column(Text(), nullable=False)
    latitude = db.Column(db.Numeric(10,7))
    longitude = db.Column(db.Numeric(10,7))

    def __repr__(self):
        return f'<Story "{self.title}" {self.id}>'
