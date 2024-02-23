from app.extensions.generic_object import GenericObject
from flask import request
from datetime import timedelta


def init_app(app, init_log=True):
    app.MaintenancePlan = MaintenancePlan(app)
    return app


class MaintenancePlan(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'maintenance_plan'
        self.table = 'maintenance_plans'

    def get(self, uuid):
        _return = {'success': False}
        try:
            request_args = request.args
            start = None if request_args is None else request_args.get('start')
            end = None if request_args is None else request_args.get('end')
            assets = self.app.Assets.list()['assets']
            installation = self.app.Installations.get(uuid)['installation']
            service_orders = self.app.Database.select(
                table='service_orders',
                where='data_prevista_inicio>=%s and data_prev_entrega<=%s and installation_uuid=%s',
                values=[
                    self.app.Functions.datebr_to_date(start, False),
                    self.app.Functions.datebr_to_date(end, False),
                    installation['uuid']
                ]
            )['data']
            cronograma = []
            for so in service_orders:
                if so['asset_uuid'] is not None and so['data_prevista_inicio'] is not None:
                    mes = self.app.Functions.mes(
                        self.app.Functions.datebr_to_date(
                            so['data_prevista_inicio']
                        )
                    )
                    mes = mes + '/' + so['data_prevista_inicio'].split('/')[2]
                    if len([x for x in cronograma if x['mes'] == mes]) == 0:
                        cronograma.append({
                            'mes': mes,
                            'assets': []
                        })
                    for c in cronograma:
                        if c['mes'] == mes:
                            ast = [x for x in assets if x['uuid'] == so['asset_uuid']]
                            c['assets'].append({
                                'os': so,
                                'data': so['data_prevista_inicio'],
                                'dia_semana': self.app.Functions.dia_semana(
                                    self.app.Functions.datebr_to_date(
                                        so['data_prevista_inicio']
                                    )
                                ),
                                'asset_uuid': so['asset_uuid'],
                                'asset': None if len(ast) == 0 else ast[0]
                            })
            servicos_query = """select sop.*, p."name" as product_name, p.tempo_medio_execucao
            from service_orders_products sop
            left join products p
            on sop.product_uuid = p.uuid
            where p."type"='Serviço'"""
            servicos = self.app.Database.query(
                servicos_query
            )
            servicos = self.app.Database.prepare_view(
                'products',
                servicos
            )['data']
            detalhamento = []
            for c in cronograma:
                for a in c['assets']:
                    if len([x for x in detalhamento if x['asset']['uuid'] == a['asset']['uuid']]) == 0:
                        detalhamento.append({
                            'asset_uuid': a['asset']['uuid'],
                            'asset': a['asset'],
                            'servicos_manutencao': [],
                            'tempo_manutencao': [],
                            'servicos': [x for x in servicos if x['service_orders_uuid'] == a['os']['uuid']]
                        })
                    for d in detalhamento:
                        if d['asset']['uuid'] == a['asset']['uuid']:
                            mes = self.app.Functions.mes(
                                self.app.Functions.datebr_to_date(
                                    a['data']
                                )
                            )
                            mes = mes + '/' + so['data_prevista_inicio'].split('/')[2]
                            if len([x for x in d['tempo_manutencao'] if x['mes'] == mes]) == 0:
                                d['tempo_manutencao'].append({
                                    'mes': mes,
                                    'manutencoes': [],
                                    'servicos': []
                                })
                            for t in d['tempo_manutencao']:
                                if t['mes'] == mes:
                                    t['manutencoes'].append({
                                        'data': a['data'],
                                        'dia_semana': a['dia_semana'],
                                        'condicao_ativo': a['os']['status_ativo'],
                                        'os': a['os']
                                    })
                                    for s in d['servicos']:
                                        servico_manutencao = {
                                            'data': a['data'],
                                            'dia_semana': a['dia_semana'],
                                            'periodicidade': a['os']['maintenance_frequency'],
                                            'os': a['os'],
                                            'name': s['product_name'],
                                            'tempo_execucao': s['tempo_medio_execucao']
                                        }
                                        d['servicos_manutencao'].append(servico_manutencao)
                                        t['servicos'].append(servico_manutencao)
            cronograma_simples = []
            for c in cronograma:
                simples = {
                    'mes': c['mes'],
                    'assets': []
                }
                for a in c['assets']:
                    exist = [x for x in simples['assets'] if x['asset_uuid'] == a['asset_uuid'] and x['data'] == a['data']]
                    if len(exist) == 0:
                        simples['assets'].append(a)
                cronograma_simples.append(simples)
            for c in cronograma_simples:
                for a in c['assets']:
                    a['tempo'] = 0
                    a['servicos_names'] = []
                    a['servicos'] = []
                    detalh = [x for x in detalhamento if x['asset_uuid'] == a['asset_uuid']]
                    for d in detalh:
                        servs = [x for x in d['servicos_manutencao'] if x['data'] == a['data']]
                        for s in servs:
                            a['servicos_names'].append(s['name'])
                            if s['tempo_execucao'] is not None:
                                tempo = s['tempo_execucao'].split(':')
                                if len(tempo) == 3:
                                    a['tempo'] = a['tempo'] + (int(tempo[0]) * 60 * 60)
                                    a['tempo'] = a['tempo'] + (int(tempo[1]) * 60)
                                    a['tempo'] = a['tempo'] + int(tempo[2])
                        a['servicos'] = a['servicos'] + servs
                    a['tempo'] = "{:0>8}".format(str(timedelta(seconds=a['tempo'])))

            _return = {
                'success': True,
                self.name: {
                    'installation': installation,
                    'installation_uuid': installation['uuid'],
                    'start': start,
                    'end': end,
                    'cronograma': cronograma,
                    'cronograma_simples': cronograma_simples,
                    'detalhamento': detalhamento
                },
                'data_name': self.name
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return
