import sqlite3
import json
from datetime import datetime

DB_PATH = "yesp_applications.db"

def init_db():
    """Create the database and tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            nationality TEXT NOT NULL,
            education TEXT NOT NULL,
            training_completed TEXT NOT NULL,
            business_name TEXT NOT NULL,
            business_description TEXT NOT NULL,
            business_sector TEXT NOT NULL,
            business_stage TEXT NOT NULL,
            overall_score INTEGER,
            eligibility_band TEXT,
            dimension_scores TEXT,
            feedback TEXT,
            disqualifiers TEXT,
            submitted_at TEXT
        )
    """)
    conn.commit()
    conn.close()
    print("Database ready.")


def save_application(applicant_data: dict, assessment: dict) -> int:
    """Save a submitted application and its assessment to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO applications (
            full_name, age, nationality, education, training_completed,
            business_name, business_description, business_sector, business_stage,
            overall_score, eligibility_band, dimension_scores, feedback,
            disqualifiers, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        applicant_data.get("full_name"),
        applicant_data.get("age"),
        applicant_data.get("nationality"),
        applicant_data.get("training_completed"),
        applicant_data.get("education"),
        applicant_data.get("business_name"),
        applicant_data.get("business_description"),
        applicant_data.get("business_sector"),
        applicant_data.get("business_stage"),
        assessment.get("overall_score"),
        assessment.get("eligibility_band"),
        json.dumps(assessment.get("dimension_scores", {})),
        assessment.get("feedback"),
        assessment.get("disqualifiers"),
        datetime.now().isoformat()
    ))
    app_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return app_id


def get_all_applications() -> list:
    """Retrieve all submitted applications."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications ORDER BY submitted_at DESC")
    rows = cursor.fetchall()
    conn.close()
    columns = [
        "id", "full_name", "age", "nationality", "education",
        "training_completed", "business_name", "business_description",
        "business_sector", "business_stage", "overall_score",
        "eligibility_band", "dimension_scores", "feedback",
        "disqualifiers", "submitted_at"
    ]
    return [dict(zip(columns, row)) for row in rows]


def get_application_by_id(app_id: int) -> dict:
    """Retrieve a single application by ID."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    columns = [
        "id", "full_name", "age", "nationality", "education",
        "training_completed", "business_name", "business_description",
        "business_sector", "business_stage", "overall_score",
        "eligibility_band", "dimension_scores", "feedback",
        "disqualifiers", "submitted_at"
    ]
    return dict(zip(columns, row))