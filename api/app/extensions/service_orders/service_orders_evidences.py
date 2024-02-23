from app.extensions.generic_object import GenericObject


def init_app(app, init_log=True):
    app.ServiceOrdersEvidences = ServiceOrdersEvidences(app)
    return app


class ServiceOrdersEvidences(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'service_order_evidence'
        self.table = 'service_orders_evidences'
