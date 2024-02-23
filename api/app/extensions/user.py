import bcrypt


def init_app(app, init_log=True):
    app.User = User(app)
    return app


class User:
    def __init__(self, app):
        self.app = app

    def get_list(self):
        _return = {'success': False}
        try:
            query = """select u.*, p.email, p.email as username, p2.name as roles, p.status
            from  users u
            inner join persons p 
            on u.person_uuid = p.uuid 
            inner join profiles p2 
            on p.profile_uuid = p2.uuid
            where p.status='Ativo'"""
            users_database = self.app.Database.query(
                query
            )
            users = []
            for user in users_database:
                if user['roles'] is None:
                    user['roles'] = 'user'
                users.append({
                    'uuid': user['uuid'],
                    'username': user['username'],
                    'email': user['email'],
                    'roles': user['roles'].replace("; ", ";").split(";"),
                    'status': user['status'],
                })
            _return = {
                'success': True,
                'users': users
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar usuario: " + str(e), "Error")
        return _return

    def get(self, uuid, username=None, get_permissions=True):
        _return = {'success': False}
        try:
            query = """select u.*, p.name, p.image_uuid, p.email, p.email as username, p2.name as roles
            from  users u
            inner join persons p 
            on u.person_uuid = p.uuid 
            inner join profiles p2 
            on p.profile_uuid = p2.uuid"""
            user = []
            if uuid is not None:
                user = self.app.Database.query(
                    query + " WHERE u.uuid=%s",
                    [uuid]
                )
            else:
                user = self.app.Database.query(
                    query + " WHERE p.email=%s",
                    [username]
                )
            if len(user) == 0:
                _return = {
                    'success': False,
                    'errors': {
                        'user': "not registered"
                    }
                }
            else:
                if user[0]['roles'] is None:
                    user[0]['roles'] = 'user'
                permissions = []
                if get_permissions:
                    permissions = self.permissions(
                        user[0]['uuid']
                    )['permissions']
                _return = {
                    'success': True,
                    'user': {
                        'name': user[0]['name'],
                        'uuid': user[0]['uuid'],
                        'person_uuid': user[0]['person_uuid'],
                        'image_uuid': user[0]['image_uuid'],
                        'username': user[0]['username'],
                        'email': user[0]['email'],
                        'roles': user[0]['roles'].lower().replace("; ", ";").split(";"),
                        'permissions': permissions
                    }
                }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar usuario: " + str(e), "Error")
        return _return

    def set_new_password(self, uuid, password, new_password):
        _return = {'success': False}
        try:
            query = """select u.*, p.name, p.image_uuid, p.email, p.email as username, p2.name as roles
            from  users u
            inner join persons p 
            on u.person_uuid = p.uuid 
            inner join profiles p2 
            on p.profile_uuid = p2.uuid"""
            user = self.app.Database.query(
                query +" WHERE u.uuid=%s",
                [uuid]
            )
            if len(user) == 0:
                _return = {
                    'success': False,
                    'errors': {
                        'user': "not registered"
                    }
                }
            else:
                def confirm_password(pass1, pass2):
                    return bcrypt.hashpw(
                        pass1.encode('utf8'),
                        pass2.encode('utf8')
                    ) == pass2.encode('utf8')
                update_ = False
                if confirm_password(password, user[0]['password']):
                    update_ = self.app.Database.update(
                        "users",
                        "auto_password",
                        "uuid=%s",
                        (
                            bcrypt.hashpw(
                                new_password.encode('utf8'),
                                bcrypt.gensalt(8)
                            ).decode(),
                            user[0]['uuid']
                        )
                    )
                if update_ is True:
                    self.app.Email.send({
                        'to': user[0]['email'],
                        'title': 'Nova senha de acesso',
                        'message': 'Olá, sua nova senha de acesso ao sistema é: '+new_password
                    })
                    _return = {
                        'success': True
                    }
                else:
                    _return = {
                        'success': False,
                        'errors': {
                            'user': "not reset"
                        }
                    }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar usuario: " + str(e), "Error")
        return _return

    def reset_password(self, email):
        _return = {'success': False}
        try:
            users = self.get_list()['users']
            user = [x for x in users if x['email'] == email]
            if len(user) > 0:
                password = self.app.Functions.new_password()
                update_ = self.app.Database.update(
                    "users",
                    "auto_password",
                    "uuid=%s",
                    (
                        bcrypt.hashpw(
                            password.encode('utf8'),
                            bcrypt.gensalt(8)
                        ).decode(),
                        user[0]['uuid']
                    )
                )
                if update_ is True:
                    send_email = self.app.Email.send({
                        'to': user[0]['email'],
                        'title': 'Nova senha de acesso',
                        'message': 'Olá, sua nova senha de acesso ao sistema é: '+password
                    })
                    if send_email['success'] is True:
                        _return = {
                            'success': True
                        }
                else:
                    _return = {
                        'success': False,
                        'errors': {
                            'user': "not reset"
                        }
                    }
            else:
                _return = {
                    'success': False,
                    'errors': {
                        'user': "not registered"
                    }
                }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar usuario: " + str(e), "Error")
        return _return

    def save(self, user):
        _return = {'success': False}
        try:
            teste = ''
            # if self.app.Functions.is_null_or_empty(user, 'uuid'):
            #     user['uuid'] = self.app.Functions.new_uuid()
            #     insert = self.app.Database.insert(
            #         "users",
            #         "uuid, username, password, email, roles, ativo",
            #         [
            #             user['uuid'],
            #             user['username'],
            #             bcrypt.hashpw(
            #                 "12345678".encode('utf8'),
            #                 bcrypt.gensalt(8)
            #             ).decode(),
            #             user['email'],
            #             user['roles'],
            #             user['ativo'],
            #         ]
            #     )
            #     if insert:
            #         _return = {
            #             'success': True,
            #             'uuid': user['uuid']
            #         }
            # else:
            #     update_ = False
            #     update_ = self.app.Database.update(
            #         "users",
            #         "username, email, roles",
            #         "uuid=%s",
            #         (
            #             user['username'],
            #             user['email'],
            #             user['roles'],
            #             user['uuid'],
            #         )
            #     )
            #     if update_:
            #         _return = {
            #             'success': True,
            #             'uuid': user['uuid']
            #         }
        except Exception as e:
            self.app.Log.insert(
                "Erro ao fazer salvar usuário: " + str(e),
                "Error"
            )
        return _return

    def login(self, username, password):
        _return = {'success': False}
        try:
            def confirm_password(pass1, pass2):
                return bcrypt.hashpw(
                    pass1.encode('utf8'),
                    pass2.encode('utf8')
                ) == pass2.encode('utf8')

            query = """select u.*, p.email, p.email as username, p2.name as roles
            from  users u
            inner join persons p 
            on u.person_uuid = p.uuid 
            inner join profiles p2 
            on p.profile_uuid = p2.uuid"""
            user = self.app.Database.query(
                query + " WHERE p.email=%s AND p.status='Ativo'",
                [username]
            )
            if len(user) == 0:
                _return = {
                    'success': False,
                    'errors': {
                        'username': "not registered"
                    }
                }
            elif user[0] and confirm_password(password, user[0]['password']):
                _return = self.app.Token.new(user[0]['uuid'])
            elif user[0] and confirm_password(password, user[0]['auto_password']):
                self.app.Database.update(
                    "users",
                    "password, auto_password",
                    "uuid=%s",
                    (
                        user[0]['auto_password'],
                        None,
                        user[0]['uuid']
                    )
                )
                _return = self.app.Token.new(user[0]['uuid'])
            else:
                _return = {
                    'success': False,
                    'errors': {
                        'password': "The password is incorrect. Try again or recover it."
                    }
                }
        except Exception as e:
            self.app.Log.insert("Erro ao fazer login: " + str(e), "Error")
        return _return

    def permissions(self, uuid):
        _return = {'success': False}
        try:
            user = self.get(
                uuid,
                None,
                False
            )['user']
            permissions = {
                'writing': [],
                'reading': []
            }
            permissions_base = self.app.Database.query(
                "SELECT * FROM permissions"
            )
            permissions_base = [x for x in permissions_base if x['role'] in user['roles']]
            for x in permissions_base:
                writing = '' if x['writing'] is None else x['writing']
                reading = '' if x['reading'] is None else x['reading']
                permissions['writing'].extend(writing.lower().replace("; ", ";").split(";"))
                permissions['reading'].extend(reading.lower().replace("; ", ";").split(";"))
            _return = {
                'success': True,
                'permissions': permissions,
                'user': user
            }
        except Exception as e:
            self.app.Log.insert("Erro confirm_permission: " + str(e), "Error")
        return _return

    def confirm_permission(self, auth, _object, _type='writing'):
        _return = {'success': False}
        try:
            _pass = False
            _permissions = self.permissions(
                self.app.Token.get(
                    auth.get_auth()['token']
                )['info']['user_uuid']
            )
            permissions = _permissions['permissions']
            if '*' in permissions['writing']:
                _pass = True
            if _object in permissions['writing']:
                _pass = True
            if '*' in permissions[_type]:
                _pass = True
            if _object in permissions[_type]:
                _pass = True
            _return = {
                'success': True,
                'pass': _pass,
                'permissions': permissions,
                'auth': auth,
                'user': _permissions['user']
            }
        except Exception as e:
            self.app.Log.insert("Erro confirm_permission: " + str(e), "Error")
        return _return
