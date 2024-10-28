from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import firebase_admin
from firebase_admin import auth, credentials
import os

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', '<your key>')

# Initialize Firebase Admin SDK
cred = credentials.Certificate('/path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

@app.route('/auth/verify-token', methods=['POST'])
def verify_token():
    try:
        print("Verifying token...")
        data = request.json
        id_token = data.get('idToken')
        
        if not id_token:
            print("No token provided")
            return jsonify({"error": "No token provided"}), 400
            
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        print(f"Token verified for user: {decoded_token.get('email')}")
        
        # Store user info in session
        session['user_id'] = decoded_token['uid']
        session['email'] = decoded_token.get('email', '')
        session['name'] = decoded_token.get('name', '')
        
        print(f"Session created for user: {session['email']}")
        return jsonify({"success": True, "redirect": url_for('profile')}), 200
        
    except Exception as e:
        print(f"Error verifying token: {e}")
        return jsonify({"error": str(e)}), 401

@app.route('/profile')
def profile():
    print("Profile route accessed")
    print(f"Session data: {session}")
    
    if 'user_id' not in session:
        print("No user_id in session, redirecting to login")
        return redirect(url_for('login'))
        
    user_data = {
        'email': session.get('email'),
        'name': session.get('name'),
        'user_id': session.get('user_id')
    }
    print(f"Rendering profile for user: {user_data['email']}")
    return render_template('profile.html', user=user_data)

@app.route('/login')
def login():
    if 'user_id' in session:
        print(f"User already logged in, redirecting to profile: {session['email']}")
        return redirect(url_for('profile'))
    return render_template('login.html')

@app.route('/')
def index():
    user_data = None
    if 'user_id' in session:
        user_data = {
            'email': session.get('email'),
            'name': session.get('name')
        }
    return render_template('index.html', user=user_data)

@app.route('/logout')
def logout():
    print(f"Logging out user: {session.get('email')}")
    session.clear()
    return redirect(url_for('index'))

@app.before_request
def log_request_info():
    print(f"\n=== Request Info ===")
    print(f"Path: {request.path}")
    print(f"Method: {request.method}")
    print(f"Session: {session}")
    print(f"===================\n")

@app.route('/debug/auth-status')
def debug_auth_status():
    return jsonify({
        'session': dict(session),
        'request_info': {
            'path': request.path,
            'method': request.method,
            'headers': dict(request.headers),
            'is_secure': request.is_secure,
            'host': request.host
        },
        'environment': {
            'SERVER_NAME': request.environ.get('SERVER_NAME'),
            'wsgi.url_scheme': request.environ.get('wsgi.url_scheme'),
            'HTTP_HOST': request.environ.get('HTTP_HOST')
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)