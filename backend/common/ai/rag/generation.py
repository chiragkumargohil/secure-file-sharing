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


def query(question: str, filter: dict | None = None) -> str:
    retriever = vector_store.as_retriever(search_kwargs={"filter": filter})

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | chat_model
        | StrOutputParser()
    )
    return rag_chain.invoke(question)