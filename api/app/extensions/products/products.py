from app.extensions.generic_object import GenericObject
from datetime import datetime


def init_app(app, init_log=True):
    app.Products = Products(app)
    return app


class Products(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'product'
        self.table = 'products'

    def consumo(self):
        _return = {'success': False}
        try:
            products = []
            consumo = self.app.Database.query(
                """select sop.uuid, sop.product_uuid, sop.quantidade 
                from service_orders_products sop
                left join service_orders so
                on so.uuid = sop.service_orders_uuid
                where so.uuid is not null
                and so.data_inicio is not null
                and so.data_inicio > now() - interval '30' day"""
            )
            for cons in consumo:
                if len([x for x in products if x['product_uuid'] == cons['product_uuid']]) == 0:
                    products.append({
                        'product_uuid': cons['product_uuid'],
                        'consumo': sum([x['quantidade'] for x in consumo if x['product_uuid'] == cons['product_uuid']])
                    })
            _return = {
                'success': True,
                'consumo': products,
                'data_name': 'consumo'
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            query = """select 
                uuid,
                codigo,
                name,
                marca,
                modelo,
                preco,
                installations_uuid,
                localizacao_estoque,
                case when estoque is null then 0 else estoque end -case when consumo is null then 0 else consumo end as Estoque_atual,
                instalacao,
                unidade,
                consumo_30_dias,
                type,
                categoria,
                tempo_medio_execucao,
                case when estoque-consumo <= estoque_minimo then 'Sim' else 'Não' end as Estoque_abaixo
                from 
                (select 
                p.uuid,
                p.codigo ,
                p."name" ,
                p.preco,
                p.marca ,
                p.modelo ,
                p.localizacao_estoque ,
                (select sum(s.quantidade) from stocks s where p.uuid  = s.product_uuid ) as estoque,
                (select sum(sop.quantidade) from service_orders_products sop where sop.product_uuid  = p.uuid)  as consumo,
                i."name" as instalacao,
                i.uuid as installations_uuid,
                p.unidade ,
                (select sum (quantidade) from service_orders_products sop2  inner join service_orders so on so.uuid = sop2.service_orders_uuid  where DATE_PART('day', now() - data_inicio ) <=30  and sop2.product_uuid = p.uuid ) as consumo_30_dias,
                p.estoque_minimo ,
                p.tempo_medio_execucao,
                p.categoria,
                p.type
                from products p 
                    left join installations i 
                        on p.installations_uuid = i.uuid 
                group by 
                i.uuid,
                p.codigo ,
                p."name" ,
                p.marca ,
                p.modelo ,
                p.preco,
                p.localizacao_estoque,
                i."name" ,
                p.unidade ,
                p.estoque_minimo,
                p.tempo_medio_execucao,
                p.categoria,
                p.type,
                p.uuid ) t1
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
            _return = super().get(uuid)
            if _return['success']:
                consumo = self.consumo()['consumo']
                cons = [x['consumo'] for x in consumo if x['product_uuid'] == _return[self.name]['uuid']]
                if len(cons) > 0:
                    _return[self.name]['consumo'] = cons[0]
                else:
                    _return[self.name]['consumo'] = 0
                qtd_estoque = self.app.Database.query(
                    """select sum(s.quantidade) - (
                    select COALESCE(sum(sop.quantidade), 0)
                    from service_orders_products sop
                    where sop.product_uuid = '""" + _return[self.name]['uuid'] + """'
                    ) as quantidade, '""" + datetime.now().isoformat() + """' as data_consulta
                    from stocks s
                    where s.product_uuid = '""" + _return[self.name]['uuid'] + """'
                    group by s.product_uuid """
                )
                _return[self.name]['qtd_estoque'] = 0 if len(qtd_estoque) == 0 else qtd_estoque[0]['quantidade']
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return
