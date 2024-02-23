import os
import json
import uuid
import re
import string
import socket
from requests import get
from random import choice
from datetime import date, datetime, timedelta, timezone, time


def init_app(app):
    app.Functions = Functions(app)
    return app


class Functions:
    def __init__(self, app):
        self.app = app

    def map(self, x, in_min, in_max, out_min, out_max):
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

    def get_class(self, name):
        return getattr(self.app, ''.join([x.capitalize() for x in name.split('_')]))

    def parse_bool(self, s):
        return s.lower() in ['true', '1', 't', 'y', 'yes']

    def myip(self):
        try:
            hostname = socket.gethostname()
            ip_interno = socket.gethostbyname(hostname)
            ip_externo = get('https://api.ipify.org').text
            return {
                'hostname': hostname,
                'ip_interno': ip_interno,
                'ip_externo': ip_externo,
            }
        except ValueError:
            return None

    def isnumber(self, value):
        try:
            float(value)
        except ValueError:
            return False
        return True

    def byte_to_string(self, tx_byte):
        if type(tx_byte) == bytes:
            return tx_byte.decode()
        return str(tx_byte)

    def clone(self, obj):
        return self.json_to_object(
            self.object_to_json(obj)
        )

    def object_to_json(self, obj):
        def default(o):
            if isinstance(o, (date, datetime)):
                d = o.isoformat()
                d = self.datestr_to_local(d).isoformat()
                return d
        return json.dumps(
                      obj,
                      sort_keys=True,
                      default=default
                    )

    def json_to_object(self, json_,):
        return json.loads(self.byte_to_string(json_))

    def new_uuid(self, hyphens=True):
        if hyphens:
            return str(uuid.uuid4())
        else:
            return uuid.uuid4().hex

    def mes(self, data):
        try:
            day = data.strftime("%m")
            dias = [
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro'
            ]
            return dias[int(day) - 1]
        except ValueError:
            return None

    def dia_semana(self, data, _number=False):
        try:
            day = data.isoweekday()
            if _number:
                return day
            dias = [
                'Domingo',
                'Segunda-feira',
                'Terça-feira',
                'Quarta-feira',
                'Quinta-feira',
                'Sexta-feira',
                'Sábado',
                'Domingo'
            ]
            return dias[day]
        except ValueError:
            return None

    def date_to_json(self, obj_date):
        d_json = self.object_to_json(obj_date)
        d = self.json_to_object(d_json)
        return d

    def date_to_local(self, date):
        d = self.date_to_json(date)
        return self.datestr_to_local(d)

    def date_to_datebr(self, date_):
        if date_ is None or date_ == '':
            return None
        if type(date_) != datetime and type(date_) != date and type(date_) != time:
            return date_
        return date_.strftime("%d/%m/%Y")

    def date_to_datetime(self, date_):
        return datetime(
            year=date_.year,
            month=date_.month,
            day=date_.day,
        )

    def date_to_datetimebr(self, date_):
        if date_ is None or date_ == '':
            return None
        if type(date_) != datetime and type(date_) != date and type(date_) != time:
            return date_
        return self.datestr_to_local(date_.astimezone().isoformat()).strftime("%d/%m/%Y %H:%M:%S-03:00")

    def time_to_timebr(self, date_):
        if date_ is None or date_ == '':
            return None
        if type(date_) != datetime and type(date_) != date and type(date_) != time:
            return date_
        return date_.strftime("%H:%M:%S")

    def date_diff(self, date01, date02):
        if date01 is None or date01 == '':
            return None
        if date02 is None or date02 == '':
            return None
        delta = date02 - date01
        return delta.days

    def datebr_diff(self, datebr01, datebr02):
        if datebr01 is None or datebr01 == '':
            return None
        if datebr02 is None or datebr02 == '':
            return None
        date01 = self.datebr_to_date(datebr01)
        date02 = self.datebr_to_date(datebr02)
        delta = date02 - date01
        return delta.days

    def datebr_to_date(self, datebr, hour=True):
        if datebr is None or datebr == '':
            return None
        _datesplit = datebr.split(' ')
        _date = _datesplit[0].split('/')
        _hour = '12:00:00-03:00'
        if len(_datesplit) > 1:
            _hour = _datesplit[1]
        if hour:
            return self.datestr_to_local(
                _date[2] + '-' + _date[1] + '-' + _date[0] + 'T' + _hour
            )
        else:
            return _date[2] + '-' + _date[1] + '-' + _date[0]

    def datestr_to_local(self, str_date):
        if str_date is None or str_date == '':
            return None
        str_date = str_date.replace("Z", "")
        date = str_date[0:19]
        local = str_date[19:]
        diferenca = -3
        if re.search('\\:\\b', local, re.IGNORECASE):
            t = local[-6:]
            t_ = int(t.split(':')[0]) + int(int(t.split(':')[1]) / 60)
            diferenca = diferenca - t_

        date_ = datetime.fromisoformat(date)
        date_ = date_ + timedelta(hours=diferenca)
        date_ = datetime.fromisoformat(
            date_.strftime("%Y-%m-%dT%H:%M:%S-03:00")
        )
        return date_

    def read_text_file(self, file, encoding="ISO-8859-1"):
        if os.path.isfile(file):
            f = open(file, "r", encoding=encoding)
            file_read = f.read()
            return file_read

        return None

    def read_json(self, file):
        if os.path.isfile(file):
            file_read = self.read_text_file(file)
            data = json.loads(self.byte_to_string(file_read))
            return data
        return None

    def new_password(self, len=10):
        try:
            values_ = string.ascii_lowercase + string.digits
            password = ''
            for i in range(len):
                password += choice(values_)
            return password
        except Exception:
            return None

    def is_null_or_empty(self, object_, value_=None):
        try:
            if value_ is None:
                return (object_ is None or object_ == "")
            else:
                return (object_[value_] is None or object_[value_] == "")
        except Exception:
            return True
