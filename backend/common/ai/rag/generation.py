"""
This module contains the generation logic for the RAG model.
- Querying the RAG model
- Parsing the response
"""

from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from common.ai.models import chat_model
from common.ai.rag.vector_store import vector_store

retriever = vector_store.as_retriever()

system_prompt = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Keep the answer concise and informative. "
    "Answer politely and professionally. "
    "Do not mention context related things like 'according to context'. "
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{question}"),
    ]
)

def format_docs(docs: list[dict]) -> str:
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | chat_model
    | StrOutputParser()
)

def query(question: str) -> str:
    return rag_chain.invoke(question)