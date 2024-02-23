from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.Providers = Providers(app)
    return app


class Providers(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'provider'
        self.table = 'providers'
