from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings

chat_model = ChatGroq(
    model="llama3-8b-8192",
)

embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")