from flask import request, jsonify, render_template
from flask_httpauth import HTTPTokenAuth
from datetime import date, timedelta, datetime


def init_app(app):
    auth = HTTPTokenAuth(scheme='Bearer')
    # socketio = app.socketio

    @app.route("/")
    def index():
        return render_template('index.html')

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('index.html')

    @auth.verify_token
    def verify_token(token):
        return app.Token.validate(token)['success']

    @auth.get_user_roles
    def get_user_roles(user):
        return app.User.get(
            app.Token.get(
                auth.get_auth()['token']
            )['info']['user_uuid']
        )['user']['roles']

    @app.route('/api/test', methods=['GET'])
    def test_route():
        return jsonify({'success': True})

    @app.route('/api/suporte', methods=['POST', 'PUT', 'OPTIONS'])
    @auth.login_required
    def suporte():
        user = app.User.get(
            app.Token.get(
                auth.get_auth()['token']
            )['info']['user_uuid']
        )
        data = app.Functions.json_to_object(request.data)
        msg = 'Nome: ' + data['nome'] + '\n'
        msg += 'Email: ' + data['email'] + '\n'
        msg += 'Telefone: ' + data['telefone'] + '\n'
        msg += 'Mensagem: ' + data['mensagem'] + '\n'
        msg += 'Usuário: ' + user['user']['name'] + '\n'
        _return = app.Email.send({
            'to': 'smtp_user',
            'title': 'Mensagem de Suporte',
            'message': msg
        })
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/send_emails', methods=['GET'])
    def send_emails():
        data_atual = date.today().strftime("%Y-%m-%d")
        data_amanha = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
        os_vespera = app.Database.query(
            """select * from service_orders so
where data_prevista_inicio = '""" + data_amanha + """'
and send_email_vespera is NULL""",
        )
        os_hoje = app.Database.query(
            """select * from service_orders so
where data_prevista_inicio = '""" + data_atual + """'
and send_email_inicio is NULL""",
        )
        uuids_vespera = [x['uuid'] for x in os_vespera]
        uuids_hoje = [x['uuid'] for x in os_hoje]
        list_uuids = uuids_vespera + uuids_hoje
        oss = os_vespera + os_hoje
        persons = app.Persons.list(
            columns='uuid, name, email'
        )['persons']
        tecnicos = app.Database.select(
            table="service_orders_persons",
            where="service_orders_uuid IN (" + ",".join(["'" + x + "'" for x in list_uuids]) + ")",
        )['data']
        for obj in oss:
            os = app.ServiceOrders.get(obj['uuid'])
            if os['success']:
                sended = False
                tecnicos_obj = [x['person_uuid'] for x in tecnicos if x['service_orders_uuid'] == obj['uuid']]
                tecnicos_persons = [x for x in persons if x['uuid'] in tecnicos_obj]
                for person in tecnicos_persons:
                    send_email = app.Email.send({
                        'to': person['email'],
                        'title': 'Manutenção ' + os['service_order']['maintenance_type'] + ' ' + os['service_order']['installation']['name'] + (' amanhã' if obj['uuid'] in uuids_vespera else ' hoje'),
                        'message': 'Serviço de manutenção ' + os['service_order']['maintenance_type'] + ' marcado para' + (' amanhã' if obj['uuid'] in uuids_vespera else ' hoje') + ',  na instalação ' + os['service_order']['installation']['name'] + '.'
                    })
                    if send_email['success']:
                        sended = True
                if sended:
                    obj_save = {
                        'uuid': obj['uuid']
                    }
                    if obj['uuid'] in uuids_vespera:
                        obj_save['send_email_vespera'] = app.Functions.date_to_datetimebr(
                            datetime.now()
                        )
                    if obj['uuid'] in uuids_hoje:
                        obj_save['send_email_inicio'] = app.Functions.date_to_datetimebr(
                            datetime.now()
                        )
                    saved = app.GenericObject.save(
                        table='service_orders',
                        objeto=obj_save
                    )
        _return = {
            'success': True
        }
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/info', methods=['GET'])
    def info_route():
        _return = {
            'success': True,
            'info': app.Functions.myip()
        }
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/resetpassword', methods=['POST', 'OPTIONS'])
    def resetpassword():
        data = app.Functions.json_to_object(request.data)
        _return = app.User.reset_password(
            data['username']
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/login', methods=['POST', 'OPTIONS'])
    def login():
        data = app.Functions.json_to_object(request.data)
        _return = app.User.login(
            data['username'],
            data['password']
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/logoff', methods=['GET'])
    @auth.login_required
    def logoff():
        return jsonify(app.Token.invalidate(
            auth.get_auth()['token']
        ))

    @app.route('/api/user', methods=['GET'])
    @auth.login_required
    def get_user():
        _return = app.User.get(
            app.Token.get(
                auth.get_auth()['token']
            )['info']['user_uuid']
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/user/new_password', methods=['POST', 'OPTIONS'])
    @auth.login_required
    def set_new_password():
        data = app.Functions.json_to_object(request.data)
        user_uuid = app.Token.get(
            auth.get_auth()['token']
        )['info']['user_uuid']
        return jsonify(app.User.set_new_password(
            user_uuid,
            data['password'],
            data['new_password']
        ))

    @app.route('/api/users', methods=['GET'])
    @auth.login_required(role='administrador')
    def get_list():
        _return = app.User.get_list()
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/user/<uuid>', methods=['POST', 'OPTIONS'])
    @auth.login_required(role='administrador')
    def saveUser(uuid):
        data = app.Functions.json_to_object(request.data)
        _return = app.User.save({
            'uuid': data['uuid'],
            'username': data['username'],
            'email': data['email'],
        })
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/table_schema/<table>', methods=['GET'])
    @auth.login_required(role='administrador')
    def table_schema(table):
        _return = app.Database.table_schema(table)
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/configurations', methods=['GET'])
    def configurations_list():
        _return = app.ConfigurationsApp.list()
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>/<column>/sum', methods=['GET'])
    @auth.login_required
    def generic_sum(name, column):
        if not app.User.confirm_permission(auth, name, 'reading')['pass']:
            return jsonify({'success': False}), 401
        _return = app.Functions.get_class(name).sum(
            column,
            request_args=request.args,
            auth=auth
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>/all/count', methods=['GET'])
    @auth.login_required
    def generic_count(name):
        user = app.User.confirm_permission(auth, name, 'reading')
        if not user['pass']:
            return jsonify({'success': False}), 401
        _return = app.Functions.get_class(name).count(
            request_args=request.args,
            user=user
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>', methods=['GET'])
    @auth.login_required
    def generic_list(name):
        user = app.User.confirm_permission(auth, name, 'reading')
        if not user['pass']:
            return jsonify({'success': False}), 401
        _return = app.Functions.get_class(name).list(
            request_args=request.args,
            user=user
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>', methods=['POST', 'OPTIONS'])
    @auth.login_required
    def generic_create(name):
        user = app.User.confirm_permission(auth, name, 'writing')
        if not user['pass']:
            return jsonify({'success': False}), 401
        data = app.Functions.json_to_object(request.data)
        _return = app.Functions.get_class(name).save(
            objeto=data,
            user=user
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>/<uuid>', methods=['GET'])
    @auth.login_required
    def generic_get(name, uuid):
        user = app.User.confirm_permission(auth, name, 'reading')
        if not user['pass']:
            return jsonify({'success': False}), 401
        if name == 'dashboards':
            _return = app.Functions.get_class(name).get(uuid, request.args)
        else:
            _return = app.Functions.get_class(name).get(uuid)
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>/<uuid>', methods=['PUT', 'OPTIONS'])
    @auth.login_required
    def generic_save(name, uuid):
        user = app.User.confirm_permission(auth, name, 'writing')
        if not user['pass']:
            return jsonify({'success': False}), 401
        data = app.Functions.json_to_object(request.data)
        _return = app.Functions.get_class(name).save(
            objeto=data,
            user=user
        )
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/object/<name>/<uuid>', methods=['DELETE', 'OPTIONS'])
    @auth.login_required
    def generic_delete(name, uuid):
        user = app.User.confirm_permission(auth, name, 'writing')
        if not user['pass']:
            return jsonify({'success': False}), 401
        _return = app.Functions.get_class(name).delete(uuid)
        code = 200
        if 'success' in _return and not _return['success']:
            code = 500
        return jsonify(_return), code

    @app.route('/api/teste', methods=['GET'])
    @auth.login_required
    def teste_route():
        return jsonify({'success': True})

    @app.errorhandler(500)
    def app_handle_500(error):
        return str(error), 500

    return app
