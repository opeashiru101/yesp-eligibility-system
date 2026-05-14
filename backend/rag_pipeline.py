import os
from openai import OpenAI
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Setup OpenAI-compatible client pointing to HuggingFace
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_API_TOKEN,
)

# Load embedding model and ChromaDB
embedder = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = PersistentClient(path="chroma_store")
collection = chroma_client.get_collection("yesp_knowledge")


def retrieve_chunks(query: str, n_results: int = 4) -> list:
    """Find the most relevant knowledge base chunks for a given query."""
    query_embedding = embedder.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results["documents"][0]


def check_disqualifiers(applicant_data: dict) -> dict:
    disqualifiers = []
    forced_scores = {}
    is_disqualified = False

    # 1. Citizenship check
    nationality = applicant_data.get("nationality", "").strip().lower()
    if nationality != "nigerian":
        disqualifiers.append(
            "You must be a Nigerian citizen to be eligible for the YES-P programme. "
            "This programme is open exclusively to Nigerians."
        )
        forced_scores["citizenship"] = 0
        is_disqualified = True

    # 2. Age check
    try:
        age = int(applicant_data.get("age", 0))
        if age < 18 or age > 35:
            disqualifiers.append(
                f"The YES-P programme is open to young Nigerians between 18 and 35 years of age. "
                f"Your age ({age}) falls outside this range."
            )
            forced_scores["age_eligibility"] = 0
            is_disqualified = True
    except:
        pass

    # 3. Training check
    training = applicant_data.get("training_completed", "").strip().lower()
    if training in ["no", "not yet"]:
        disqualifiers.append(
            "You must complete the YES-P capacity building training before you can be considered "
            "for financing. Please complete both the 8-week online and 5-day in-class training first."
        )
        forced_scores["training_completion"] = 0
        is_disqualified = True

    # 4. Business description length check
    description = applicant_data.get("business_description", "").strip()
    word_count = len(description.split())
    if word_count < 15:
        forced_scores["value_addition_innovation"] = min(
            forced_scores.get("value_addition_innovation", 10), 8
        )
        forced_scores["sme_cluster_alignment"] = min(
            forced_scores.get("sme_cluster_alignment", 20), 12
        )

    # 5. Education check
    education = applicant_data.get("education", "").strip().lower()
    if "below ond" in education:
        forced_scores["education"] = 5
        forced_scores["value_addition_innovation"] = min(
            forced_scores.get("value_addition_innovation", 20), 10
        )
        forced_scores["sme_cluster_alignment"] = min(
            forced_scores.get("sme_cluster_alignment", 20), 14
        )

    # 6. Trading business check
    description_lower = description.lower()
    trading_keywords = ["buy and sell", "resell", "reselling", "buying and selling",
                        "buying and reselling", "buy phones", "buy goods", "purchase and sell"]
    if any(keyword in description_lower for keyword in trading_keywords):
        disqualifiers.append(
            "Your business appears to be a trading or reselling activity. "
            "YES-P only funds businesses that create, produce, or transform products — "
            "not businesses that simply buy and resell without adding value."
        )
        forced_scores["sme_cluster_alignment"] = 0
        forced_scores["value_addition_innovation"] = 0
        is_disqualified = True

    return {
        "disqualifiers": disqualifiers,
        "forced_scores": forced_scores,
        "is_disqualified": is_disqualified
    }


def build_prompt(applicant_data: dict, retrieved_chunks: list, forced_scores: dict) -> str:
    """Build the prompt that gets sent to the LLM."""
    chunks_text = "\n\n".join(retrieved_chunks)

    forced_instructions = ""
    if forced_scores:
        forced_instructions = "\nIMPORTANT — The following scores have already been determined and MUST NOT be changed:\n"
        score_map = {
            "citizenship": "Citizenship",
            "age_eligibility": "Age Eligibility",
            "training_completion": "Training Completion"
        }
        for key, score in forced_scores.items():
            forced_instructions += f"- {score_map.get(key, key)}: {score}\n"

    return f"""You are a friendly and helpful eligibility adviser for the Bank of Industry Youth Entrepreneurship Support Programme (YES-P) in Nigeria. You are speaking directly to a small business owner who may not have a technical background.

Using ONLY the criteria provided below, assess the applicant and respond in EXACTLY this format with no extra text:

OVERALL SCORE: [number]/100
ELIGIBILITY BAND: [Highly Eligible / Likely Eligible / Partially Eligible / Not Currently Eligible]

DIMENSION SCORES:
- Citizenship: [score]/10
- Age Eligibility: [score]/10
- Education: [score]/15
- Training Completion: [score]/25
- SME Cluster Alignment: [score]/20
- Value-Addition and Innovation: [score]/20

FEEDBACK:
[Write feedback ONLY for dimensions where the applicant scored less than the maximum. Follow these rules strictly:
- Write in simple, warm, encouraging English that a non-technical small business owner in Nigeria can easily understand
- Do NOT use any technical terms — never say "value-addition", "SME cluster", "criterion", "Value-Addition and Innovation", or "SME Cluster Alignment"
- Instead of "SME Cluster Alignment" say "business sector fit" or "the type of business you run"
- Instead of "Value-Addition and Innovation" say "what makes your business stand out" or "how your business creates something new"
- Instead of "Training Completion" say "YES-P training"
- Instead of "criterion" say "requirement"
- Start with something positive or empathetic before explaining what needs improvement
- Be specific — tell the applicant exactly what to do to improve, using practical real-life examples
- Write as if you are a helpful mentor talking directly to the person, not writing a formal report
- Keep the entire feedback to a short paragraph — do not use bullet points or headers inside the feedback
- If the applicant is not a Nigerian citizen, start the feedback by acknowledging this clearly and kindly before giving any other advice]

DISQUALIFIERS:
[Write NONE — disqualifiers are handled separately]
{forced_instructions}
---
YES-P CRITERIA:
{chunks_text}

---
APPLICANT:
- Name: {applicant_data.get('full_name')}
- Age: {applicant_data.get('age')}
- Nationality: {applicant_data.get('nationality')}
- Education: {applicant_data.get('education')}
- Completed YES-P Training: {applicant_data.get('training_completed')}
- Business Name: {applicant_data.get('business_name')}
- Business Description: {applicant_data.get('business_description')}
- Business Sector: {applicant_data.get('business_sector')}
- Business Stage: {applicant_data.get('business_stage')}
"""


