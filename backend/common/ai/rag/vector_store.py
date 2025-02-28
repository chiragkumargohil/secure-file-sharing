"""
This module is responsible for handling the vector store.
- Initializing the vector store
- Methods to add, query, and delete documents
"""

import os
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from common.ai.models import embeddings_model

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

class VectorStore:
    def __init__(self):
        print("Initializing Vector Store")
        self.vector_store = PineconeVectorStore(
            pinecone_api_key=PINECONE_API_KEY,
            embedding=embeddings_model,
            index_name="file-store-v1"
        )
    
    def as_retriever(self, *args, **kwargs):
        return self.vector_store.as_retriever(*args, **kwargs)

    def add(self, documents: list) -> list[str]:
        return self.vector_store.add_documents(documents=documents)
    
    def query(self, query: str, k: int = 3, filter: dict | None = None):
        return self.vector_store.similarity_search(query=query, k=k, filter=filter)
    
    def delete(self, document_ids):
        return self.vector_store.delete(ids=document_ids)
    
    def delete_by_filter(self, filters):
        return self.vector_store.delete(filters=filters)

vector_store = VectorStore()