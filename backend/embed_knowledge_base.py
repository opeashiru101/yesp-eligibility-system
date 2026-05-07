import os
from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# Load the knowledge base text file
with open("knowledge_base/yesp_criteria.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Split into chunks by the CHUNK: marker
raw_chunks = content.split("CHUNK:")
chunks = []
chunk_ids = []
chunk_metadata = []

for i, chunk in enumerate(raw_chunks):
    chunk = chunk.strip()
    if not chunk:
        continue
    # First line is the chunk title, rest is content
    lines = chunk.split("\n", 1)
    title = lines[0].strip()
    body = lines[1].strip() if len(lines) > 1 else ""
    full_text = f"{title}: {body}"
    chunks.append(full_text)
    chunk_ids.append(f"chunk_{i}")
    chunk_metadata.append({"title": title})

# Load embedding model
print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Generate embeddings
print(f"Embedding {len(chunks)} chunks...")
embeddings = embedder.encode(chunks).tolist()

# Store in ChromaDB
print("Storing in ChromaDB...")
client = PersistentClient(path="chroma_store")

# Delete collection if it already exists (for re-runs)
try:
    client.delete_collection("yesp_knowledge")
except:
    pass

collection = client.create_collection("yesp_knowledge")
collection.add(
    documents=chunks,
    embeddings=embeddings,
    ids=chunk_ids,
    metadatas=chunk_metadata
)

print(f"Done! {len(chunks)} chunks stored in ChromaDB successfully.")