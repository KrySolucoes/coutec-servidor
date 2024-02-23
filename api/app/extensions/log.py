from datetime import datetime


def init_app(app, init_log=True):
    app.Log = Log(app)
    return app


class Log:
    def __init__(self, app):
        self.app = app
        self.last_log = None
        self.logs = []

    def get(self, reference=None):
        try:
            return [x for x in self.logs if x['reference'] == reference]
        except Exception as e:
            now = datetime.now()
            print(
                "**",
                now.strftime("%Y-%m-%d %H:%M:%S.%f"),
                "Erro ao buscar logs",
                str(e)
            )
            return []

    def insert(self, message, severity=None, data=None, reference=None):
        try:
            if reference is None:
                reference = self.app.Functions.new_uuid()
            if severity is None:
                severity = "info"

            severity = severity.lower().capitalize()
            now = datetime.now()
            data = ("" if data is None
                    else "\n" +
                    self.app.Functions.object_to_json(
                        data
                    ))

            if (self.last_log is None or
               self.last_log['data'] != data or
               self.last_log['message'] != message or
               self.last_log['severity'] != severity):
                log_data = {
                    'data': data,
                    'message': message,
                    'severity': severity,
                    'reference': reference
                }
                self.last_log = log_data
                self.logs.append(log_data)
                if severity == "error":
                    print(
                        now.strftime("%Y-%m-%d %H:%M:%S.%f"),
                        severity,
                        reference,
                        message,
                        data,
                    )

            return True
        except Exception as e:
            print(
                "**",
                now.strftime("%Y-%m-%d %H:%M:%S.%f"),
                "Erro ao inserir novo log",
                str(e)
            )
            return False
