def test_nlp_response():
    from services.nlp.chain import explain_incident_safe

    incident = {
        "severity": "critical",
        "summary": "CPU spike"
    }

    result = explain_incident_safe(incident)

    assert result is not None
    assert "explanation" in result
    assert "confidence" in result
    