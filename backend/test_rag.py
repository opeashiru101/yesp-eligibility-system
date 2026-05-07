from rag_pipeline import assess_applicant

test_applicant = {
    "full_name": "Chidi Okonkwo",
    "age": 26,
    "nationality": "Nigerian",
    "education": "HND",
    "training_completed": "Yes",
    "business_name": "FreshPack Foods",
    "business_description": "I process locally grown tomatoes into packaged tomato paste and sell to supermarkets",
    "business_sector": "Agro-processing",
    "business_stage": "Early-stage"
}

result = assess_applicant(test_applicant)

print("OVERALL SCORE:", result.get("overall_score"))
print("BAND:", result.get("eligibility_band"))
print("\nDIMENSION SCORES:")
for k, v in result.get("dimension_scores", {}).items():
    print(f"  {k}: {v}")
print("\nFEEDBACK:", result.get("feedback"))
print("\nDISQUALIFIERS:", result.get("disqualifiers"))
print("\nRAW RESPONSE:", result.get("raw_response"))