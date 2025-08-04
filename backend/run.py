# /backend/run.py

from app import create_app, socketio
import socket

app = create_app()

if __name__ == '__main__':
    hostname = socket.gethostname()
    try:
        ip_address = socket.gethostbyname(hostname)
    except socket.gaierror:
        ip_address = '127.0.0.1'
    
    print("\n--- Udhaar+ Modular Server is Ready ---")
    print("To access the app:")
    print(f"  - From this PC, use the frontend with URL: http://127.0.0.1:5000")
    print(f"  - From other devices on the same Wi-Fi, use: http://{ip_address}:5000")
    print("----------------------------------------\n")

    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
