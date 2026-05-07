from pydantic import BaseModel

class ApplicantInput(BaseModel):
    full_name: str
    age: int
    nationality: str
    education: str
    training_completed: str
    business_name: str
    business_description: str
    business_sector: str
    business_stage: str