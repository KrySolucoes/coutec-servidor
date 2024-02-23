from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.CustomAttibutes = CustomAttibutes(app)
    return app


class CustomAttibutes(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'custom_attribute'
        self.table = 'custom_attributes'

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            custom_attributes_types = self.app.CustomAttibutesTypes.list()['custom_attributes_types']

            def get_type(uuid):
                _type = [x for x in custom_attributes_types if x['uuid'] == uuid]
                if len(_type) > 0:
                    return _type[0]
                return None
            data = super().list(**kwargs)[self.table]
            _return = {
                'success': True,
                self.table: [{
                    'uuid': x['uuid'],
                    'name': x['name'],
                    'variable_name': x['variable_name'],
                    'type_uuid': x['type_uuid'],
                    'type': get_type(x['type_uuid']),
                } for x in data],
                'data_name': self.table
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return
