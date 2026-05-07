import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_API_TOKEN,
)

print("Sending request...")

completion = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[
        {"role": "user", "content": "What is 2 + 2? Answer in one sentence."}
    ],
    max_tokens=50
)

print("Response:", completion.choices[0].message.content)