import os
import datetime


def init_app(app, init_log=True):
    app.Token = Token(app)
    return app


class Token:
    def __init__(self, app):
        self.app = app

    def get(self, token):
        _return = {'success': False}
        try:
            token = self.app.Database.query(
                "SELECT * FROM tokens WHERE token=%s AND valid",
                [token]
            )
            if len(token) == 1:
                _return = {
                    'success': True,
                    'info': token[0]
                }
        except Exception as e:
            self.app.Log.insert("Erro ao validar token: " + str(e), "Error")
        return _return

    def validate(self, token):
        _return = {'success': False}
        try:
            token = self.get(token)
            if token['success']:
                _return = {
                    'success': True,
                    'token': token['info']['token']
                }
        except Exception as e:
            self.app.Log.insert("Erro ao validar token: " + str(e), "Error")
        return _return

    def invalidate(self, token):
        _return = {'success': False}
        try:
            token = self.get(token)['info']
            update_ = self.app.Database.update(
                "tokens",
                "valid",
                "uuid=%s",
                (
                    False,
                    token['uuid'],
                )
            )
            if update_:
                _return = {
                    'success': True
                }
        except Exception as e:
            self.app.Log.insert("Erro ao invalidar token: " + str(e), "Error")
        return _return

    def new(self, user_uuid):
        _return = {'success': False}
        try:
            uuid = self.app.Functions.new_uuid()
            token = (
                uuid
                + user_uuid.replace("-", "")
                + self.app.Functions.new_uuid()
                + self.app.Functions.new_uuid()
            )

            insert = self.app.Database.insert(
                "tokens",
                "uuid, user_uuid, token, expiration_date, valid",
                [
                    uuid,
                    user_uuid,
                    token,
                    datetime.datetime.now() + datetime.timedelta(
                        seconds=int(
                            os.environ["APP_AUTHORIZATION_EXPIRATION_SECS"]
                        )
                    ),
                    True
                ]
            )
            if insert:
                _return = {
                    'success': True,
                    'token': token,
                    'user_uuid': user_uuid
                }
        except Exception as e:
            self.app.Log.insert("Erro ao gerar token: " + str(e), "Error")
        return _return
