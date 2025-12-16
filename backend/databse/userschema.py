from pydantic import BaseModel,Field,EmailStr,model_validator
class Signup(BaseModel):
    name:str=Field(...,min_length=3,max_length=50)
    email:EmailStr
    password:str=Field(...,min_length=6,max_length=20)
    confirmPassword:str=Field(...,min_length=6,max_length=20)
    @model_validator(mode='after')
    def passwords_match(self):
        if self.password!=self.confirmPassword:
            raise ValueError("Passwords do not match")
        return self
    
class LoginUser(BaseModel):
    email:EmailStr
    password:str=Field(...,min_length=6,max_length=20)    