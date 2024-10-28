# Firebase SAML SSO Demo

A demonstration of SAML SSO integration with Firebase Authentication and Flask.

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd firebase-saml-demo
```

2. Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Configure Firebase
- Create a Firebase project
- Enable SAML authentication
- Download service account key and save as `serviceAccount.json`
- Add authorized domains in Firebase Console

5. Configure Okta
- Create SAML application
- Configure SSO URLs
- Assign users to the application

7. Run the application
```bash
python app.py
```

## Project Structure
```
firebase-saml-demo/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── static/               # Static files
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript files
└── templates/           # HTML templates
    ├── base.html
    ├── index.html
    ├── login.html
    └── profile.html
```

## Configuration Files Needed (not included in repo)

1. `serviceAccount.json` - Firebase service account key
2. `/static/js/firebase-config.js` - Your web app's Firebase configuration
