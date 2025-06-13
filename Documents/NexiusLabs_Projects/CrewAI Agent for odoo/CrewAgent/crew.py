# crew.py
from crewai import Agent, Task, Crew, Process
from tools.retrieval_tool import retrieve_snippets_tool
from tools.answer_tool import generate_answer_tool

retrieval_agent = Agent(
    role="Retrieval Agent",
    goal="Fetch the most relevant knowledge from the database",
    backstory="Expert in querying pgvector-augmented tables to retrieve the best content.",
    tools=[retrieve_snippets_tool],
    verbose=True,
)

answer_agent = Agent(
    role="Answer Agent",
    goal="Generate helpful and grounded answers using retrieved content only",
    backstory="LLM prompt wizard that always responds using verified internal content.",
    tools=[generate_answer_tool],
    verbose=True,
)

retrieval_task = Task(
    description="Retrieve relevant snippets for the user question: {question}",
    expected_output="A set of relevant context strings.",
    tools=[retrieve_snippets_tool],
    agent=retrieval_agent
)

answer_task = Task(
    description="Generate a helpful and grounded answer for the question: {question} using the retrieved context.",
    expected_output="A concise, well-grounded answer.",
    tools=[generate_answer_tool],
    context=[retrieval_task],
    agent=answer_agent
)


support_crew = Crew(
    agents=[retrieval_agent, answer_agent],
    tasks=[retrieval_task, answer_task],
    process=Process.sequential,
    verbose=True,
)

