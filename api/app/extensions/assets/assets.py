from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.Assets = Assets(app)
    return app


class Assets(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'asset'
        self.table = 'assets'
        self.assets_custom_attributes = None
        self.custom_attributes = None

    def get_custom(self, asset_uuid, custom_attribute_uuid):
        _return = [x for x in self.assets_custom_list() if x['asset_uuid'] == asset_uuid and x['custom_attribute_uuid'] == custom_attribute_uuid]
        if len(_return) > 0:
            return _return[0]['value']
        return None

    def custom_list(self, recalc=False):
        return self.app.CustomAttibutes.list()['custom_attributes']

    def assets_custom_list(self, recalc=False):
        if self.assets_custom_attributes is None or recalc:
            self.assets_custom_attributes = self.app.Database.select(
                table='assets_custom_attributes'
            )['data']
        for asset_custom in self.assets_custom_attributes:
            asset_custom['custom_attribute'] = [x for x in self.custom_list() if x['uuid'] == asset_custom['custom_attribute_uuid']][0]
        return self.assets_custom_attributes

    def add_custom(self, data):
        is_list = type(data) == list
        if not is_list:
            data = [data]
        new_data = []
        for x in data:
            for custom in self.custom_list():
                x[custom['variable_name']] = self.get_custom(x['uuid'], custom['uuid'])
            new_data.append(x)
        if not is_list:
            return new_data[0]
        return new_data

    def count(self, **kwargs):
        _return = {'success': False}
        try:
            request_args = kwargs.get('request_args')
            _type = None if request_args is None else request_args.get('type')
            where = "parent_uuid is not NULL" if _type == 'component' else "parent_uuid is NULL"
            _return = super().count(
                request_args=request_args,
                where=where
            )
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            request_args = kwargs.get('request_args')
            _type = None if request_args is None else request_args.get('type')
            if _type is None:
                _type = kwargs.get('type')
            where = "parent_uuid is not NULL" if _type == 'component' else "parent_uuid is NULL"
            query = """select 
                a.uuid,
                codigo_identificador,
                a.parent_uuid,
                a.name,
                at2."name"  as tipo,
                (select aca.value from assets_custom_attributes aca where a.uuid = aca.asset_uuid and aca.custom_attribute_uuid = 'de96f0d1-4499-4490-9b05-fcc7c590ac53' ) as Marca,
                (select aca.value from assets_custom_attributes aca where a.uuid = aca.asset_uuid and aca.custom_attribute_uuid = '4bd6a820-e50a-40fe-83d3-511c2536ba51' ) as Modelo,
                a.capacidade ,
                i.name as instalacao,
                i.uuid as installations_uuid,
                a.localizacao ,
                (select count(distinct so.uuid) from service_orders so where so.asset_uuid = a.uuid and DATE_PART('day', now() - data_inicio ) <=30 and so.status_ativo = 'Parado' ) as Parada_30_dias
                from assets a 
                    inner join asset_types at2  
                        on a.asset_type_uuid = at2.uuid 
                    inner join installations i 
                        on a.installations_uuid  = i.uuid
                where """+where+"""
                order by name"""
            data = self.app.Database.prepare_view(
                self.table,
                self.app.Database.query(
                    query
                )
            )['data']
            _return = {
                'success': True,
                self.table: data,
                'data_name': self.table
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def get(self, uuid):
        _return = {'success': False}
        try:
            data = self.app.Database.get_by_uuid(
                self.table,
                uuid
            )['data']
            data['components'] = self.app.Database.select(
                table=self.table,
                where="parent_uuid=%s",
                values=[uuid]
            )['data']
            for x in data['components']:
                x = self.add_custom(x)
            _return = {
                'success': True,
                self.name: self.add_custom(data),
                'data_name': self.name
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            objeto = kwargs.get('objeto')
            _return = self.app.Database.generic_save(self.table, objeto)
            custom_add = []
            self.assets_custom_list(True)
            for custom in self.custom_list():
                asset_custom = [x for x in self.assets_custom_list() if x['custom_attribute_uuid'] == custom['uuid'] and x['asset_uuid'] == _return['uuid']]
                if len(asset_custom) == 0:
                    if not objeto[custom['variable_name']] is None:
                        custom_add.append((
                            self.app.Functions.new_uuid(),
                            _return['uuid'],
                            custom['uuid'],
                            objeto[custom['variable_name']]
                        ))
                else:
                    if asset_custom[0]['value'] != objeto[custom['variable_name']]:
                        self.app.Database.generic_update(
                            'assets_custom_attributes',
                            {
                                'uuid': asset_custom[0]['uuid'],
                                'custom_attribute_uuid': custom['uuid'],
                                'asset_uuid': _return['uuid'],
                                'value': objeto[custom['variable_name']]
                            }
                        )
            if len(custom_add) > 0:
                self.app.Database.insert(
                    'assets_custom_attributes',
                    'uuid, asset_uuid, custom_attribute_uuid, value',
                    custom_add
                )

        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return
