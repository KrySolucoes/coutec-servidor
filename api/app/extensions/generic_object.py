
def init_app(app, init_log=True):
    app.GenericObject = GenericObject(app)
    return app


class GenericObject:
    def __init__(self, app):
        self.app = app
        self.name = None
        self.table = None

    def sum(self, column, **kwargs):
        _return = {'success': False}
        try:
            request_args = kwargs.get('request_args')
            size = None if request_args is None else request_args.get('size')
            page = None if request_args is None else request_args.get('page')
            order = None if request_args is None else request_args.get('order')
            odata = None if request_args is None else request_args.get('filter')
            table = kwargs.get('table')
            if table is None:
                table = self.table
            data_name = column+'_sum'
            _cachename = table+'sum'+str(kwargs)
            _cache = self.app.Cache.get(_cachename)
            if _cache is not None:
                return _cache
            _return = {
                'success': True,
                data_name: self.app.Database.select(
                    table=table,
                    size=size,
                    page=page,
                    order=order,
                    odata=odata,
                    sum=column
                )['data'],
                'data_name': data_name
            }
            self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+table+": " + str(e), "Error")
        return _return

    def count(self, **kwargs):
        _return = {'success': False}
        try:
            request_args = kwargs.get('request_args')
            where = kwargs.get('where')
            size = None if request_args is None else request_args.get('size')
            page = None if request_args is None else request_args.get('page')
            order = None if request_args is None else request_args.get('order')
            odata = None if request_args is None else request_args.get('filter')
            table = kwargs.get('table')
            if table is None:
                table = self.table
            data_name = table+'_count'
            _cachename = table+'count'+str(kwargs)
            _cache = self.app.Cache.get(_cachename)
            if _cache is not None:
                return _cache
            _return = {
                'success': True,
                data_name: self.app.Database.select(
                    table=table,
                    size=size,
                    page=page,
                    order=order,
                    odata=odata,
                    where=where,
                    count='*'
                )['data'],
                'data_name': data_name
            }
            self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+table+": " + str(e), "Error")
        return _return

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            request_args = kwargs.get('request_args')
            where = kwargs.get('where')
            values = kwargs.get('values')
            columns = kwargs.get('columns')
            size = None if request_args is None else request_args.get('size')
            page = None if request_args is None else request_args.get('page')
            order = None if request_args is None else request_args.get('order')
            odata = None if request_args is None else request_args.get('filter')
            table = kwargs.get('table')
            use_cache = kwargs.get('use_cache')
            if use_cache is None:
                use_cache = True
            if table is None:
                table = self.table
            _cachename = table+'list'+str(kwargs)
            _cache = self.app.Cache.get(_cachename)
            if _cache is not None and use_cache:
                return _cache
            _return = {
                'success': True,
                table: self.app.Database.select(
                    table=table,
                    size=size,
                    page=page,
                    order=order,
                    odata=odata,
                    where=where,
                    values=values,
                    columns=columns
                )['data'],
                'data_name': table
            }
            self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+table+": " + str(e), "Error")
        return _return

    def get(self, uuid):
        _return = {'success': False}
        try:
            _cachename = self.table+'get'+uuid
            _cache = self.app.Cache.get(_cachename)
            if _cache is not None:
                return _cache
            _return = {
                'success': True,
                self.name: self.app.Database.get_by_uuid(
                    self.table,
                    uuid
                )['data'],
                'data_name': self.name
            }
            self.app.Cache.set(_cachename, _return)
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            table = kwargs.get('table')
            if table is None:
                table = self.table
            self.app.Cache.delete(table)
            objeto = kwargs.get('objeto')
            _return = self.app.Database.generic_save(table, objeto)
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return

    def delete(self, uuid):
        _return = {'success': False}
        try:
            self.app.Cache.delete(self.table)
            _return = {
                'success': self.app.Database.delete(
                    self.table,
                    "uuid=%s",
                    [uuid]
                )
            }
        except Exception as e:
            self.app.Log.insert("Erro ao excluir GenericObject "+self.table+": " + str(e), "Error")
        return _return
