from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

from models import ApplicantInput
from database import init_db, save_application, get_all_applications, get_application_by_id
from rag_pipeline import assess_applicant

app = FastAPI(title="YES-P Eligibility Assessment System")

# Allow React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise database on startup
init_db()


@app.get("/")
def root():
    return {"message": "YES-P Eligibility Assessment API is running."}


@app.post("/assess")
def assess(applicant: ApplicantInput):
    try:
        applicant_data = applicant.dict()
        assessment = assess_applicant(applicant_data)
        if "error" in assessment:
            raise HTTPException(status_code=503, detail=assessment["message"])
        app_id = save_application(applicant_data, assessment)
        return {
            "application_id": app_id,
            "full_name": applicant_data["full_name"],
            "overall_score": assessment["overall_score"],
            "eligibility_band": assessment["eligibility_band"],
            "dimension_scores": assessment["dimension_scores"],
            "feedback": assessment["feedback"],
            "disqualifiers": assessment["disqualifiers"]
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("FULL ERROR:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
          

@app.get("/applications")
def list_applications():
    """Return all submitted applications."""
    applications = get_all_applications()
    for app in applications:
        if isinstance(app["dimension_scores"], str):
            app["dimension_scores"] = json.loads(app["dimension_scores"])
    return applications


@app.get("/applications/{app_id}")
def get_application(app_id: int):
    """Return a single application by ID."""
    application = get_application_by_id(app_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")
    if isinstance(application["dimension_scores"], str):
        application["dimension_scores"] = json.loads(application["dimension_scores"])
    return application