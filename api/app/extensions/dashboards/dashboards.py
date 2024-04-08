from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.Dashboards = Dashboards(app)
    return app


class Dashboards(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'dashboard'
        self.table = 'dashboards'

    def get(self, uuid, request_args):
        if uuid is None or uuid == 'geral':
            return self.get_geral(uuid)
        if uuid == 'manutencao':
            return self.get_manutencao(uuid, request_args)
        if uuid == 'manutencao_detalhado':
            return self.get_manutencao_detalhado(uuid, request_args)
        if uuid == 'estoque':
            return self.get_estoque(uuid, request_args)
        if uuid == '52w':
            return self.get_52w(uuid, request_args)
        return {'success': False}

    def get_manutencao_detalhado(self, uuid, request_args):
        _return = {'success': False}
        try:
            maintenance_type = None if request_args is None else request_args.get('maintenance_type')
            not_maintenance_type = None if request_args is None else request_args.get('not_maintenance_type')
            asset_uuid = None if request_args is None else request_args.get('asset_uuid')
            installations_uuid = None if request_args is None else request_args.get('installations_uuid')
            data_inicio = None if request_args is None else request_args.get('data_inicio')
            if data_inicio is not None:
                data_inicio = data_inicio.split('/')
                data_inicio = data_inicio[2] + '-' + data_inicio[1] + '-' + data_inicio[0]
                data_inicio = data_inicio + ' 00:00:00'
            data_final = None if request_args is None else request_args.get('data_final')
            if data_final is not None:
                data_final = data_final.split('/')
                data_final = data_final[2] + '-' + data_final[1] + '-' + data_final[0]
                data_final = data_final + ' 23:59:59'
            detalhamento = self.app.Database.query(
                """select distinct
                instalacao_uuid,
                instalacao,
                data_os,
                num_os,
                ativo,
                nome_ativo,
                uuid_ativo,
                tipo_ativo,
                status_ativo,
                tipo,
                numero,
                periodicidade,
                servico,
                produto,
                data_inicio,
				data_os,
				STRING_AGG(tecnico, ', ') as tecnico,
                duracao
                from (
                select
                instalacao_uuid,
                instalacao,
                num_os,
                ativo,
                nome_ativo,
                uuid_ativo,
                tipo_ativo,
                status_ativo,
                tipo,
                numero,
                periodicidade,
                STRING_AGG(servico, ', ') as servico,
                STRING_AGG(produto, ', ') as produto,
                p.name as tecnico,
                data_inicio,
				data_os,
                sum(case when tipo = 'Corretiva' then DATE_PART('minute', data_os - data_inicio) else DATE_PART('minute',duracao) end) as duracao
                from (
                select distinct i.uuid as instalacao_uuid, i.name as instalacao, so.uuid as idos,
                case ss.name when 'Concluída' then so.data_conclusao
                            when 'Finalizada' then so.data_finalizacao
                            else data_prevista_inicio end data_os,
                case ss.name when 'Concluída' then 'Realizada'
                            when 'Finalizada' then 'Realizada'
                            else 'Prevista' end Prevista_realizada,
                a.codigo_identificador as ativo,
                a."name" as nome_ativo,
                a.uuid as uuid_ativo,
                at2."name"  as tipo_ativo,
                so.status_ativo,
                so.maintenance_type as tipo,
                so.numero,
                so.maintenance_frequency as periodicidade,
                p2."name" as servico,
                p2.tempo_medio_execucao as duracao,
				p3."name" as produto,
				case when so.data_inicio is null then so.data_prevista_inicio  else so.data_inicio end as data_inicio,
				so.data_conclusao,
				so.numero as num_os
                from service_orders so
                    inner join service_orders_status ss
                        on so.status_uuid = ss.uuid
                    left join service_orders_assets soa
                        on so.uuid  = soa.service_orders_uuid
                    left join assets a
                        on so.asset_uuid  = a.uuid
                    left join asset_types at2
                        on a.asset_type_uuid = at2.uuid
                    left join installations i
                        on so.installation_uuid = i.uuid
                    left join service_orders_products sop2
                        on so.uuid = sop2.service_orders_uuid
                    left join products p2
                        on p2.uuid  = sop2.product_uuid and p2."type" = 'Serviço'
                    left join service_orders_products sop3
                        on so.uuid = sop3.service_orders_uuid
					left join products p3
                        on p3.uuid  = sop3.product_uuid and p3."type" = 'Produto'
                where so.data_prevista_inicio is not null
                and data_prevista_inicio between '""" + data_inicio + """' and '""" + data_final + """'
                and i.uuid='""" + installations_uuid + """'"""
                + ("" if asset_uuid is None else """ and a.uuid='""" + asset_uuid + """'""")
                + ("" if maintenance_type is None else """ and so.maintenance_type in (""" + maintenance_type + """)""")
                + ("" if not_maintenance_type is None else """ and so.maintenance_type not in (""" + not_maintenance_type + """)""")
                + """
                order by 1, 2, 4, 9, 11) t2
                   left join service_orders_persons sop  
                    	on sop.service_orders_uuid  = t2.idos 
                    left join persons p 
                    	on sop.person_uuid = p.uuid 
                group by instalacao_uuid,
                instalacao,
                data_os,
                ativo,
                nome_ativo,
                uuid_ativo,
                tipo_ativo,
                status_ativo,
                tipo,
                numero,
                data_inicio,
				periodicidade,
				p.name,
				num_os ) t3
                where data_os is not null
                group by instalacao_uuid,
                instalacao,
                data_os,
                num_os,
                ativo,
                nome_ativo,
                uuid_ativo,
                tipo_ativo,
                status_ativo,
                tipo,
                numero,
                periodicidade,
                servico,
                produto,
                data_inicio,
				data_os,
                duracao""",
            )
            cronograma_grupos = []
            for i in detalhamento:
                i['dia_semana'] = self.app.Functions.dia_semana(i['data_os'])
                i['grupo'] = i['data_os'].strftime('%Y-%m')
                i['mes_ano'] = self.app.Functions.mes(i['data_os']) + i['data_os'].strftime('/%Y')
                i['order'] = i['data_os'].strftime('%Y%m%d%H%M%S')
                i['data_os'] = self.app.Functions.date_to_datebr(i['data_os'])
                i['data_inicio'] = self.app.Functions.date_to_datebr(i['data_inicio'])
                # i['duracao'] = str(i['duracao'])[0:5]
                # if i['duracao'][-1:] == ':':
                #     i['duracao'] = '0' + i['duracao'][:-1]
                i['duracao'] = '' if i['duracao'] is None else str(i['duracao']).split('.')[0]
                if len([x for x in cronograma_grupos if x['grupo'] == i['grupo']]) == 0:
                    cronograma_grupos.append({'grupo': i['grupo'], 'mes_ano': i['mes_ano'], 'manutencoes': []})
                    cronograma_grupos = sorted(cronograma_grupos, key=lambda k: k['grupo'])
                for j in cronograma_grupos:
                    if j['grupo'] == i['grupo']:
                        j['manutencoes'].append(i)
                        j['manutencoes'] = sorted(j['manutencoes'], key=lambda k: k['order'])
            _return = {
                'success': True,
                self.name: {
                    'detalhamento': detalhamento,
                    # 'detalhamento_ativos': detalhamento_ativos,
                    'cronograma_grupos': cronograma_grupos
                },
                'data_name': self.name
            }
            # self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def get_estoque(self, uuid, request_args):
        _return = {'success': False}
        try:
            installations_uuid = None if request_args is None else request_args.get('installations_uuid')
            data_inicio = None if request_args is None else request_args.get('data_inicio')
            if data_inicio is not None:
                data_inicio = data_inicio.split('/')
                data_inicio = data_inicio[2] + '-' + data_inicio[1] + '-' + data_inicio[0]
                data_inicio = data_inicio + ' 00:00:00'
            data_final = None if request_args is None else request_args.get('data_final')
            if data_final is not None:
                data_final = data_final.split('/')
                data_final = data_final[2] + '-' + data_final[1] + '-' + data_final[0]
                data_final = data_final + ' 23:59:59'
            estoque = self.app.Database.query(
                 """select produto, marca, modelo, instalacao, sum(preco) as preco, sum(qtd_consumida) as qtd_consumida, sum(valor_pago) as valor_pago, sum(qtd_entrada) as qtd_entrada, sum(saldo) as saldo, sum(valor_investido) as valor_investido, sum(valor_faturado) as valor_faturado, sum(valor_do_estoque) as valor_do_estoque, sum(resultado) as resultado
                from (
                select distinct  *,
				qtd_entrada - qtd_consumida as saldo,
                qtd_entrada * valor_pago as valor_investido,
                qtd_consumida * preco as valor_faturado,
                (qtd_entrada - qtd_consumida) * preco as valor_do_estoque,
                case when (qtd_consumida * preco) is null then 0 else (qtd_consumida * preco) end - case when (qtd_entrada * valor_pago) is null then 0 else (qtd_entrada * valor_pago) end as Resultado
                from (
                select p.name as produto, p.marca , p.modelo, p.preco, i."name" as instalacao,
                sop2.quantidade  as qtd_consumida,
                (select max(price) from stocks s2 where s2.product_uuid = p.uuid and s2.data_entrega = (select max(data_entrega) from stocks s where s.product_uuid = p.uuid)) as valor_pago,
                (select avg(s2.quantidade) from stocks s2 where s2.product_uuid = p.uuid and s2.data_compra  = s.data_compra) as qtd_entrada
                from products p  
                    inner join installations i  
                        on p.installations_uuid  = i.uuid 
                    left join service_orders_products sop2 
                        on p.uuid  = sop2.product_uuid 
                    left join service_orders so 
                        on sop2.service_orders_uuid= so.uuid 
                    left join stocks s
                        on s.product_uuid  = p.uuid 
                where type = 'Produto'"""
                + ("" if installations_uuid is None else " and i.uuid = '" + installations_uuid + "'")
                + ("" if data_inicio is None else " and s.data_entrega >= '" + data_inicio + "'")
                + ("" if data_final is None else " and s.data_entrega <= '" + data_final + "'")
                + """) t1 )t2
                group by produto, marca, modelo, instalacao""",
            )
            _return = {
                'success': True,
                self.name: {
                    'estoque': estoque
                },
                'data_name': self.name
            }
            # self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def get_manutencao(self, uuid, request_args):
        _return = {'success': False}
        try:
            installations_uuid = None if request_args is None else request_args.get('installations_uuid')
            maintenance_type = None if request_args is None else request_args.get('maintenance_type')
            data_inicio = None if request_args is None else request_args.get('data_inicio')
            if data_inicio is not None:
                data_inicio = data_inicio.split('/')
                data_inicio = data_inicio[2] + '-' + data_inicio[1] + '-' + data_inicio[0]
                data_inicio = data_inicio + ' 00:00:00'
            data_final = None if request_args is None else request_args.get('data_final')
            if data_final is not None:
                data_final = data_final.split('/')
                data_final = data_final[2] + '-' + data_final[1] + '-' + data_final[0]
                data_final = data_final + ' 23:59:59'
            manutencoes = self.app.Database.query(
                """select instalacao, ativo,
                sum(corretivas) as Corretivas,
                sum(Preventivas) as Preventivas,
                sum(Inspecoes) as Inspecoes,
                sum(Preditivas) as Preditivas,
                sum(Lubrificacoes) as Lubrificacoes,
                sum(TempoParado) as TempoParado,
                sum(TempoParadoCorretiva) as TempoParadoCorretiva,
                sum(TempoParadoPreventiva) as TempoParadoPreventiva,
                sum(TempoParadoInspecao) as TempoParadoInspecao,
                sum(TempoParadoPreditiva) as TempoParadoPreditiva,
                sum(TempoParadoLubrificacao) as TempoParadoLubrificacao,
                sum(Total_OS) as Total_OS,
                sum(Total_OS_Concluida) as Total_OS_Concluida
                from (
                select i.name as instalacao, a.codigo_identificador as ativo, so.data_prevista_inicio as data_os, 
                (select count(distinct so2.uuid) from service_orders so2 where so2.uuid = so.uuid and so2.data_prevista_inicio <= now()) as Total_OS,
                (select count(distinct so2.uuid) from service_orders so2 where so2.uuid = so.uuid and so2.maintenance_type = 'Corretiva') as Corretivas,
                (select count(distinct so2.uuid) from service_orders so2 where so2.uuid = so.uuid and so2.maintenance_type = 'Preventiva') as Preventivas,
                (select count(distinct so2.uuid) from service_orders so2 where so2.uuid = so.uuid and so2.maintenance_type = 'Inspeção') as Inspecoes,
                (select count(distinct so2.uuid) from service_orders so2 where so2.uuid = so.uuid and so2.maintenance_type = 'Preditiva') as Preditivas,
                (select count(distinct so2.uuid) from service_orders so2 where so2.uuid = so.uuid and so2.maintenance_type = 'Lubrificação') as Lubrificacoes,
                (select sum(p2.tempo_medio_execucao) 
                        from service_orders so2 
                        inner join service_orders_products sop2 
                            on so2.uuid = sop2.service_orders_uuid 
                        inner join products p2 
                        on p2.uuid  = sop2.product_uuid 
                        where so2.uuid = so.uuid and so2.status_ativo = 'Parado') as TempoParado,
                (select sum(p2.tempo_medio_execucao) 
                        from service_orders so2 
                        inner join service_orders_products sop2 
                            on so2.uuid = sop2.service_orders_uuid 
                        inner join products p2 
                        on p2.uuid  = sop2.product_uuid 
                        where so2.uuid = so.uuid and so2.status_ativo = 'Parado' and so2.maintenance_type = 'Corretiva') as TempoParadoCorretiva, 		
                (select sum(p2.tempo_medio_execucao) 
                        from service_orders so2 
                        inner join service_orders_products sop2 
                            on so2.uuid = sop2.service_orders_uuid 
                        inner join products p2 
                        on p2.uuid  = sop2.product_uuid 
                        where so2.uuid = so.uuid and so2.status_ativo = 'Parado' and so2.maintenance_type = 'Preventiva') as TempoParadoPreventiva,
                (select sum(p2.tempo_medio_execucao) 
                        from service_orders so2 
                        inner join service_orders_products sop2 
                            on so2.uuid = sop2.service_orders_uuid 
                        inner join products p2 
                        on p2.uuid  = sop2.product_uuid 
                        where so2.uuid = so.uuid and so2.status_ativo = 'Parado' and so2.maintenance_type = 'Inspeção') as TempoParadoInspecao,
                (select sum(p2.tempo_medio_execucao) 
                        from service_orders so2 
                        inner join service_orders_products sop2 
                            on so2.uuid = sop2.service_orders_uuid 
                        inner join products p2 
                        on p2.uuid  = sop2.product_uuid 
                        where so2.uuid = so.uuid and so2.status_ativo = 'Parado' and so2.maintenance_type = 'Preditiva') as TempoParadoPreditiva,
                (select sum(p2.tempo_medio_execucao) 
                        from service_orders so2 
                        inner join service_orders_products sop2 
                            on so2.uuid = sop2.service_orders_uuid 
                        inner join products p2 
                        on p2.uuid  = sop2.product_uuid 
                        where so2.uuid = so.uuid and so2.status_ativo = 'Parado' and so2.maintenance_type = 'Lubrificação') as TempoParadoLubrificacao,
                (select count(distinct so2.uuid)
                        from service_orders so2 
                        where so2.uuid = so.uuid and so2.data_conclusao is not null and so2.data_prevista_inicio <= now()) as Total_OS_Concluida
                from service_orders so 
                    left join service_orders_assets soa 
                        on so.uuid  = soa.service_orders_uuid 
                    left join assets a 
                        on so.asset_uuid  = a.uuid 
                    left join installations i 
                        on so.installation_uuid = i.uuid 
                where so.data_prevista_inicio is not null """
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
                + """ ) t1
                group by instalacao, ativo"""
            )
            for x in manutencoes:
                x['corretivas'] = int(x['corretivas'])
                x['preventivas'] = int(x['preventivas'])
                x['inspecoes'] = int(x['inspecoes'])
                x['preditivas'] = int(x['preditivas'])
                x['lubrificacoes'] = int(x['lubrificacoes'])
                x['total_os'] = int(x['total_os'])
                x['total_os_concluida'] = int(x['total_os_concluida'])
                # x['data_os'] = x['data_os'].strftime('%d/%m/%Y')
                x['tempoparado'] = str(x['tempoparado']) if x['tempoparado'] is not None else None
                x['tempoparadocorretiva'] = str(x['tempoparadocorretiva']) if x['tempoparadocorretiva'] is not None else None
                x['tempoparadopreventiva'] = str(x['tempoparadopreventiva']) if x['tempoparadopreventiva'] is not None else None
                x['tempoparadoinspecao'] = str(x['tempoparadoinspecao']) if x['tempoparadoinspecao'] is not None else None
                x['tempoparadopreditiva'] = str(x['tempoparadopreditiva']) if x['tempoparadopreditiva'] is not None else None
                x['tempoparadolubrificacao'] = str(x['tempoparadolubrificacao']) if x['tempoparadolubrificacao'] is not None else None
            oss_tipo = []
            oss_tipo = []
            service_orders_type = self.app.Database.query(
                """select so.maintenance_type as service_orders_type
                from service_orders so
                where true = true """
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
                + """group by so.maintenance_type """,
            )
            for x in service_orders_type:
                count = self.app.Database.query(
                    """select count(*) as count from service_orders so
                    where so.maintenance_type='""" + x['service_orders_type'] + """'"""
                    + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                    + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                    + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                    + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
                )[0]
                oss_tipo.append({
                    'tipo': x['service_orders_type'],
                    'count': count['count']
                })
            oss_defeito = []
            service_orders_defeitos = self.app.Database.query(
                """select so.tipo_defeito as tipo_defeito
                from service_orders so
                where so.tipo_defeito is not null """
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
                + """group by so.tipo_defeito""",
            )
            for x in service_orders_defeitos:
                count = self.app.Database.query(
                    """select count(*) as count from service_orders so
                    where so.tipo_defeito='""" + x['tipo_defeito'] + """'"""
                    + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                    + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                    + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                    + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
                )[0]
                oss_defeito.append({
                    'tipo': x['tipo_defeito'],
                    'count': count['count']
                })
            tecnicos = self.app.Database.query(
                """select p.uuid from persons p 
                where p.profile_uuid='05678b84-fb0f-4e08-87e9-4802f6135423'""",
            )
            qtd_ativos = self.app.Database.query(
                """select count(*)
                from assets a 
                where parent_uuid is null """
                + ("" if installations_uuid is None else """ and a.installations_uuid='""" + installations_uuid + """' """)
            )
            ativos_parados = self.app.Database.query(
                """select asset_uuid
                from service_orders so 
                where so.status_ativo ='Parado'
                and status_uuid ='287fc5c3-32f0-422d-a440-fdacbedcdfbb' """
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
                + """group by asset_uuid""",
            )
            tecnicos_operantes = self.app.Database.query(
                """select sop.service_orders_uuid, sop.person_uuid as uuid from service_orders so
                inner join service_orders_persons sop 
                on so.uuid = sop.service_orders_uuid 
                inner join persons p2 
                on p2.uuid = sop.person_uuid and p2.profile_uuid = '05678b84-fb0f-4e08-87e9-4802f6135423'
                where so.status_uuid='287fc5c3-32f0-422d-a440-fdacbedcdfbb'"""
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
            )
            tecnicos_inoperantes = [x for x in tecnicos if len(
                [y for y in tecnicos_operantes if y['uuid'] == x['uuid']]
            ) == 0]
            qtd_corretivas = sum([x['corretivas'] for x in manutencoes])
            qtd_programadas = self.app.Database.query(
                """select count(*) as soma
                from service_orders so 
                where so.status_uuid ='31d66ac8-92c3-454e-8f93-bb1f76ea6c2d'"""
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
            )[0]['soma']
            qtd_concluidas = self.app.Database.query(
                """select count(*) as soma
                from service_orders so 
                where (so.status_uuid ='9fa3d66d-0477-4f75-bc40-c60dc2205099' or so.status_uuid ='5ee59d8d-a71b-4274-a2df-1b253d43fcb5')"""
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
            )[0]['soma']
            qtd_pendentes = self.app.Database.query(
                """select count(*) as soma
                from service_orders so 
                where so.status_uuid ='f385483b-bcb2-48b4-9f89-6583194904bc'"""
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
            )[0]['soma']
            qtd_em_andamento = self.app.Database.query(
                """select count(*) as soma
                from service_orders so 
                where so.status_uuid ='287fc5c3-32f0-422d-a440-fdacbedcdfbb'"""
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
            )[0]['soma']
            qtd_oss = self.app.Database.query(
                """select count(*) as soma
                from service_orders so 
                where true=true"""
                + ("" if installations_uuid is None else """ and so.installation_uuid='""" + installations_uuid + """' """)
                + ("" if maintenance_type is None else """ and so.maintenance_type='""" + maintenance_type + """' """)
                + ("" if data_inicio is None else """ and so.data_prevista_inicio>='""" + data_inicio + """' """)
                + ("" if data_final is None else """ and so.data_prevista_inicio<='""" + data_final + """' """)
            )[0]['soma']
            if qtd_oss == 0:
                percentual_eficiencia = 100
            elif qtd_concluidas == 0:
                percentual_eficiencia = 0
            else:
                percentual_eficiencia = (qtd_concluidas * 100) / qtd_oss
            # remove casas decimais
            percentual_eficiencia = int(str(percentual_eficiencia).split('.')[0])
            _return = {
                'success': True,
                self.name: {
                    'tecnicos': tecnicos,
                    'tecnicos_operantes': tecnicos_operantes,
                    'tecnicos_inoperantes': tecnicos_inoperantes,
                    'ativos_parados': [x['asset_uuid'] for x in ativos_parados],
                    'oss_tipo': oss_tipo,
                    'oss_defeito': oss_defeito,
                    'qtd_ativos': qtd_ativos[0]['count'],
                    'qtd_corretivas': qtd_corretivas,
                    'qtd_programadas': qtd_programadas,
                    'qtd_concluidas': qtd_concluidas,
                    'percentual_eficiencia': percentual_eficiencia,
                    'qtd_pendentes': qtd_pendentes,
                    'qtd_em_andamento': qtd_em_andamento,
                    'qtd_oss': qtd_oss,
                    'manutencoes': manutencoes,
                },
                'data_name': self.name
            }
            # self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def get_geral(self, uuid):
        _return = {'success': False}
        try:
            _cachename = self.table+uuid
            _cache = self.app.Cache.get(_cachename)
            if _cache is not None:
                return _cache
            oss_all = self.app.Database.query(
                """select * from service_orders so""",
            )
            oss_time = []
            for x in oss_all:
                oss_time.append({
                    'tempo_total': self.app.Functions.date_diff(
                        x['data_entrada'],
                        x['data_finalizacao']
                    ),
                    'tempo_execucao': self.app.Functions.date_diff(
                        x['data_inicio'],
                        x['data_conclusao']
                    ),
                    'tempo_pendente': 0,
                    'tempo_validadao': self.app.Functions.date_diff(
                        x['data_conclusao'],
                        x['data_finalizacao']
                    )
                })
            oss_tipo = []
            service_orders_type = self.app.Database.query(
                """select so.maintenance_type as service_orders_type
                from service_orders so
                group by so.maintenance_type """,
            )
            for x in service_orders_type:
                count = self.app.Database.query(
                    """select count(*) as count from service_orders so
                    where so.maintenance_type='""" + x['service_orders_type'] + """'
                    and so.data_prevista_inicio is not null
                    and so.data_prevista_inicio > now() - interval '30' day""",
                )[0]
                oss_tipo.append({
                    'tipo': x['service_orders_type'],
                    'count': count['count']
                })
            oss_status = []
            service_orders_status = self.app.ServiceOrdersStatus.list()['service_orders_status']
            for x in service_orders_status:
                count = self.app.Database.query(
                    """select count(*) as count from service_orders so
                    where so.status_uuid='""" + x['uuid'] + """'
                    and so.data_prevista_inicio is not null
                    and so.data_prevista_inicio > now() - interval '30' day""",
                )[0]
                oss_status.append({
                    'status_name': x['name'],
                    'status_uuid': x['uuid'],
                    'count': count['count']
                })

            top_ativos_parados = []
            top_ativos_parados_data = self.app.Database.query(
                """select so.asset_uuid, a2."name", a2.codigo_identificador
                from service_orders so
                left join assets a2
                on a2.uuid = so.asset_uuid 
                where so.status_ativo='Parado'
                and so.maintenance_type='Corretiva'
                and so.data_inicio is not null
                and so.data_inicio > now() - interval '30' day""",
            )
            # top_ativos_parados_data = self.app.Database.query(
            #     """select so.asset_uuid, a2."name", a2.codigo_identificador
            #     from service_orders so
            #     left join assets a2
            #     on a2.uuid = so.asset_uuid 
            #     where so.status_ativo='Parado'""",
            # )
            for dat in top_ativos_parados_data:
                asset_name = dat['name']
                if dat['codigo_identificador'] is not None:
                    asset_name = dat['codigo_identificador']
                if len([x for x in top_ativos_parados if x['asset_name'] == asset_name]) == 0:
                    top_ativos_parados.append({
                        'asset_uuid': dat['asset_uuid'],
                        'asset_name': asset_name,
                        'count': 1
                    })
                else:
                    for top in top_ativos_parados:
                        if top['asset_name'] == asset_name:
                            top['count'] = top['count'] + 1

            top_ativos_tempo = []
            top_ativos_tempo_data = self.app.Database.query(
                """select so.asset_uuid,
                a2."name",
                a2.codigo_identificador,
                so.data_inicio,
                so.data_conclusao
                from service_orders so
                left join assets a2
                on a2.uuid = so.asset_uuid
                where so.status_ativo='Parado'
                and so.data_inicio is not null
                and so.data_conclusao is not null
                and so.maintenance_type='Corretiva'
                and so.data_inicio is not null
                and so.data_inicio > now() - interval '30' day""",
            )
            # top_ativos_tempo_data = self.app.Database.query(
            #     """select so.asset_uuid,
            #     a2."name",
            #     a2.codigo_identificador,
            #     so.data_inicio,
            #     so.data_conclusao
            #     from service_orders so
            #     left join assets a2
            #     on a2.uuid = so.asset_uuid
            #     where so.data_inicio is not null
            #     and so.data_conclusao is not null""",
            # )
            for dat in top_ativos_tempo_data:
                asset_name = dat['name']
                if dat['codigo_identificador'] is not None:
                    asset_name = dat['codigo_identificador']
                diff = dat['data_conclusao'] - dat['data_inicio']
                diff_minutes = (diff.days * 24 * 60) + (diff.seconds/60)
                diff_minutes = diff_minutes / 60
                if len([x for x in top_ativos_tempo if x['asset_name'] == asset_name]) == 0:
                    top_ativos_tempo.append({
                        'asset_uuid': dat['asset_uuid'],
                        'asset_name': asset_name,
                        'count': diff_minutes
                    })
                else:
                    for top in top_ativos_tempo:
                        if top['asset_name'] == asset_name:
                            top['count'] = top['count'] + diff_minutes

            oss_defeitos = []
            defeitos = self.app.Database.query(
                """select tipo_defeito
                from service_orders so 
                where tipo_defeito is not null
                group by tipo_defeito""",
            )
            for x in defeitos:
                count = self.app.Database.query(
                    """select count(*) as count from service_orders so
                    where so.tipo_defeito='""" + x['tipo_defeito'] + """'
                    and so.maintenance_type='Corretiva'
                    and so.data_conclusao is not null
                    and so.data_conclusao > now() - interval '30' day""",
                )[0]
                oss_defeitos.append({
                    'tipo_defeito': x['tipo_defeito'],
                    'count': count['count']
                })
            assets = self.app.Database.query(
                """select a.uuid, at2.uuid as type_uuid, at2."name" as type_name from assets a 
                inner join asset_types at2
                on a.asset_type_uuid = at2.uuid""",
            )
            assets_type = []
            for asset in assets:
                if len([x for x in assets_type if x['type_uuid'] == asset['type_uuid']]) == 0:
                    assets_type.append({
                        'type_name': asset['type_name'],
                        'type_uuid': asset['type_uuid'],
                        'count': len([x for x in assets if x['type_uuid'] == asset['type_uuid']])
                    })
            tecnicos = self.app.Database.query(
                """select p.uuid from persons p 
                where p.profile_uuid='05678b84-fb0f-4e08-87e9-4802f6135423'""",
            )
            ativos_parados = self.app.Database.query(
                """select asset_uuid
                from service_orders so 
                where so.status_ativo ='Parado'
                and status_uuid ='287fc5c3-32f0-422d-a440-fdacbedcdfbb'
                group by asset_uuid""",
            )
            tecnicos_operantes = self.app.Database.query(
                """select sop.service_orders_uuid, sop.person_uuid as uuid from service_orders so
                inner join service_orders_persons sop 
                on so.uuid = sop.service_orders_uuid 
                inner join persons p2 
                on p2.uuid = sop.person_uuid and p2.profile_uuid = '05678b84-fb0f-4e08-87e9-4802f6135423'
                where so.status_uuid='287fc5c3-32f0-422d-a440-fdacbedcdfbb'""",
            )
            tecnicos_inoperantes = [x for x in tecnicos if len(
                [y for y in tecnicos_operantes if y['uuid'] == x['uuid']]
            ) == 0]
            _return = {
                'success': True,
                self.name: {
                    'tecnicos': tecnicos,
                    'tecnicos_operantes': tecnicos_operantes,
                    'tecnicos_inoperantes': tecnicos_inoperantes,
                    'assets': assets,
                    'ativos_parados': [x['asset_uuid'] for x in ativos_parados],
                    'oss_status': oss_status,
                    'oss_tipo': oss_tipo,
                    'oss_defeitos': oss_defeitos,
                    'assets_type': assets_type,
                    'service_orders_type': service_orders_type,
                    'service_orders_status': service_orders_status,
                    'top_ativos_parados': top_ativos_parados,
                    'top_ativos_tempo': top_ativos_tempo,
                    'oss_time': oss_time
                },
                'data_name': self.name
            }
            self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def get_52w(self, uuid, request_args):
        _return = {'success': False}
        try:
            installations_uuid = None if request_args is None else request_args.get('installations_uuid')
            ano = None if request_args is None else request_args.get('ano')
            resultado = self.app.Database.query(
                """select 
                instalacao, ativo, tipo, ano,
                case when S01 is not null then 'X' end as S01,
                case when S02 is not null then 'X' end as S02,
                case when S03 is not null then 'X' end as S03,
                case when S04 is not null then 'X' end as S04,
                case when S05 is not null then 'X' end as S05,
                case when S06 is not null then 'X' end as S06,
                case when S07 is not null then 'X' end as S07,
                case when S08 is not null then 'X' end as S08,
                case when S09 is not null then 'X' end as S09,
                case when S10 is not null then 'X' end as S10,
                case when S11 is not null then 'X' end as S11,
                case when S12 is not null then 'X' end as S12,
                case when S13 is not null then 'X' end as S13,
                case when S14 is not null then 'X' end as S14,
                case when S15 is not null then 'X' end as S15,
                case when S16 is not null then 'X' end as S16,
                case when S17 is not null then 'X' end as S17,
                case when S18 is not null then 'X' end as S18,
                case when S19 is not null then 'X' end as S19,
                case when S20 is not null then 'X' end as S20,
                case when S21 is not null then 'X' end as S21,
                case when S22 is not null then 'X' end as S22,
                case when S23 is not null then 'X' end as S23,
                case when S24 is not null then 'X' end as S24,
                case when S25 is not null then 'X' end as S25,
                case when S26 is not null then 'X' end as S26,
                case when S27 is not null then 'X' end as S27,
                case when S28 is not null then 'X' end as S28,
                case when S29 is not null then 'X' end as S29,
                case when S30 is not null then 'X' end as S30,
                case when S31 is not null then 'X' end as S31,
                case when S32 is not null then 'X' end as S32,
                case when S33 is not null then 'X' end as S33,
                case when S34 is not null then 'X' end as S34,
                case when S35 is not null then 'X' end as S35,
                case when S36 is not null then 'X' end as S36,
                case when S37 is not null then 'X' end as S37,
                case when S38 is not null then 'X' end as S38,
                case when S39 is not null then 'X' end as S39,
                case when S40 is not null then 'X' end as S40,
                case when S41 is not null then 'X' end as S41,
                case when S42 is not null then 'X' end as S42,
                case when S43 is not null then 'X' end as S43,
                case when S44 is not null then 'X' end as S44,
                case when S45 is not null then 'X' end as S45,
                case when S46 is not null then 'X' end as S46,
                case when S47 is not null then 'X' end as S47,
                case when S48 is not null then 'X' end as S48,
                case when S49 is not null then 'X' end as S49,
                case when S50 is not null then 'X' end as S50,
                case when S51 is not null then 'X' end as S51,
                case when S52 is not null then 'X' end as S52
                from (
                select 
                instalacao, ativo, tipo, ano,
                sum(S01) as S01,
                sum(S02) as S02,
                sum(S03) as S03,
                sum(S04) as S04,
                sum(S05) as S05,
                sum(S06) as S06,
                sum(S07) as S07,
                sum(S08) as S08,
                sum(S09) as S09,
                sum(S10) as S10,
                sum(S11) as S11,
                sum(S12) as S12,
                sum(S13) as S13,
                sum(S14) as S14,
                sum(S15) as S15,
                sum(S16) as S16,
                sum(S17) as S17,
                sum(S18) as S18,
                sum(S19) as S19,
                sum(S20) as S20,
                sum(S21) as S21,
                sum(S22) as S22,
                sum(S23) as S23,
                sum(S24) as S24,
                sum(S25) as S25,
                sum(S26) as S26,
                sum(S27) as S27,
                sum(S28) as S28,
                sum(S29) as S29,
                sum(S30) as S30,
                sum(S31) as S31,
                sum(S32) as S32,
                sum(S33) as S33,
                sum(S34) as S34,
                sum(S35) as S35,
                sum(S36) as S36,
                sum(S37) as S37,
                sum(S38) as S38,
                sum(S39) as S39,
                sum(S40) as S40,
                sum(S41) as S41,
                sum(S42) as S42,
                sum(S43) as S43,
                sum(S44) as S44,
                sum(S45) as S45,
                sum(S46) as S46,
                sum(S47) as S47,
                sum(S48) as S48,
                sum(S49) as S49,
                sum(S50) as S50,
                sum(S51) as S51,
                sum(S52) as S52
                from (
                select i.name as instalacao, a.codigo_identificador as ativo, so.maintenance_type as tipo, extract ('year' from so.data_prevista_inicio) as ano, 
                case when date_part('week', so.data_prevista_inicio) = 1 then 1 end as S01,
                case when date_part('week', so.data_prevista_inicio) = 2 then 1 end as S02,
                case when date_part('week', so.data_prevista_inicio) = 3 then 1 end as S03,
                case when date_part('week', so.data_prevista_inicio) = 4 then 1 end as S04,
                case when date_part('week', so.data_prevista_inicio) = 5 then 1 end as S05,
                case when date_part('week', so.data_prevista_inicio) = 6 then 1 end as S06,
                case when date_part('week', so.data_prevista_inicio) = 7 then 1 end as S07,
                case when date_part('week', so.data_prevista_inicio) = 8 then 1 end as S08,
                case when date_part('week', so.data_prevista_inicio) = 9 then 1 end as S09,
                case when date_part('week', so.data_prevista_inicio) = 10 then 1 end as S10,
                case when date_part('week', so.data_prevista_inicio) = 11 then 1 end as S11,
                case when date_part('week', so.data_prevista_inicio) = 12 then 1 end as S12,
                case when date_part('week', so.data_prevista_inicio) = 13 then 1 end as S13,
                case when date_part('week', so.data_prevista_inicio) = 14 then 1 end as S14,
                case when date_part('week', so.data_prevista_inicio) = 15 then 1 end as S15,
                case when date_part('week', so.data_prevista_inicio) = 16 then 1 end as S16,
                case when date_part('week', so.data_prevista_inicio) = 17 then 1 end as S17,
                case when date_part('week', so.data_prevista_inicio) = 18 then 1 end as S18,
                case when date_part('week', so.data_prevista_inicio) = 19 then 1 end as S19,
                case when date_part('week', so.data_prevista_inicio) = 20 then 1 end as S20,
                case when date_part('week', so.data_prevista_inicio) = 21 then 1 end as S21,
                case when date_part('week', so.data_prevista_inicio) = 22 then 1 end as S22,
                case when date_part('week', so.data_prevista_inicio) = 23 then 1 end as S23,
                case when date_part('week', so.data_prevista_inicio) = 24 then 1 end as S24,
                case when date_part('week', so.data_prevista_inicio) = 25 then 1 end as S25,
                case when date_part('week', so.data_prevista_inicio) = 26 then 1 end as S26,
                case when date_part('week', so.data_prevista_inicio) = 27 then 1 end as S27,
                case when date_part('week', so.data_prevista_inicio) = 28 then 1 end as S28,
                case when date_part('week', so.data_prevista_inicio) = 29 then 1 end as S29,
                case when date_part('week', so.data_prevista_inicio) = 30 then 1 end as S30,
                case when date_part('week', so.data_prevista_inicio) = 31 then 1 end as S31,
                case when date_part('week', so.data_prevista_inicio) = 32 then 1 end as S32,
                case when date_part('week', so.data_prevista_inicio) = 33 then 1 end as S33,
                case when date_part('week', so.data_prevista_inicio) = 34 then 1 end as S34,
                case when date_part('week', so.data_prevista_inicio) = 35 then 1 end as S35,
                case when date_part('week', so.data_prevista_inicio) = 36 then 1 end as S36,
                case when date_part('week', so.data_prevista_inicio) = 37 then 1 end as S37,
                case when date_part('week', so.data_prevista_inicio) = 38 then 1 end as S38,
                case when date_part('week', so.data_prevista_inicio) = 39 then 1 end as S39,
                case when date_part('week', so.data_prevista_inicio) = 40 then 1 end as S40,
                case when date_part('week', so.data_prevista_inicio) = 41 then 1 end as S41,
                case when date_part('week', so.data_prevista_inicio) = 42 then 1 end as S42,
                case when date_part('week', so.data_prevista_inicio) = 43 then 1 end as S43,
                case when date_part('week', so.data_prevista_inicio) = 44 then 1 end as S44,
                case when date_part('week', so.data_prevista_inicio) = 45 then 1 end as S45,
                case when date_part('week', so.data_prevista_inicio) = 46 then 1 end as S46,
                case when date_part('week', so.data_prevista_inicio) = 47 then 1 end as S47,
                case when date_part('week', so.data_prevista_inicio) = 48 then 1 end as S48,
                case when date_part('week', so.data_prevista_inicio) = 49 then 1 end as S49,
                case when date_part('week', so.data_prevista_inicio) = 50 then 1 end as S50,
                case when date_part('week', so.data_prevista_inicio) = 51 then 1 end as S51,
                case when date_part('week', so.data_prevista_inicio) = 52 then 1 end as S52

                from service_orders so 
                    left join service_orders_assets soa 
                        on so.uuid  = soa.service_orders_uuid 
                    left join assets a 
                        on so.asset_uuid  = a.uuid 
                    left join installations i 
                        on so.installation_uuid = i.uuid 
                where so.data_prevista_inicio is not null and so.maintenance_type <> 'Corretiva'"""
                + ("" if installations_uuid is None else " and i.uuid = '" + installations_uuid + "'")
                +""") t1
                group by instalacao, ativo , tipo , ano
                order by ano, instalacao, ativo, tipo ) t2
                where 1=1"""
                + ("" if ano is None else " and ano = '" + ano + "'")
            )
            instalacoes = []
            for x in resultado:
                x['ano'] = str(x['ano'])
                instalacao = next((item for item in instalacoes if item['instalacao'] == x['instalacao']), None)
                if instalacao is None:
                    instalacoes.append({
                        'instalacao': x['instalacao'],
                    })
                    instalacao = next((item for item in instalacoes if item['instalacao'] == x['instalacao']), None)
                if 'data' not in instalacao:
                    instalacao['data'] = []
                instalacao['data'].append(x)
            _return = {
                'success': True,
                self.name: {
                    'instalacoes': instalacoes
                },
                'data_name': self.name
            }
            # self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return
