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
        return None

db, blogs_collection = connect_to_mongo()

