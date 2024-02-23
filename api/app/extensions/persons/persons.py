from app.extensions.generic_object import GenericObject
import bcrypt


def init_app(app, init_log=True):
    app.Persons = Persons(app)
    return app


class Persons(GenericObject):
    def __init__(self, app):
        self.app = app
        self.name = 'person'
        self.table = 'persons'

    def get(self, uuid):
        _return = {'success': False}
        try:
            _return = super().get(uuid)
            if _return['success']:
                if _return[self.name]['installation_uuid'] is not None:
                    _return[self.name]['installation_uuid'] = _return[self.name]['installation_uuid'].split(';')
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def list(self, **kwargs):
        _return = {'success': False}
        try:
            data = super().list(**kwargs)[self.table]
            for obj in data:
                if 'installation_uuid' in obj:
                    if obj['installation_uuid'] is not None:
                        obj['installation_uuid'] = obj['installation_uuid'].split(';')
                if 'profile_uuid' in obj:
                    if obj['profile_uuid'] is not None:
                        profile = [x for x in self.app.Profiles.list()['profiles'] if x['uuid'] == obj['profile_uuid']]
                        if len(profile) > 0:
                            obj['profile'] = profile[0]
                        else:
                            obj['profile'] = {
                                'name': None,
                                'uuid': None
                            }
            _return = {
                'success': True,
                self.table: data,
                'data_name': self.table
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar GenericObject "+self.table+": " + str(e), "Error")
        return _return

    def save(self, **kwargs):
        _return = {'success': False}
        try:
            objeto = kwargs.get('objeto')
            if 'installation_uuid' in objeto:
                objeto['installation_uuid'] = ';'.join(objeto['installation_uuid'])
            user = kwargs.get('user')
            _return = super().save(
                objeto=objeto,
                user=user
            )
            if _return['success']:
                user = self.app.Database.query(
                    "SELECT * FROM users WHERE person_uuid=%s",
                    [_return['uuid']]
                )
                if len(user) == 0:
                    password = "12345678"
                    self.app.Database.generic_save(
                        'users',
                        {
                            'password': bcrypt.hashpw(
                                password.encode('utf8'),
                                bcrypt.gensalt(8)
                            ).decode(),
                            'person_uuid': _return['uuid']
                        }
                    )
                    person = self.get(_return['uuid'])[self.name]
                    self.app.Email.send({
                        'to': person['email'],
                        'title': 'Cadastro realizado com sucesso',
                        'message': 'Olá, sua nova senha de acesso ao sistema é: '+password
                    })
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar GenericObject "+self.table+": " + str(e),
                "Error"
            )
        return _return
