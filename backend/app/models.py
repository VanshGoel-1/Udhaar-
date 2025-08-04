# /backend/app/models.py

from . import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'customer' or 'shopkeeper'
    
    # New fields for Profile page
    address = db.Column(db.Text, nullable=True)
    society_name = db.Column(db.String(150), nullable=True)
    monthly_limit = db.Column(db.Float, default=0.0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Shop(db.Model):
    __tablename__ = 'shops'
    id = db.Column(db.Integer, primary_key=True)
    shop_name = db.Column(db.String(150), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner = db.relationship('User', backref=db.backref('shop', uselist=False))

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), default='General')
    shop = db.relationship('Shop', backref=db.backref('products', lazy=True))

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False) # 'purchase' or 'payment'
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    customer = db.relationship('User', backref=db.backref('transactions', lazy=True))
    shop = db.relationship('Shop', backref=db.backref('transactions', lazy=True))

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    items_json = db.Column(db.Text, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default='pending') # pending, accepted, out-for-delivery, completed, rejected
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    customer = db.relationship('User', backref=db.backref('orders', lazy=True))
