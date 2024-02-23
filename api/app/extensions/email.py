from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl


def init_app(app, init_log=True):
    app.Email = Email(app)
    return app


class Email:
    def __init__(self, app):
        self.app = app

    def send(self, email):
        _return = {'success': False}
        try:
            config = self.app.ConfigurationsApp.list(
                public=False
            )['configurations']

            if email['to'] == 'smtp_user':
                email['to'] = config['smtp_user']
            mail_to = email['to']
            mail_subject = email['title']
            mail_body = email['message']

            mimemsg = MIMEMultipart()
            mimemsg['From'] = config['smtp_user']
            mimemsg['To'] = mail_to
            mimemsg['Subject'] = mail_subject
            mimemsg.attach(MIMEText(mail_body, 'plain'))

            connection = None
            if config['smtp_ssl'] == 'Ativo':
                context = ssl.create_default_context()
                connection = smtplib.SMTP_SSL(
                    host=config['smtp_host'],
                    port=int(config['smtp_port']),
                    context=context
                )
            else:
                connection = smtplib.SMTP(
                    host=config['smtp_host'],
                    port=int(config['smtp_port'])
                )
                connection.starttls()
            connection.login(
                config['smtp_user'],
                config['smtp_password']
            )
            connection.send_message(mimemsg)
            connection.quit()

            _return = {
                'success': True,
                'message': "successfully sent email to :" + mail_to
            }
        except Exception as e:
            self.app.Log.insert("Erro ao buscar exchanges: " + str(e), "Error")
        return _return
