from app.extensions.generic_object import GenericObject
from datetime import datetime


def init_app(app, init_log=True):
    app.Stocks = Stocks(app)
    return app


class Stocks(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'stock'
        self.table = 'stocks'

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            qtd_sem_estoque = self.app.Database.query(
                """select count(*) from (select p.uuid,
                s2.product_uuid,
                '""" + datetime.now().isoformat() + """' as data_consulta
                from products p
                left join stocks s2
                on s2.product_uuid=p.uuid 
                where s2.product_uuid is null and p.type='Produto'
                group by p.uuid , s2.product_uuid) as tb"""
            )
            if len(qtd_sem_estoque) > 0:
                qtd_sem_estoque = qtd_sem_estoque[0]['count']
            else:
                qtd_sem_estoque = 0
            stock = self.app.Database.query(
                """select t1.*, t2.quantidade as estoque_atual, '""" + datetime.now().isoformat() + """' as data_consulta
                from (
                select p.name as produto,
                s.uuid,
                p.marca,
                p.modelo,
                TO_CHAR(s.data_emissao_nf::date, 'dd/mm/yyyy') as data_emissao_nf,
                TO_CHAR(s.data_entrega::date, 'dd/mm/yyyy') as data_entrega,
                s.data_compra,
                TO_CHAR(s.data_compra::date, 'dd/mm/yyyy') as data_compra_str,
                s.quantidade as qtd_entrada,
                s.price,
                s.quantidade * s.price  as preco_total,
                p2."name"  as fornecedor,
                p.estoque_minimo ,
                i."name" as instalacao,
                sum(sop2.quantidade)  as qtd_consumida
                from products p
                    inner join installations i
                        on p.installations_uuid  = i.uuid
                    left join service_orders_products sop2
                        on p.uuid  = sop2.product_uuid
                    left join service_orders so
                        on sop2.service_orders_uuid= so.uuid
                    inner join stocks s
                        on s.product_uuid  = p.uuid
                    left join providers p2
                        on s.provider_uuid = p2.uuid
                where type = 'Produto'
                group by p.name,
                s.uuid,
                p.marca,
                p.modelo,
                s.data_emissao_nf,
                s.data_entrega,
                s.data_compra,
                s.quantidade,
                s.price,
                s.quantidade * s.price,
                p2."name",
                i."name",
                p.estoque_minimo
                order by data_emissao_nf desc
                ) t1
                left join
                    (select sum(s.quantidade) - (
                                    select COALESCE(sum(sop.quantidade), 0)
                                    from service_orders_products sop
                                    where sop.product_uuid = s.product_uuid
                                ) as quantidade, s.product_uuid
                                from stocks s
                                group by s.product_uuid) t2
                on t1.uuid = t2.product_uuid
                order by data_compra desc"""
            )
            _return = {
                'success': True,
                self.table: stock,
                'qtd_sem_estoque': qtd_sem_estoque,
                'data_name': self.table
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def get(self, uuid):
        _return = {'success': False}
        try:
            query = """select s.*,
                p.name as product_name,
                pv.name as provider_name
                from stocks s
                left join products p
                    on s.product_uuid = p.uuid
                left join providers pv
                    on s.provider_uuid = pv.uuid
                where s.uuid =%s"""
            data = self.app.Database.prepare_view(
                self.table,
                self.app.Database.query(
                    query,
                    [uuid]
                )
            )['data']
            if len(data) > 0:
                data = data[0]
            _return = {
                'success': True,
                self.name: data,
                'data_name': self.name
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return
