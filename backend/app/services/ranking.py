from typing import List, Dict, Any

DEFAULT_THRESHOLDS = {
    "strong": 90.0,
    "good": 75.0,
    "potential": 60.0
}

def get_recommendation(score: float, thresholds: Dict[str, float] = None) -> str:
    """Return screening recommendation label based on score thresholds."""
    th = thresholds or DEFAULT_THRESHOLDS
    if score >= th["strong"]:
        return "Strong Candidate"
    elif score >= th["good"]:
        return "Good Candidate"
    elif score >= th["potential"]:
        return "Potential Candidate"
    else:
        return "Low Match"

def rank_candidates(candidates_screening_data: List[Dict[str, Any]], thresholds: Dict[str, float] = None) -> List[Dict[str, Any]]:
    """
    Sort a list of candidate screening results by score descending and assign 1-based ranks & recommendations.
    """
    # Sort candidates by overall_score descending
    sorted_candidates = sorted(
        candidates_screening_data,
        key=lambda c: c.get("score", c.get("overall_score", 0.0)),
        reverse=True
    )

    ranked_results = []
    for idx, candidate in enumerate(sorted_candidates, start=1):
        score = candidate.get("score", candidate.get("overall_score", 0.0))
        rec = get_recommendation(score, thresholds)
        candidate_entry = dict(candidate)
        candidate_entry["rank"] = idx
        candidate_entry["recommendation"] = rec
        ranked_results.append(candidate_entry)

    return ranked_results
