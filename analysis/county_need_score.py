"""
County Need Score
=================
Combines five geospatial indicators into a single composite heat-vulnerability
score (0-5) for the ten hottest Pennsylvania counties.

Each indicator is min-max normalized to 0-1 across the study counties:
  * Higher = more vulnerable (LST, population density, NDBI):
        (x - min) / (max - min)
  * Higher = less vulnerable (tree canopy, NDVI), so the scale is inverted:
        (max - x) / (max - min)
The five normalized scores are summed with equal weight.

Usage:
    python analysis/county_need_score.py            # print table + write CSV
    python analysis/county_need_score.py --plot     # also save a bar chart
"""

import argparse
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "county_indicators.csv"
OUT = ROOT / "data" / "processed" / "county_need_scores.csv"
FIG = ROOT / "figures" / "county_need_score_bar.png"

# indicator column -> True if a higher value means MORE vulnerability
INDICATORS = {
    "lst_f": True,
    "tree_canopy_pct": False,
    "ndvi": False,
    "pop_density": True,
    "ndbi": True,
}


def minmax(series: pd.Series, higher_is_worse: bool = True) -> pd.Series:
    span = series.max() - series.min()
    if higher_is_worse:
        return (series - series.min()) / span
    return (series.max() - series) / span


def compute_need_scores(df: pd.DataFrame) -> pd.DataFrame:
    out = df[["county"]].copy()
    for col, higher_is_worse in INDICATORS.items():
        out[f"{col}_norm"] = minmax(df[col], higher_is_worse)
    norm_cols = [f"{c}_norm" for c in INDICATORS]
    out["county_need_score"] = out[norm_cols].sum(axis=1)
    return out.sort_values("county_need_score", ascending=False).round(3)


def plot(scores: pd.DataFrame) -> None:
    import matplotlib.pyplot as plt

    s = scores.sort_values("county_need_score")
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(s["county"], s["county_need_score"], color="#6a0dad")
    ax.set_xlabel("County Need Score (0 = low need, 5 = high need)")
    ax.set_title("Urban Heat Vulnerability: County Need Score")
    ax.set_xlim(0, 5)
    for y, v in enumerate(s["county_need_score"]):
        ax.text(v + 0.05, y, f"{v:.3f}", va="center", fontsize=9)
    fig.tight_layout()
    FIG.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG, dpi=150)
    print(f"Saved chart -> {FIG.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--plot", action="store_true", help="save a bar chart")
    args = parser.parse_args()

    df = pd.read_csv(RAW)
    scores = compute_need_scores(df)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    scores.to_csv(OUT, index=False)
    print(scores.to_string(index=False))
    print(f"\nSaved scores -> {OUT.relative_to(ROOT)}")

    if args.plot:
        plot(scores)


if __name__ == "__main__":
    main()
