from flask import Flask
from flask_cors import CORS
import os
from app.extensions import configurations

app = Flask(__name__,
            static_url_path='',
            static_folder='web/build',
            template_folder='web/build')
CORS(app)

app._cacheconfig = {
    "DEBUG": True,          # some Flask specific configs
    "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
}

configurations.init_app(app)
configurations.load_extensions(app)
app.Log.insert("Init "+os.environ["APP_NAME"], "print")

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=int(os.environ["FLASK_PORT"]))
