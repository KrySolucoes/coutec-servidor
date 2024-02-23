from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.ConfigurationsApp = ConfigurationsApp(app)
    return app


class ConfigurationsApp(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'configuration'
        self.table = 'configurations'

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            privates = ['smtp_password']
            public = kwargs.get('public')
            if public is None:
                public = True
            configurations = {}
            data = super().list(**kwargs)[self.table]
            for x in data:
                if public and x['name'] in privates:
                    continue
                configurations[x['name']] = x['value']
            if 'image_uuid' in configurations:
                configurations['image'] = self.app.Uploads.get(configurations['image_uuid'])['upload']
            _return = {
                'success': True,
                self.table: configurations,
                'data_name': self.table
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            objeto = kwargs.get('objeto')
            data_list = self.app.Database.select(
                table=self.table
            )['data']
            insert = []
            for x in objeto:
                find = [y for y in data_list if y['name'] == x]
                if len(find) == 0:
                    if type(objeto[x]) == str:
                        insert.append((
                            self.app.Functions.new_uuid(),
                            x,
                            objeto[x]
                        ))
                else:
                    if find[0]['value'] != objeto[x]:
                        self.app.Database.generic_update(
                            self.table,
                            {
                                'uuid': find[0]['uuid'],
                                'name': x,
                                'value': objeto[x]
                            }
                        )
            if len(insert) > 0:
                self.app.Database.insert(
                    self.table,
                    'uuid, name, value',
                    insert
                )
            _return = {'success': True}
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return
