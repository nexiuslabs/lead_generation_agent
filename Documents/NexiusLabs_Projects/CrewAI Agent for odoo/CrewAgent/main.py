# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crew import support_crew

app = FastAPI()

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str
    question: str

@app.post("/ask", response_model=AnswerResponse)
def ask_question(payload: QuestionRequest):
    question = payload.question

    try:
        result = support_crew.kickoff(inputs={"question": question})
        try:
            json_output = result.json()
            answer = json_output.get("output", "No output field found in JSON.")
        except ValueError:
            answer = result.raw

        return AnswerResponse(question=question, answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

'''
curl -X POST "http://127.0.0.1:8000/ask" \
     -H "Content-Type: application/json" \
     -d '{"dbname":"nexiuslabs-db", "host":"localhost", "question": "Can I use Pioneer Pro with Aquajellie too?"}'
'''