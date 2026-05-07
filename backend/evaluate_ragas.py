from rag_pipeline import retrieve_chunks, assess_applicant

print("=" * 60)
print("YES-P RAG PIPELINE — MANUAL EVALUATION")
print("=" * 60)

test_cases = [
    {
        "id": 1,
        "label": "Eligible — Food Processing",
        "applicant": {
            "full_name": "Chidi Okonkwo",
            "age": 26,
            "nationality": "Nigerian",
            "education": "HND",
            "training_completed": "Yes",
            "business_name": "FreshPack Foods",
            "business_description": "I process locally grown tomatoes into packaged tomato paste and supply to supermarkets",
            "business_sector": "Agro-Processing & Food Production",
            "business_stage": "Early-stage"
        },
        "expected_band": "Highly Eligible",
        "expected_disqualifier": "NONE"
    },
    {
        "id": 2,
        "label": "Ineligible — Pure Trading",
        "applicant": {
            "full_name": "Emeka Eze",
            "age": 28,
            "nationality": "Nigerian",
            "education": "OND (Ordinary National Diploma)",
            "training_completed": "Yes",
            "business_name": "Phone Hub",
            "business_description": "I buy phones in bulk from Alaba market and resell them at a profit",
            "business_sector": "Manufacturing & Fabrication",
            "business_stage": "Already operating"
        },
        "expected_band": "Not Currently Eligible",
        "expected_disqualifier": "trading"
    },
    {
        "id": 3,
        "label": "Ineligible — Non Nigerian",
        "applicant": {
            "full_name": "John Smith",
            "age": 25,
            "nationality": "Non-Nigerian",
            "education": "University Degree (B.Sc. / B.A. / B.Eng.)",
            "training_completed": "Yes",
            "business_name": "TechStart",
            "business_description": "I develop mobile applications for small businesses in Nigeria",
            "business_sector": "Creative & Digital Industries",
            "business_stage": "Early-stage"
        },
        "expected_band": "Not Currently Eligible",
        "expected_disqualifier": "Nigerian citizen"
    },
    {
        "id": 4,
        "label": "Ineligible — No Training",
        "applicant": {
            "full_name": "Amaka Obi",
            "age": 24,
            "nationality": "Nigerian",
            "education": "HND",
            "training_completed": "No",
            "business_name": "Amaka Fashion",
            "business_description": "I design and produce original Ankara clothing and accessories",
            "business_sector": "Creative & Digital Industries",
            "business_stage": "Early-stage"
        },
        "expected_band": "Not Currently Eligible",
        "expected_disqualifier": "training"
    },
    {
        "id": 5,
        "label": "Ineligible — Too Old",
        "applicant": {
            "full_name": "Bola Adeyemi",
            "age": 42,
            "nationality": "Nigerian",
            "education": "University Degree (B.Sc. / B.A. / B.Eng.)",
            "training_completed": "Yes",
            "business_name": "GreenFarm",
            "business_description": "I run a greenhouse farm producing vegetables and herbs for local restaurants",
            "business_sector": "Agriculture & Allied Services",
            "business_stage": "Already operating"
        },
        "expected_band": "Not Currently Eligible",
        "expected_disqualifier": "age"
    },
    {
        "id": 6,
        "label": "Partially Eligible — Below OND",
        "applicant": {
            "full_name": "Tunde Bakare",
            "age": 22,
            "nationality": "Nigerian",
            "education": "Below OND",
            "training_completed": "Yes",
            "business_name": "Tunde Woodworks",
            "business_description": "I make custom wooden furniture and home decorations from locally sourced timber",
            "business_sector": "Manufacturing & Fabrication",
            "business_stage": "Just an idea (not started yet)"
        },
        "expected_band": "Partially Eligible",
        "expected_disqualifier": "NONE"
    }
]

passed = 0
failed = 0

for case in test_cases:
    print(f"\nTest {case['id']}: {case['label']}")
    print("-" * 40)

    result = assess_applicant(case["applicant"])

    actual_band = result.get("eligibility_band", "")
    actual_score = result.get("overall_score", 0)
    actual_disqualifier = result.get("disqualifiers", "NONE")
    actual_feedback = result.get("feedback", "")

    band_correct = actual_band == case["expected_band"]
    disqualifier_correct = case["expected_disqualifier"] == "NONE" and actual_disqualifier == "NONE" or \
                          case["expected_disqualifier"] != "NONE" and case["expected_disqualifier"].lower() in actual_disqualifier.lower()

    print(f"Score:        {actual_score}/100")
    print(f"Band:         {actual_band} {'✓' if band_correct else '✗ (expected: ' + case['expected_band'] + ')'}")
    print(f"Disqualifier: {actual_disqualifier[:80]}...")
    print(f"Disqualifier check: {'✓' if disqualifier_correct else '✗'}")
    print(f"Feedback preview: {actual_feedback[:100]}...")

    if band_correct and disqualifier_correct:
        passed += 1
        print("RESULT: PASS")
    else:
        failed += 1
        print("RESULT: FAIL")

print("\n" + "=" * 60)
print(f"EVALUATION SUMMARY")
print("=" * 60)
print(f"Total test cases:  {len(test_cases)}")
print(f"Passed:            {passed}")
print(f"Failed:            {failed}")
print(f"Pass rate:         {round((passed/len(test_cases))*100)}%")
print("=" * 60)