"""
This module contains the FileLoader class, which is used to load and split files.
- Loading and splitting (chunking) files
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class Retriever:
    def __init__(self, file_path):
        self.file_path = file_path
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=0
        )

    def load(self):
        loader = PyPDFLoader(self.file_path)
        return loader.load()

    def load_and_split(self):
        loader = PyPDFLoader(self.file_path)
        return loader.load_and_split(text_splitter=self.text_splitter)
    
    def _pdf_loader(self):
        return PyPDFLoader(self.file_path)