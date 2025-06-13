# tools/retrieval_tool.py
import os
import psycopg2
import logging
import time
from sentence_transformers import SentenceTransformer
from crewai.tools import tool

EMBED_MODEL_NAME = 'all-MiniLM-L6-v2'
TOP_K = 5
embed_model = SentenceTransformer(EMBED_MODEL_NAME)

'''
def get_db_conn():
    return psycopg2.connect(
        dbname='nexiuslabs-db',
        user='postgres',
        password='root',
        host='localhost',
        port=5432
    )
'''
def get_db_conn():
    return psycopg2.connect(
        dbname='henry-nexiuslabs',
        user='odoo',
        password='Javis@2025',
        host='app.nocodeclub.tech',
        port=5432
    )

@tool("Retrieve relevant knowledge snippets from DB")
def retrieve_snippets_tool(question: str) -> str:
    """
    Queries pgvector-enabled Postgres to fetch the most relevant content
    based on a user question using vector similarity.
    """
    logging.info(f"Retrieval tool: processing question: {question!r}")
    q_emb = embed_model.encode(question).tolist()
    sql = "SELECT content FROM agent_knowledge ORDER BY embedding <=> %s::vector LIMIT %s;"

    with get_db_conn() as conn, conn.cursor() as cur:
        cur.execute(sql, (q_emb, TOP_K))
        docs = [row[0] for row in cur.fetchall()]

    if not docs:
        return "No relevant documents found."

    return "\n".join(docs)
