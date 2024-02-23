from app.extensions.generic_object import GenericObject
from datetime import datetime, timedelta
from dateutil.relativedelta import *


def init_app(app, init_log=True):
    app.ServiceOrders = ServiceOrders(app)
    return app


class ServiceOrders(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'service_order'
        self.table = 'service_orders'
        self.service_orders_status = None
        self.installations = None

    def status_list(self, recalc=False):
        return self.app.ServiceOrdersStatus.list()['service_orders_status']

    def next_number(self):
        _return = {'success': False}
        try:
            _next_number = 0
            _number = self.app.Database.select(
                table=self.table,
                where="numero is not NULL",
                order="numero DESC",
                size=1
            )['data']
            if len(_number) == 0:
                _next_number = 1
            else:
                _next_number = _number[0]['numero'] + 1
            _return = {
                'success': True,
                'next_number': _next_number
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar next_number "+self.table+": " + str(e), "Error")
        return _return

    def installations_list(self, recalc=False):
        return self.app.Installations.list()['installations']

    def components_list(self):
        return self.app.Assets.list(type='component')['assets']

    def assets_list(self):
        return self.app.Assets.list()['assets']
        # return [{
        #     'uuid': x['uuid'],
        #     'name': x['name'],
        #     'asset_type_uuid': x['asset_type_uuid'],
        #     'codigo_identificador': x['codigo_identificador']
        # } for x in self.app.Assets.list()['assets']]

    def count(self, **kwargs):
        _return = {'success': False}
        try:
            user = kwargs.get('user')
            if user is not None and 'técnico' in user['user']['roles']:
                query = """select so.*
                from service_orders_persons sp
                inner join service_orders so
                on sp.service_orders_uuid = so.uuid
                inner join service_orders_status sos
                on so.status_uuid = sos.uuid AND sos.order != 1
                where sp.person_uuid='""" + user['user']['person_uuid'] + "'"
                data = self.app.Database.query(query)
                data_name = self.table+'_count'
                _return = {
                    'success': True,
                    data_name: len(data),
                    'data_name': data_name
                }
            else:
                _return = super().count(**kwargs)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            data = []
            user = kwargs.get('user')
            request_args = kwargs.get('request_args')
            odata = None if request_args is None else request_args.get('filter')
            extends = None if request_args is None else request_args.get('extends')
            asset_uuid = None if request_args is None else request_args.get('asset_uuid')
            installation_uuid = None if request_args is None else request_args.get('installation_uuid')
            start_date = None if request_args is None else request_args.get('start_date')
            end_date = None if request_args is None else request_args.get('end_date')
            values = []
            if start_date is not None:
                start_date = start_date.split('/')
                start_date = start_date[2]+'-'+start_date[1]+'-'+start_date[0]
            if end_date is not None:
                end_date = end_date.split('/')
                end_date = end_date[2]+'-'+end_date[1]+'-'+end_date[0]

            query = """select
                so.uuid,
                so.status_uuid,
                so.numero,
                maintenance_type,
                sos."name" as status,
                a."name" as equipamento,
                a.codigo_identificador,
                i."name" as instalacao,
                so.data_entrada,
                so.data_prevista_inicio,
                so.data_prev_entrega,
                so.data_finalizacao,
                so.data_pendencia,
                so.data_conclusao,
                so.hora_inicio,
                so.hora_fim,
                string_agg(p."name", ', ') as tecnicos_str
                from service_orders so
                    inner join service_orders_status sos
                        on so.status_uuid = sos.uuid
                    inner join assets a
                        on so.asset_uuid = a.uuid
                    inner join installations i
                        on so.installation_uuid = i.uuid
                    inner join service_orders_persons sop
                        on so.uuid  = sop.service_orders_uuid
                    inner join persons p
                        on sop.person_uuid = p.uuid"""
            where = "true=true"
            if asset_uuid is not None:
                where += " and so.asset_uuid = %s"
                values.append(asset_uuid)
            if start_date is not None:
                where += " and so.data_prevista_inicio >= %s"
                values.append(start_date)
            if end_date is not None:
                where += " and so.data_prevista_inicio <= %s"
                values.append(end_date)
            if installation_uuid is not None:
                where += " and so.installation_uuid = %s"
                values.append(installation_uuid)
            if odata is not None:
                _prepare_odata = self.app.Database.prepare_odata(
                    table={
                        'name': 'service_orders',
                        'alias': 'so'
                    },
                    where=where,
                    values=values,
                    odata=odata
                )['data']
                where = _prepare_odata['where']
                values = _prepare_odata['values']
            if user is not None and 'técnico' in user['user']['roles']:
                where += " and p.uuid=%s"
                values.append(user['user']['person_uuid'])
            query += " where " + where
            query += """ group by
                so.uuid,
                so.status_uuid,
                so.numero,
                maintenance_type,
                sos."name",
                a."name",
                a.codigo_identificador,
                i."name",
                so.data_entrada,
                so.data_prevista_inicio,
                so.data_prev_entrega,
                so.data_finalizacao,
                so.data_pendencia,
                so.data_conclusao,
                so.hora_inicio,
                so.hora_fim
                order by data_prevista_inicio desc"""
            data = self.app.Database.prepare_view(
                self.table,
                self.app.Database.query(
                    query,
                    values
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
            data['comments'] = self.app.Database.select(
                table="service_orders_comments",
                where="service_orders_uuid=%s",
                values=[uuid]
            )['data']
            persons = self.app.Persons.list()['persons']
            for d in data['comments']:
                d['person_name'] = "(EXCLUIDO)"
                p = [x for x in persons if x['uuid'] == d['person_uuid']]
                if len(p) > 0:
                    d['person_name'] = p[0]['name']
            if 'person_uuid_emissao' in data:
                data['person_emissao'] = None
                p = [x for x in persons if x['uuid'] == data['person_uuid_emissao']]
                if len(p) > 0:
                    data['person_emissao'] = {
                        'uuid': p[0]['uuid'],
                        'name': p[0]['name']
                    }
            data['evidences'] = self.app.Database.select(
                table="service_orders_evidences",
                where="service_orders_uuid=%s",
                values=[uuid]
            )['data']
            data['products'] = self.app.Database.select(
                table="service_orders_products",
                where="service_orders_uuid=%s",
                values=[uuid]
            )['data']
            products = self.app.Products.list()['products']
            for d in data['products']:
                product = [x for x in products if x['uuid'] == d['product_uuid']]
                d['product'] = len(product) > 0 and product[0] or None
            data['tecnicos'] = self.app.Database.select(
                table="service_orders_persons",
                where="service_orders_uuid=%s",
                values=[uuid]
            )['data']
            data['tecnicos'] = [x['person_uuid'] for x in data['tecnicos']]
            data['assets'] = self.app.Database.select(
                table="service_orders_assets",
                where="service_orders_uuid=%s",
                values=[uuid]
            )['data']
            data['assets'] = [x['asset_uuid'] for x in data['assets']]
            data['assets_object'] = []
            components_list = self.components_list()
            for x in data['assets']:
                ass = [y for y in components_list if y['uuid'] == x]
                if len(ass) > 0:
                    data['assets_object'].append(ass[0])
            for obj in data['products']:
                product = [x for x in products if x['uuid'] == obj['product_uuid']]
                obj['product_name'] = len(product) > 0 and product[0]['name'] or None
            if data['status_uuid'] is not None:
                status = [x for x in self.status_list() if x['uuid'] == data['status_uuid']]
                data['status'] = len(status) > 0 and status[0] or None
            if data['asset_uuid'] is not None:
                asset = [x for x in self.assets_list() if x['uuid'] == data['asset_uuid']]
                data['asset'] = len(asset) > 0 and asset[0] or None
            if data['installation_uuid'] is not None:
                installation = [x for x in self.installations_list() if x['uuid'] == data['installation_uuid']]
                data['installation'] = len(installation) > 0 and installation[0] or None
            _return = {
                'success': True,
                self.name: data,
                'data_name': self.name
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def setDates(self, objeto, saved=None, status_list=None):
        _return = {'success': False}
        try:
            if status_list is None:
                status_list = self.status_list()
            if saved is None and not self.app.Functions.is_null_or_empty(objeto, 'uuid'):
                saved = self.app.Database.get_by_uuid(
                    self.table,
                    objeto['uuid']
                )['data']
            _now = self.app.Functions.date_to_datetimebr(datetime.now())
            if self.app.Functions.is_null_or_empty(objeto, 'uuid'):
                objeto['status_uuid'] = [x for x in status_list if x['order'] == 1][0]['uuid']
                if objeto['maintenance_type'] != 'Corretiva':
                    objeto['status_uuid'] = [x for x in status_list if x['order'] == 2][0]['uuid']
                objeto['data_entrada'] = _now
            if (not self.app.Functions.is_null_or_empty(objeto, 'uuid')) and objeto['status_uuid'] != saved['status_uuid']:
                new_status = [x for x in status_list if x['uuid'] == objeto['status_uuid']][0]
                saved_status = [x for x in status_list if x['uuid'] == saved['status_uuid']][0]
                if new_status['order'] == 3 and saved_status['order'] != 4:
                    objeto['data_inicio'] = _now
                if new_status['order'] == 4:
                    objeto['data_pendencia'] = _now
                if new_status['order'] == 5:
                    objeto['data_conclusao'] = _now
                if new_status['order'] == 6:
                    objeto['data_finalizacao'] = _now

            _return = {
                'success': True,
                'service_order': objeto
            }
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar setDates "+self.table+": " + str(e),
                "Error"
            )
        return _return

    def frequency_list_days(self, inicio, termino, regra):
        _return = {'success': False}
        try:
            _lista = []
            if regra == 'Diário':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += timedelta(days=1)
            if regra == 'Semanal':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += timedelta(days=7)
            if regra == 'Quinzenal':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += timedelta(days=15)
            if regra == 'Mensal':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += relativedelta(months=+1)
            if regra == 'Trimestral':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += relativedelta(months=+3)
            if regra == 'Semestral':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += relativedelta(months=+6)
            if regra == 'Anual':
                while(inicio.timestamp() <= termino.timestamp()):
                    _lista.append(inicio)
                    inicio += relativedelta(years=+1)
            _return = {
                'success': True,
                'data': _lista
            }
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar frequency_list_days "+self.table+": " + str(e),
                "Error"
            )
        return _return

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            objeto = kwargs.get('objeto')
            user = kwargs.get('user')
            setdates = kwargs.get('setdates')
            comment = None if self.app.Functions.is_null_or_empty(objeto, 'comment') else objeto['comment']
            if setdates is None:
                setdates = True
            data = None
            lock_edit = False
            status = None
            novo_status = None
            is_new = self.app.Functions.is_null_or_empty(objeto, 'uuid')
            if not is_new:
                data = self.app.Database.get_by_uuid(
                    self.table,
                    objeto['uuid']
                )['data']
                if 'numero' not in objeto:
                    lock_edit = True
                objeto['numero'] = data['numero']
                novo_status = [x for x in self.status_list() if x['uuid'] == objeto['status_uuid']][0]
                status = [x for x in self.status_list() if x['uuid'] == data['status_uuid']][0]
                if status['order'] > novo_status['order']:
                    if not (status['order'] == 4 and novo_status['order'] == 3):
                        return _return
                if status['order'] > 2:
                    lock_edit = True
                    if not self.app.Functions.is_null_or_empty(objeto, 'tipo_defeito'):
                        data['tipo_defeito'] = objeto['tipo_defeito']
                        data['mostrar_valor'] = objeto['mostrar_valor']
                    # objeto = self.app.Functions.clone(data)
                    objeto['status_uuid'] = novo_status['uuid']
                if 'técnico' in user['user']['roles']:
                    if status['order'] < 2 or status['order'] > 4:
                        return _return
            if setdates:
                objeto = self.setDates(objeto, data)['service_order']
            if is_new:
                objeto['person_uuid_emissao'] = user['user']['person_uuid']
                status = [x for x in self.status_list() if x['uuid'] == objeto['status_uuid']][0]
                novo_status = [x for x in self.status_list() if x['uuid'] == objeto['status_uuid']][0]
            if is_new or self.app.Functions.is_null_or_empty(objeto, 'numero'):
                objeto['numero'] = self.next_number()['next_number']

            if 'técnico' in user['user']['roles'] and data is None:
                novo_status = [x for x in self.status_list() if x['name'] == 'Em Execução'][0]
                objeto['status_uuid'] = novo_status['uuid']
            _return = super().save(
                objeto=objeto,
                user=user
            )
            if _return['success'] and comment is not None:
                last_status = None
                if data is not None:
                    last_status = data['status_uuid']
                self.app.Cache.delete('service_orders_comments')
                self.app.ServiceOrdersComments.save(
                    objeto={
                        'text_comment': comment,
                        'last_status_uuid': last_status,
                        'status_uuid': objeto['status_uuid'],
                        'service_orders_uuid': objeto['uuid']
                    },
                    user=user
                )
            if _return['success'] and lock_edit is False:
                delete = True
                if not is_new:
                    delete = self.app.Database.delete(
                        "service_orders_persons",
                        "service_orders_uuid=%s",
                        [_return['uuid']]
                    )
                if delete and 'tecnicos' in objeto and len(objeto['tecnicos']) > 0:
                    insert_list = [(
                        self.app.Functions.new_uuid(),
                        _return['uuid'],
                        x,
                    ) for x in objeto['tecnicos']]
                    self.app.Database.insert(
                        "service_orders_persons",
                        "uuid, service_orders_uuid, person_uuid",
                        insert_list
                    )
                if not is_new:
                    delete = self.app.Database.delete(
                        "service_orders_assets",
                        "service_orders_uuid=%s",
                        [_return['uuid']]
                    )
                if delete and 'assets' in objeto and len(objeto['assets']) > 0:
                    insert_list = [(
                        self.app.Functions.new_uuid(),
                        _return['uuid'],
                        x,
                    ) for x in objeto['assets']]
                    self.app.Database.insert(
                        "service_orders_assets",
                        "uuid, service_orders_uuid, asset_uuid",
                        insert_list
                    )
                if is_new and 'maintenance_frequency' in objeto and setdates:
                    if objeto['maintenance_frequency'] != 'Uma vez':
                        data_termino = self.app.Functions.datebr_to_date(objeto['prazo_final'])
                        data_inicio = self.app.Functions.datebr_to_date(
                            objeto['data_entrada'].split(' ')[0]
                        )
                        prev_inicio_days = None
                        if 'data_prevista_inicio' in objeto:
                            prev_inicio = self.app.Functions.datebr_to_date(objeto['data_prevista_inicio'])
                            if prev_inicio is not None:
                                prev_inicio_days = (prev_inicio - data_inicio).days
                        prev_entrega_days = None
                        if 'data_prev_entrega' in objeto:
                            prev_entrega = self.app.Functions.datebr_to_date(objeto['data_prev_entrega'])
                            if prev_entrega is not None:
                                prev_entrega_days = (prev_entrega - data_inicio).days
                        objeto['parent_service_orders_uuid'] = _return['uuid']
                        frequencia = self.frequency_list_days(
                            data_inicio,
                            data_termino,
                            objeto['maintenance_frequency']
                        )['data']
                        for x in frequencia:
                            if x == data_inicio:
                                continue
                            novo_objeto = self.app.Functions.clone(objeto)
                            novo_objeto['uuid'] = None
                            novo_objeto['numero'] = None
                            # novo_objeto['data_entrada'] = self.app.Functions.date_to_datetimebr(x)
                            if prev_inicio_days is not None:
                                novo_objeto['data_prevista_inicio'] = self.app.Functions.date_to_datebr(
                                    x + timedelta(days=prev_inicio_days)
                                )
                            if prev_entrega_days is not None:
                                novo_objeto['data_prev_entrega'] = self.app.Functions.date_to_datebr(
                                    x + timedelta(days=prev_entrega_days)
                                )
                            self.save(
                                objeto=novo_objeto,
                                user=user,
                                setdates=False
                            )
            if _return['success'] and status is not None and novo_status is not None:
                if status['order'] != novo_status['order'] or is_new:
                    if novo_status['order'] == 2:
                        emails = []
                        persons = self.app.Persons.list()['persons']
                        os = self.get(objeto['uuid'])['service_order']
                        for d in os['tecnicos']:
                            t = [x for x in persons if x['uuid'] == d]
                            if len(t) > 0:
                                emails.append(t[0]['email'])
                        if len(emails) > 0:
                            email = ', '.join(emails)
                            asset = ''
                            if 'asset' in os and 'name' in os['asset']:
                                asset = str(os['asset']['name'])
                            installation = ''
                            if 'installation' in os and 'name' in os['asset']:
                                installation = str(os['installation']['name'])
                            msg = 'A OS ' + str(os['numero']) + ' foi aberta para o'
                            msg = msg + ' Ativo ' + asset + ' da Instalação ' + installation
                            msg = msg + ' e está liberada para seu tratamento previsto de'
                            msg = msg + ' iniciar em ' + str(os['data_prevista_inicio']) + '.'
                            msg = msg + ' Para maiores detalhes acesse a OS aqui'
                            msg = msg + ' http://34.123.87.186:443/admin/service-orders/' + os['uuid']
                            self.app.Email.send({
                                'to': email,
                                'title': 'OS ' + str(os['numero']) + ' foi aberta',
                                'message': msg
                            })
                    if novo_status['order'] == 4:
                        # Operador e Administrador
                        persons = self.app.Persons.list()['persons']
                        emails = [x['email'] for x in persons if x['profile']['name'] == 'Administrador' or x['profile']['name'] == 'Operador']
                        os = self.get(objeto['uuid'])['service_order']
                        if len(emails) > 0:
                            email = ', '.join(emails)
                            asset = ''
                            if 'asset' in os and 'name' in os['asset']:
                                asset = str(os['asset']['name'])
                            installation = ''
                            if 'installation' in os and 'name' in os['asset']:
                                installation = str(os['installation']['name'])
                            msg = 'Foi identificada pendência no tratamento da'
                            msg = msg + ' OS ' + str(os['numero'])
                            msg = msg + ' do Ativo ' + asset + ' da Instalação ' + installation + '.'
                            msg = msg + ' Para maiores detalhes acesse a OS aqui'
                            msg = msg + ' http://34.123.87.186:443/admin/service-orders/' + os['uuid']
                            self.app.Email.send({
                                'to': email,
                                'title': 'OS ' + str(os['numero']) + ' com pendência',
                                'message': msg
                            })
                    if novo_status['order'] == 5:
                        # Operador e Administrador
                        persons = self.app.Persons.list()['persons']
                        emails = [x['email'] for x in persons if x['profile']['name'] == 'Administrador' or x['profile']['name'] == 'Operador']
                        os = self.get(objeto['uuid'])['service_order']
                        if len(emails) > 0:
                            email = ', '.join(emails)
                            asset = ''
                            if 'asset' in os and 'name' in os['asset']:
                                asset = str(os['asset']['name'])
                            installation = ''
                            if 'installation' in os and 'name' in os['asset']:
                                installation = str(os['installation']['name'])
                            msg = 'A OS ' + str(os['numero'])
                            msg = msg + ' do Ativo ' + asset + ' da Instalação ' + installation
                            msg = msg + ' foi concluída com sucesso, por favor verifique se o tratamento foi realizado corretamente e finalize a mesma.'
                            msg = msg + ' Para maiores detalhes acesse a OS aqui'
                            msg = msg + ' http://34.123.87.186:443/admin/service-orders/' + os['uuid']
                            self.app.Email.send({
                                'to': email,
                                'title': 'OS ' + str(os['numero']) + ' concluída',
                                'message': msg
                            })
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return
