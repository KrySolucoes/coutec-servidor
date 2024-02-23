from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.AssetTypes = AssetTypes(app)
    return app


class AssetTypes(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'asset_type'
        self.table = 'asset_types'
