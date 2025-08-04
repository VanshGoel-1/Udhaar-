# /backend/app/routes.py

from flask import Blueprint, request, jsonify
from . import socketio # Import socketio instance
from .models import db, User, Shop, Product, Order, Transaction
import json
from sqlalchemy import func

api = Blueprint('api', __name__)

# --- User & Auth Routes ---
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'status': 'error', 'message': 'Username already exists'}), 409
    
    new_user = User(username=data['username'], name=data['name'], role=data['role'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    if new_user.role == 'shopkeeper':
        shop_name = data.get('shop_name', f"{new_user.name}'s Store")
        new_shop = Shop(shop_name=shop_name, owner_id=new_user.id)
        db.session.add(new_shop)
        db.session.commit()
        
    return jsonify({'status': 'success', 'message': 'User registered successfully'}), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not user.check_password(data.get('password')):
        return jsonify({'status': 'error', 'message': 'Invalid username or password'}), 401
    
    user_data = {
        'id': user.id, 
        'name': user.name, 
        'username': user.username, 
        'role': user.role,
        'address': user.address,
        'society_name': user.society_name,
        'monthly_limit': user.monthly_limit
    }
    if user.role == 'shopkeeper':
        shop = Shop.query.filter_by(owner_id=user.id).first()
        if shop:
            user_data['shop_id'] = shop.id
            user_data['shop_name'] = shop.shop_name
            
    return jsonify({'status': 'success', 'user': user_data}), 200

@api.route('/user/<int:user_id>/profile', methods=['PUT'])
def update_profile(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.name = data.get('name', user.name)
    user.address = data.get('address', user.address)
    user.society_name = data.get('society_name', user.society_name)
    user.monthly_limit = data.get('monthly_limit', user.monthly_limit)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Profile updated successfully'})

# --- Shop, Product, & Order Routes ---
@api.route('/shops', methods=['GET'])
def get_shops():
    shops = db.session.query(Shop, User.name).join(User, Shop.owner_id == User.id).all()
    return jsonify([{'id': shop.id, 'shop_name': shop.shop_name, 'owner_name': owner_name} for shop, owner_name in shops])

@api.route('/products', methods=['GET'])
def get_products():
    shop_id = request.args.get('shop_id')
    products = Product.query.filter_by(shop_id=shop_id).order_by(Product.name).all()
    return jsonify([{'id': p.id, 'name': p.name, 'price': p.price, 'category': p.category} for p in products])

@api.route('/orders', methods=['POST'])
def place_order():
    data = request.get_json()
    items_json = json.dumps(data['items'])
    total_amount = sum(item['price'] * item['quantity'] for item in data['items'])
    
    new_order = Order(
        customer_id=data['customer_id'], 
        shop_id=data['shop_id'], 
        items_json=items_json, 
        total_amount=total_amount
    )
    db.session.add(new_order)
    db.session.commit()

    # *** REAL-TIME NOTIFICATION TO SHOPKEEPER ***
    # Emitting an event to a specific room for the shop
    order_data_for_socket = {
        'id': new_order.id,
        'customer_name': new_order.customer.name,
        'total_amount': new_order.total_amount,
        'status': new_order.status,
        'timestamp': new_order.timestamp.isoformat(),
        'items': json.loads(new_order.items_json)
    }
    socketio.emit('new_order', order_data_for_socket, room=f'shop_{data["shop_id"]}')
    
    return jsonify({'status': 'success', 'order_id': new_order.id}), 201

@api.route('/shop/<int:shop_id>/orders', methods=['GET'])
def get_shop_orders(shop_id):
    orders = Order.query.filter_by(shop_id=shop_id).order_by(Order.timestamp.desc()).all()
    return jsonify([{
        'id': o.id, 'customer_name': o.customer.name, 'total_amount': o.total_amount,
        'status': o.status, 'timestamp': o.timestamp.isoformat(), 'items': json.loads(o.items_json)
    } for o in orders])

@api.route('/order/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.json.get('status')
    order.status = new_status
    
    if new_status == 'completed':
        items = json.loads(order.items_json)
        description = ", ".join([f"{item['name']} x{item['quantity']}" for item in items])
        transaction = Transaction(
            customer_id=order.customer_id, shop_id=order.shop_id,
            description=f"Order #{order.id}", amount=order.total_amount, type='purchase'
        )
        db.session.add(transaction)
        
    db.session.commit()
    # Notify the shopkeeper's dashboard in real-time about the status change
    socketio.emit('order_update', {'order_id': order_id, 'status': new_status}, room=f'shop_{order.shop_id}')
    return jsonify({'status': 'success'})

# --- Customer Data Routes (for History, etc.) ---
@api.route('/customer/<int:user_id>/data', methods=['GET'])
def get_customer_data(user_id):
    # Current Bill
    balance_result = db.session.query(func.sum(Transaction.amount)).filter(Transaction.customer_id == user_id).scalar()
    
    # Active Orders
    active_orders_query = Order.query.filter(
        Order.customer_id == user_id, 
        Order.status.in_(['pending', 'accepted', 'out-for-delivery'])
    ).order_by(Order.timestamp.desc()).all()
    
    # Transaction History
    transactions_query = Transaction.query.filter_by(customer_id=user_id).order_by(Transaction.timestamp.desc()).limit(10).all()

    return jsonify({
        'current_balance': balance_result or 0,
        'active_orders': [{'id': o.id, 'shop_name': o.shop.shop_name, 'total_amount': o.total_amount, 'status': o.status} for o in active_orders_query],
        'history': [{'id': t.id, 'shop_name': t.shop.shop_name, 'description': t.description, 'amount': t.amount, 'type': t.type, 'timestamp': t.timestamp.isoformat()} for t in transactions_query]
    })

# --- Socket.IO Event Handlers for Real-Time ---
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join_shop_room')
def handle_join_shop_room(data):
    shop_id = data.get('shop_id')
    if shop_id:
        from flask_socketio import join_room
        join_room(f'shop_{shop_id}')
        print(f"Client {request.sid} joined room for shop {shop_id}")

