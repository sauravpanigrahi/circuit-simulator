from pydantic import BaseModel,Field

class Blog(BaseModel):
    title:str=Field(...,min_length=3,max_length=50)
    content:str=Field(...,min_length=3)
    author:str=Field(...,min_length=3 ,max_length=20)