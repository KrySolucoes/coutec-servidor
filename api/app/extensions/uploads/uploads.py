from app.extensions.generic_object import GenericObject
from flask_caching import Cache
cache = Cache()


def init_app(app, init_log=True):
    app.Uploads = Uploads(app)
    cache.init_app(app, config=app._cacheconfig)
    return app


class Uploads(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'upload'
        self.table = 'uploads'

    @cache.memoize(3600)
    def get(self, uuid):
        return super().get(uuid)
