from pymongo import MongoClient
from dotenv import load_dotenv
import os


load_dotenv()
def connect_to_mongo():
    try:
        # client = MongoClient("mongodb://localhost:27017/")
        mongo_uri = os.getenv("mongo_uri")
        client = MongoClient(mongo_uri)

        db = client["blog_db"]
        blogs_collection = db["blogs"]
        db.command("ping")

        print("✅ Connected to MongoDB")
        return db, blogs_collection  

    except Exception as e:
        print("❌ Could not connect to MongoDB:", e)
        return None, None

result = connect_to_mongo()
if result[0] is None:
    db = None
    blogs_collection = None
    print("⚠️  MongoDB connection failed. App will run without database features.")
else:
    db, blogs_collection = result

