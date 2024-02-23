from dynaconf import FlaskDynaconf
from importlib import import_module
import os


def load_extensions(app):
    for extension in app.config.get('EXTENSIONS'):
        mod = import_module(extension)
        mod.init_app(app)


def init_app(app):
    FlaskDynaconf(app)
    app.path = (os.path.abspath(__file__)
                .replace("\\extensions\\configurations.py", "")
                .replace("/extensions/configurations.py", "")
                .replace("\\", '/'))
    return app
