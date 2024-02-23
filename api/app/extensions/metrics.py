from flask import request, make_response
from prometheus_client import Counter, Histogram
import time
import os


def init_app(app):
    app.Metrics = Metrics(app)
    return app


class Metrics:
    def __init__(self, app):
        self.app = app
        self.REQUEST_COUNT = Counter(
            'request_count',
            'App Request Count',
            [
                os.environ["APP_NAME"],
                'method',
                'endpoint',
                'http_status'
            ]
        )
        self.REQUEST_LATENCY = Histogram(
            'request_latency_seconds',
            'Request latency',
            [
                os.environ["APP_NAME"],
                'endpoint'
            ]
        )
        self.setup_metrics()

    def start_timer(self):
        request.start_time = time.time()
        self.app.Log.insert(str.format(
            "[{}][{}]\n{}",
            request.method,
            request.url,
            str(request.data)
        ), "print")
        if request.method == "OPTIONS":  # CORS preflight
            return self._build_cors_prelight_response()

    def _build_cors_prelight_response(self):
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

    def stop_timer(self, response):
        resp_time = time.time() - request.start_time
        self.REQUEST_LATENCY.labels(
            os.environ["APP_NAME"],
            request.path
        ).observe(resp_time)
        data = ""
        if response.direct_passthrough:
            data = "direct_passthrough"
        elif type(response.data) == bytes or type(response.data) == str:
            data = str(response.data)

        self.app.Log.insert(str.format(
            "RESPONSE {} [{}][{}]\n{}",
            response.status,
            request.method,
            request.url,
            data
        ), "print")
        return response

    def record_request_data(self, response):
        self.REQUEST_COUNT.labels(
            os.environ["APP_NAME"],
            request.method,
            request.path,
            response.status_code
        ).inc()
        return response

    def setup_metrics(self):
        self.app.before_request(self.start_timer)
        self.app.after_request(self.record_request_data)
        self.app.after_request(self.stop_timer)
