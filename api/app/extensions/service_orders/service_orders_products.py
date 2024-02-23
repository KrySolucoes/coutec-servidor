from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.ServiceOrdersProducts = ServiceOrdersProducts(app)
    return app


class ServiceOrdersProducts(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'service_order_products'
        self.table = 'service_orders_products'

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            objeto = kwargs.get('objeto')
            replicate = kwargs.get('replicate')
            if replicate is None:
                replicate = True
            service = self.app.ServiceOrders.get(
                objeto['service_orders_uuid']
            )['service_order']
            if service['status']['order'] <= 3:
                _return = super().save(**kwargs)
                if _return['success'] and replicate:
                    new_obj = self.get(_return['uuid'])[self.name]
                    orders = self.app.GenericObject.list(
                        table='service_orders',
                        where='parent_service_orders_uuid=%s',
                        values=[service['uuid']]
                    )['service_orders']
                    for order in orders:
                        new_obj['uuid'] = None
                        new_obj['service_orders_uuid'] = order['uuid']
                        self.save(
                            objeto=new_obj,
                            replicate=False
                        )
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return
