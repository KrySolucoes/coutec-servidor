from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.Profiles = Profiles(app)
    return app


class Profiles(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'profile'
        self.table = 'profiles'
