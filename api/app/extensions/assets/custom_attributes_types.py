from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.CustomAttibutesTypes = CustomAttibutesTypes(app)
    return app


class CustomAttibutesTypes(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'custom_attribute_type'
        self.table = 'custom_attributes_types'
