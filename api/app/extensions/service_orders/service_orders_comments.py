from app.extensions.generic_object import GenericObject
from datetime import datetime


def init_app(app, init_log=True):
    app.ServiceOrdersComments = ServiceOrdersComments(app)
    return app


class ServiceOrdersComments(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'service_order_comment'
        self.table = 'service_orders_comments'

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            objeto = kwargs.get('objeto')
            user = kwargs.get('user')
            objeto['person_uuid'] = user['user']['person_uuid']
            objeto['on_save'] = self.app.Functions.date_to_datetimebr(datetime.now())
            _return = super().save(
                objeto=objeto,
                user=user
            )
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return