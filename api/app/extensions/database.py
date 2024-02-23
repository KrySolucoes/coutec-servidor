import psycopg2
import os
from odata_query.grammar import ODataLexer
from odata_query.grammar import ODataParser
from odata_query import ast
from flask_caching import Cache
from datetime import datetime
cache = Cache()


def init_app(app):
    app.Database = Database(app)
    cache.init_app(app, config=app._cacheconfig)
    return app


class Database:
    memory_db = []

    def __init__(self, app):
        self.app = app

    def generic_save(self, table, objeto):
        _return = {'success': False}
        try:
            if self.app.Functions.is_null_or_empty(objeto, 'uuid'):
                _return = self.generic_create(table, objeto)
            else:
                _return = self.generic_update(table, objeto)
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar usuário: " + str(e),
                "Error"
            )
        return _return

    def generic_create(self, table, objeto):
        _return = {'success': False}
        try:
            schema = self.prepare_schema(table, objeto)['data']
            insert = self.insert(
                schema['table'],
                ', '.join(schema['columns']),
                schema['values']
            )
            if insert:
                _return = {
                    'success': True,
                    'uuid': schema['object']['uuid']
                }
        except Exception as e:
            self.app.Log.insert(
                "Erro create " + table + ": " + str(e),
                "Error"
            )
        return _return

    def generic_update(self, table, objeto):
        _return = {'success': False}
        try:
            schema = self.prepare_schema(table, objeto)['data']
            schema['values'].append(schema['object']['uuid'])
            update_ = self.update(
                schema['table'],
                ', '.join(schema['columns']),
                "uuid=%s",
                schema['values']
            )
            if update_:
                _return = {
                    'success': True,
                    'uuid': objeto['uuid']
                }
        except Exception as e:
            self.app.Log.insert(
                "Erro update " + table + ": " + str(e),
                "Error"
            )
        return _return

    def odata_to_sql(self, **kwargs):
        _return = {'success': False}
        try:
            alias = '' if kwargs.get('alias') is None else kwargs.get('alias') + '.'
            alias = alias.replace('..', '.')
            table = kwargs.get('table')
            if type(table) is not str:
                alias = table['alias']+'.'
                table = table['name']

            schema = kwargs.get('schema')
            odata = kwargs.get('odata')
            parser = kwargs.get('lexer')

            if schema is None:
                schema = self.table_schema(table)['schema']

            if odata is not None:
                lexer = ODataLexer()
                parser = ODataParser()
                parser = parser.parse(lexer.tokenize(odata))

            query = None
            values = []
            if type(parser) == ast.CollectionLambda:
                resultado = self.odata_to_sql(
                    table={
                        'name': table,
                        'alias': parser.owner.name
                    },
                    schema=schema,
                    lexer=parser.lambda_.expression
                )
                query = resultado['query']
                values.extend(resultado['values'])
            else:
                if type(parser.left) == ast.Attribute:
                    operator = None
                    if type(parser.comparator) == ast.Eq:
                        operator = '='
                    elif type(parser.comparator) == ast.NotEq:
                        operator = '!='
                    query = alias + parser.left.attr + operator + '%s'
                if type(parser.left) == ast.Compare:
                    resultado1 = self.odata_to_sql(
                        table=table,
                        alias=alias,
                        schema=schema,
                        lexer=parser.left
                    )
                    resultado2 = self.odata_to_sql(
                        table=table,
                        alias=alias,
                        schema=schema,
                        lexer=parser.right
                    )
                    operator = None
                    if type(parser.op) == ast.And:
                        operator = ' AND '
                    if type(parser.op) == ast.Or:
                        operator = ' OR '
                    query = '(('+resultado1['query']+')'+operator+'('+resultado2['query']+'))'
                    values.extend(resultado1['values'])
                    values.extend(resultado2['values'])
                if type(parser.left) == ast.Identifier:
                    if len([x for x in schema if x['name'] == parser.left.name]) == 0:
                        return {'success': False}
                    operator = None
                    if type(parser.comparator) == ast.Eq:
                        operator = '='
                    elif type(parser.comparator) == ast.NotEq:
                        operator = '!='
                    query = alias + parser.left.name + operator + '%s'
                if type(parser.right) == ast.String:
                    values.append(parser.right.val)
                if values == []:
                    values = None
            _return = {
                'success': True,
                'query': query,
                'values': values,
            }
        except Exception as e:
            self.app.Log.insert(
                "Erro odata_to_sql " + str(e),
                "Error"
            )
        return _return

    def prepare_odata(self, **kwargs):
        _return = {'success': False}
        try:
            where = kwargs.get('where')
            values = kwargs.get('values')
            odata = kwargs.get('odata')
            table = kwargs.get('table')
            schema = kwargs.get('schema')
            if where is None:
                where = ''
            else:
                where = '('+where+') AND '
            odata_sql = self.odata_to_sql(
                table=table,
                schema=schema,
                odata=odata
            )
            where = where + odata_sql['query']
            if len(odata_sql['values']) > 0:
                if values is None:
                    values = []
                values.extend(odata_sql['values'])
            _return = {
                'success': True,
                'data': {
                    'where': where,
                    'values': values,
                }
            }
        except Exception as e:
            self.app.Log.insert("Erro select: " + str(e), "Error")
        return _return

    def select(self, **kwargs):
        _return = {'success': False}
        try:
            table = kwargs.get('table')
            columns = kwargs.get('columns')
            where = kwargs.get('where')
            values = kwargs.get('values')
            size = kwargs.get('size')
            page = kwargs.get('page')
            order = kwargs.get('order')
            odata = kwargs.get('odata')
            count = kwargs.get('count')
            _sum = kwargs.get('sum')
            order_by = []
            schema = None
            if order is not None:
                if schema is None:
                    schema = self.table_schema(table)['schema']
                for x in order.split(','):
                    orderpart = x.split(' ')
                    if len([y for y in schema if y['name'] == orderpart[0]]) > 0:
                        _type = ' ASC'
                        if len(orderpart) > 1 and orderpart[1].lower() == 'desc':
                            _type = ' DESC'
                        order_by.append(orderpart[0]+_type)
            if columns is None:
                columns = "*"
            if count is not None:
                columns = "COUNT(*)"
            if _sum is not None:
                if schema is None:
                    schema = self.table_schema(table)['schema']
                if len([y for y in schema if y['name'] == _sum]) > 0:
                    columns = 'SUM('+_sum+') AS count'
            if odata is not None:
                _prepare_odata = self.prepare_odata(
                    where=where,
                    table=table,
                    schema=schema,
                    odata=odata,
                    values=values
                )['data']
                where = _prepare_odata['where']
                values = _prepare_odata['values']

            # columns = columns+', COUNT(*)'
            query = "SELECT " + columns + " FROM " + table
            if where is not None:
                query = query + " WHERE " + where
            if len(order_by) > 0:
                query = query + " ORDER BY " + ', '.join(order_by)
            if size is not None:
                query = query + " LIMIT " + str(int(size))
            if page is not None:
                query = query + " OFFSET " + str((int(page) - 1) * int(size))
            query = query + ";"
            data = self.query(
                query,
                values
            )
            if count is not None or _sum is not None:
                data = data[0]['count']
            else:
                data = self.prepare_view(
                    table,
                    data
                )['data']
            _return = {
                'success': True,
                'data': data
            }
        except Exception as e:
            self.app.Log.insert("Erro select: " + str(e), "Error")
        return _return

    def get_by_uuid(self, table, uuid):
        _return = {'success': False}
        try:
            data = self.query(
                "SELECT * FROM " + table + " WHERE uuid=%s",
                [uuid]
            )
            _return = {
                'success': True,
                'data': self.prepare_view(
                    table,
                    data[0]
                )['data']
            }
        except Exception as e:
            self.app.Log.insert("Erro get_by_uuid: " + str(e), "Error")
        return _return

    def prepare_view(self, table, objetos):
        _return = {'success': False}
        try:
            _list = True
            if not type(objetos) is list:
                _list = False
                objetos = [objetos]
            schema = self.table_schema(table)['schema']
            for x in schema:
                for objeto in objetos:
                    if x['name'] in objeto:
                        if x['type'] == 'timestamptz':
                            objeto[x['name']] = self.app.Functions.date_to_datetimebr(
                                objeto[x['name']]
                            )
                        if x['type'] == 'date':
                            objeto[x['name']] = self.app.Functions.date_to_datebr(
                                objeto[x['name']]
                            )
                        if x['type'] == 'time':
                            objeto[x['name']] = self.app.Functions.time_to_timebr(
                                objeto[x['name']]
                            )
            _return = {
                'success': True,
                'data': objetos if _list else objetos[0]
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar table_schema: " + str(e), "Error")
        return _return

    def prepare_schema(self, table, objeto):
        _return = {'success': False}
        try:
            retorno = {}
            schema = self.table_schema(table)['schema']
            retorno['table'] = table
            retorno['columns'] = []
            retorno['values'] = []
            retorno['object'] = objeto
            is_new = False
            if self.app.Functions.is_null_or_empty(objeto, 'uuid'):
                objeto['uuid'] = self.app.Functions.new_uuid()
                is_new = True
            for x in schema:
                # retorno['columns'].append(x['name'])
                if x['name'] == 'created_at' and is_new:
                    retorno['columns'].append(x['name'])
                    if x['type'] == 'timestamptz' or x['type'] == 'date':
                        retorno['values'].append(
                            datetime.now()
                        )
                if x['name'] in objeto:
                    retorno['columns'].append(x['name'])
                    if x['type'] == 'timestamptz' or x['type'] == 'date':
                        retorno['values'].append(
                            self.app.Functions.datebr_to_date(
                                objeto[x['name']]
                            )
                        )
                    else:
                        retorno['values'].append(objeto[x['name']])
                # else:
                #     retorno['values'].append(None)
            _return = {
                'success': True,
                'data': retorno
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar table_schema: " + str(e), "Error")
        return _return

    @cache.memoize(3600)
    def table_schema(self, table):
        _return = {'success': False}
        try:
            schema = self.query(
                """select * from information_schema.columns where table_name=%s""",
                [table]
            )
            obj_schema = [{
                'name': x['column_name'],
                'nullable': x['is_nullable'],
                'type': x['udt_name']
            } for x in schema]
            _return = {
                'success': True,
                'schema': obj_schema
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar table_schema: " + str(e), "Error")
        return _return

    def connect(self):
        try:
            # host = os.environ["DATABASE_HOST_DEV"]
            # port = os.environ["DATABASE_PORT_DEV"]
            # if ("PRODUCTION_MODE" in os.environ
            #    and os.environ["PRODUCTION_MODE"] == 'TRUE'):
            #     host = os.environ["DATABASE_HOST"]
            #     port = os.environ["DATABASE_PORT"]
            host = os.environ["DATABASE_HOST"]
            port = os.environ["DATABASE_PORT"]
            return psycopg2.connect(
                host=host,
                port=port,
                database=os.environ["DATABASE_DATABASE"],
                user=os.environ["DATABASE_USER"],
                password=os.environ["DATABASE_PASSWORD"]
            )
        except psycopg2.Error as e:
            self.app.Log.insert(
                "Erro ao conectar com o banco de dados. " + str(e.pgerror)
            )
            return None

    def update(self, table, columns, where=None, values=None):
        try:
            self.app.Cache.delete(table)
            conn = self.connect()
            if conn is None:
                return False
            cursor = conn.cursor()
            x = [n+'=%s' for n in columns.split(',')]
            query = "UPDATE "+table+" SET "+','.join(x)
            if where is not None:
                query = query + " WHERE " + where
            query = query + ";"
            if values is None:
                cursor.execute(query)
            else:
                cursor.execute(query, values)
            conn.commit()
            conn.close()
            if table == 'assets_custom_attributes':
                self.app.Assets.assets_custom_list(True)
            cache.delete_memoized(Database.query)
            return True
        except Exception as e:
            self.app.Log.insert("Erro ao inserir dados: " + str(e), "Error")
            return False

    def insert(self, table, columns, values):
        try:
            self.app.Cache.delete(table)
            conn = self.connect()
            if conn is None:
                return None
            cursor = conn.cursor()
            x = ['%s' for x in columns.split(',')]
            if not type(values[0]) == tuple:
                query = (
                    "INSERT INTO " + table
                    + " (" + columns + ") VALUES (" + ','.join(x) + ");"
                )
                cursor.execute(query, values)
            else:
                query = (
                    "INSERT INTO " + table
                    + " (" + columns + ") VALUES (" + ','.join(x) + ");"
                )
                cursor.executemany(query, values)
            conn.commit()
            conn.close()
            if table == 'assets_custom_attributes':
                self.app.Assets.assets_custom_list(True)
            cache.delete_memoized(Database.query)
            return True
        except Exception as e:
            self.app.Log.insert("Erro ao inserir dados: " + str(e), "Error")
            return False

    def delete(self, table, where, values=None):
        try:
            self.app.Cache.delete(table)
            conn = self.connect()
            if conn is None:
                return False
            cursor = conn.cursor()
            query = "DELETE FROM "+table+" WHERE "+where+";"
            if values is None:
                cursor.execute(query)
            else:
                cursor.execute(query, values)
            conn.commit()
            conn.close()
            cache.delete_memoized(Database.query)
            return True
        except Exception as e:
            self.app.Log.insert("Erro ao excluir dados: " + str(e), "Error")
            return False

    # @cache.memoize(3600)
    def query(self, query, values=None):
        try:
            conn = self.connect()
            if conn is None:
                return None
            cursor = conn.cursor()
            if values is None:
                cursor.execute(query)
            else:
                cursor.execute(query, values)

            return [dict(
                (cursor.description[i][0], x) for i, x in enumerate(row)
            ) for row in cursor.fetchall()]
        except Exception as e:
            self.app.Log.insert(
                "Erro ao executar consulta: " + str(e),
                "Error"
            )
            return False
