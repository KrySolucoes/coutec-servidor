from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.ServiceOrdersStatus = ServiceOrdersStatus(app)
    return app


class ServiceOrdersStatus(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'service_order_status'
        self.table = 'service_orders_status'
