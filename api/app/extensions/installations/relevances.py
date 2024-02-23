from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.Relevances = Relevances(app)
    return app


class Relevances(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'relevance'
        self.table = 'relevances'
