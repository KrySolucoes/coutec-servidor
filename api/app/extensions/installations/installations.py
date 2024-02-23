from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.Installations = Installations(app)
    return app


class Installations(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'installation'
        self.table = 'installations'
