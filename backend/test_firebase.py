import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import os

load_dotenv()

def test_firebase():
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
    print(f"Using credentials from: {cred_path}")
    
    try:
        # Initialize the app with a service account
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin initialized successfully.")
        
        # Try fetching a user page to verify auth works
        page = auth.list_users(max_results=1)
        print(f"Successfully connected to Firebase! Found {len(page.users)} users in the first page.")
    except Exception as e:
        print("Firebase connection FAILED: ", str(e))

if __name__ == "__main__":
    test_firebase()
