"""
This module is responsible for handling the vector store.
- Initializing the vector store
- Methods to add, query, and delete documents
"""

import os
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from common.ai.models import embeddings_model
from django.core.files.base import ContentFile
from common.ai.rag.retrieval import Retriever
import os
from datetime import datetime

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
    
    def as_retriever(self, **kwargs):
        return self.vector_store.as_retriever(**kwargs)
    
    def add_content_file(self, content_file: ContentFile, metadata: dict | None = None):
        # create a temporary file to provide the file path to the vector store and remove the file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        new_file_path = os.path.join(current_dir, f"temp_{datetime.now().strftime('%Y%m%d%H%M%S')}")
        with open(new_file_path, "wb") as f:
            f.write(content_file.read())
        retriever = Retriever(file_path=new_file_path)        
        documents = retriever.load_and_split()

        # add metadata
        if isinstance(metadata, dict):
            for document in documents:
                if isinstance(document.metadata, dict):
                    for key, value in metadata.items():
                        document.metadata[key] = value

        # remove the temporary file
        if os.path.exists(new_file_path):
            os.remove(new_file_path)

        return self.vector_store.add_documents(documents=documents)

    def add_documents(self, documents: list) -> list[str]:
        return self.vector_store.add_documents(documents=documents)
    
    def query(self, query: str, k: int = 3, filter: dict | None = None):
        return self.vector_store.similarity_search(query=query, k=k, filter=filter)
    
    def delete(self, document_ids):
        return self.vector_store.delete(ids=document_ids)
    
    def delete_by_filter(self, filters):
        return self.vector_store.delete(filters=filters)

vector_store = VectorStore()