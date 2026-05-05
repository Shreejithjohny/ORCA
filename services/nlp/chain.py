import time
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

from .prompts import SYSTEM_PROMPT, USER_PROMPT

llm = OllamaLLM(model="mistral")

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
    Call LLM with error handling, timeout protection, and fallback logic.
    Returns structured response matching incident schema.
    """
    try:
        start = time.time()
        result = explain_incident(incident)
        
        # timeout safety (5 sec)
        if time.time() - start > 5:
            raise Exception("LLM timeout")
        
        return {
            "explanation": result,
            "confidence": incident.get("confidence", 0.9),
            "source": "llm"
        }
    except Exception as e:
        # Fallback when Ollama offline or memory-pressured
        return fallback_response(incident)


if __name__ == "__main__":
    test_incident = {
        "severity": "critical",
        "summary": "CPU spike",
        "confidence": 0.9
    }

    print(explain_incident(test_incident))
