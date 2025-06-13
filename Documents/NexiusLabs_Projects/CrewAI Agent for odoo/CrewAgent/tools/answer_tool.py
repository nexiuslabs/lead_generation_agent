# tools/answer_tool.py
import os
from openai import OpenAI
from crewai.tools import tool

client = OpenAI()  # API key is loaded automatically from env var

@tool("Generate a grounded answer using retrieved snippets")
def generate_answer_tool(context: str, question: str) -> str:
    """
    Uses OpenAI to generate a response based only on the provided context and user question.
    """
    if not context or "No relevant documents" in context:
        return (
            "There is no related information about your question at the moment. "
            "Please try rephrasing or ask something else."
        )

    prompt = (
        f"Use ONLY the following context to answer the question.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}"
    )

    response = client.chat.completions.create(
        model="gpt-4o",  # You can use gpt-4, gpt-3.5-turbo, etc.
        messages=[{"role": "system", "content": prompt}]
    )

    return response.choices[0].message.content.strip()
