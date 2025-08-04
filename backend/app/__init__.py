# /backend/app/__init__.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    app.config.update(
        SECRET_KEY='a_very_secret_and_secure_key_for_udhaar_plus',
        SQLALCHEMY_DATABASE_URI='sqlite:///' + os.path.join(base_dir, 'udhaar_plus.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    db.init_app(app)
    socketio.init_app(app)
    CORS(app)

    from . import routes
    app.register_blueprint(routes.api, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app