def query_llm(prompt: str) -> str:
    """Send the prompt to Qwen via HuggingFace and get response."""
    completion = client.chat.completions.create(
        model="Qwen/Qwen2.5-7B-Instruct",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=800,
        temperature=0.3
    )
    return completion.choices[0].message.content


def parse_response(raw_response: str) -> dict:
    """Parse the LLM response into structured data."""
    lines = raw_response.strip().split("\n")
    result = {
        "overall_score": 0,
        "eligibility_band": "",
        "dimension_scores": {
            "citizenship": 0,
            "age_eligibility": 0,
            "education": 0,
            "training_completion": 0,
            "sme_cluster_alignment": 0,
            "value_addition_innovation": 0
        },
        "feedback": "",
        "disqualifiers": "",
        "raw_response": raw_response
    }

    feedback_lines = []
    disqualifier_lines = []
    in_feedback = False
    in_disqualifiers = False
    in_dimensions = False

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if line.startswith("OVERALL SCORE:"):
            try:
                score_part = line.replace("OVERALL SCORE:", "").strip()
                result["overall_score"] = int(score_part.split("/")[0].strip())
            except:
                pass
        elif line.startswith("ELIGIBILITY BAND:"):
            result["eligibility_band"] = line.replace("ELIGIBILITY BAND:", "").strip()
        elif line.startswith("DIMENSION SCORES:"):
            in_dimensions = True
            in_feedback = False
            in_disqualifiers = False
        elif line.startswith("FEEDBACK:"):
            in_feedback = True
            in_dimensions = False
            in_disqualifiers = False
        elif line.startswith("DISQUALIFIERS:"):
            in_disqualifiers = True
            in_feedback = False
            in_dimensions = False
        elif in_dimensions and line.startswith("-"):
            try:
                parts = line.lstrip("- ").split(":")
                dim_name = parts[0].strip().lower()
                score_val = int(parts[1].strip().split("/")[0].strip())
                if "citizenship" in dim_name:
                    result["dimension_scores"]["citizenship"] = score_val
                elif "age" in dim_name:
                    result["dimension_scores"]["age_eligibility"] = score_val
                elif "education" in dim_name:
                    result["dimension_scores"]["education"] = score_val
                elif "training" in dim_name:
                    result["dimension_scores"]["training_completion"] = score_val
                elif "sme" in dim_name or "cluster" in dim_name:
                    result["dimension_scores"]["sme_cluster_alignment"] = score_val
                elif "value" in dim_name or "innovation" in dim_name:
                    result["dimension_scores"]["value_addition_innovation"] = score_val
            except:
                pass
        elif in_feedback:
            feedback_lines.append(line)
        elif in_disqualifiers:
            disqualifier_lines.append(line)

    result["feedback"] = " ".join(feedback_lines)
    result["disqualifiers"] = " ".join(disqualifier_lines)
    return result


def assess_applicant(applicant_data: dict) -> dict:
    """Main function — takes applicant data, returns full assessment."""

    # Step 1 — Check hard disqualifiers in Python first
    disqualifier_check = check_disqualifiers(applicant_data)
    disqualifiers = disqualifier_check["disqualifiers"]
    forced_scores = disqualifier_check["forced_scores"]
    is_disqualified = disqualifier_check["is_disqualified"]

    # Step 2 — Retrieve relevant chunks
    query = f"{applicant_data.get('business_description', '')} {applicant_data.get('business_sector', '')}"
    chunks = retrieve_chunks(query)

    # Step 3 — Build prompt and query LLM
    prompt = build_prompt(applicant_data, chunks, forced_scores)
    raw_response = query_llm(prompt)

    # Step 4 — Parse LLM response
    result = parse_response(raw_response)

    # Step 5 — Override scores with forced values
    for key, score in forced_scores.items():
        result["dimension_scores"][key] = score

    # Step 6 — Recalculate overall score
    scores = result["dimension_scores"]
    result["overall_score"] = (
        scores["citizenship"] +
        scores["age_eligibility"] +
        scores["education"] +
        scores["training_completion"] +
        scores["sme_cluster_alignment"] +
        scores["value_addition_innovation"]
    )

    # Step 7 — If disqualified, cap score at 39 maximum
    if is_disqualified:
        result["overall_score"] = min(result["overall_score"], 39)
        result["eligibility_band"] = "Not Currently Eligible"
    else:
        total = result["overall_score"]
        if total >= 80:
            result["eligibility_band"] = "Highly Eligible"
        elif total >= 60:
            result["eligibility_band"] = "Likely Eligible"
        elif total >= 40:
            result["eligibility_band"] = "Partially Eligible"
        else:
            result["eligibility_band"] = "Not Currently Eligible"

    # Step 8 — Set disqualifiers
    if disqualifiers:
        result["disqualifiers"] = " ".join(disqualifiers)
    else:
        result["disqualifiers"] = "NONE"

    return result