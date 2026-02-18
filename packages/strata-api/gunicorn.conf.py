import os

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = min(int(os.getenv("WEB_CONCURRENCY", "2")), 8)
worker_class = "uvicorn.workers.UvicornWorker"
accesslog = "-"
errorlog = "-"
graceful_timeout = 30
timeout = 120
keepalive = 5
