import time
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

from .prompts import SYSTEM_PROMPT, USER_PROMPT

import os
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://orca-ollama.orca.svc.cluster.local:11434")
llm = OllamaLLM(model="mistral", base_url=OLLAMA_URL)

prompt = PromptTemplate(
    template=SYSTEM_PROMPT + USER_PROMPT,
    input_variables=["incident"]
)

def explain_incident(incident):
    print("Calling LLM...")   # debug
    chain = prompt | llm
    result = chain.invoke({"incident": incident})
    print("LLM responded")    # debug
    return result


def fallback_response(incident):
    return {
        "explanation": "High CPU anomaly detected. Possible overload.",
        "confidence": incident.get("confidence", 0.5),
        "source": "fallback"
    }


def explain_incident_safe(incident):
    """
    Call LLM with error handling and fallback logic.
    Returns structured response matching incident schema.
    """
    try:
        result = explain_incident(incident)
        return {
            "explanation": result,
            "confidence": incident.get("confidence", 0.9),
            "source": "llm"
        }
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback when Ollama offline or memory-pressured
        return fallback_response(incident)

def ask_ai_chat(query: str, context: list):
    """
    Answer free-text queries using the Ollama LLM.
    """
    try:
        print(f"Asking AI: {query}")
        chat_prompt = PromptTemplate(
            template="You are an AI observability assistant. Answer the user's query.\n\nContext (Active Incidents):\n{context}\n\nUser Query: {query}\n\nAnswer concisely:",
            input_variables=["context", "query"]
        )
        chain = chat_prompt | llm
        
        # Format context for the prompt
        context_str = "\n".join([f"- {i['id']} ({i['severity']}): {i['message']}" for i in context])
        if not context_str:
            context_str = "No active incidents."
            
        result = chain.invoke({"context": context_str, "query": query})
        
        # Try to find related incidents by looking for IDs in the answer
        related = [i['id'] for i in context if i['id'] in result]
        
        return {
            "answer": result,
            "confidence": 0.85,
            "relatedIncidents": related
        }
    except Exception as e:
        print(f"Chat LLM Error: {e}")
        return {
            "answer": f"I'm sorry, I couldn't reach the local Ollama instance. Please ensure Ollama is running and the 'mistral' model is pulled. Error: {str(e)}",
            "confidence": 0.0,
            "relatedIncidents": []
        }

if __name__ == "__main__":
    test_incident = {
        "severity": "critical",
        "summary": "CPU spike",
        "confidence": 0.9
    }
    print(explain_incident_safe(test_incident))
