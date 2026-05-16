SYSTEM_PROMPT = """
You are an AI observability assistant.

STRICT RULES:
- Use ONLY provided incident data
- DO NOT invent pods, metrics, timestamps
- If missing data, say "Insufficient evidence"
"""

USER_PROMPT = """
Incident Data:
{incident}

Tasks:
1. Explain what happened
2. Mention signals
3. Suggest remediation
"""
