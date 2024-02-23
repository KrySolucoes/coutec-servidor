from flask_caching import Cache
cache = Cache()


def init_app(app, init_log=True):
    app.Cache = Cache(app)
    cache.init_app(app, config=app._cacheconfig)
    return app


class Cache():
    def __init__(self, app):
        self.app = app
        self.cache_names = []

    def delete(self, name):
        names = [x for x in self.cache_names if x.startswith(name)]
        for x in names:
            cache.delete(x)
        self.cache_names = [x for x in self.cache_names if not x.startswith(name)]

    def get(self, name):
        if name in self.cache_names:
            return cache.get(name)
        return None

    def set(self, name, value):
        cache.set(name, value)
        if name not in self.cache_names:
            self.cache_names.append(name)
        return None
