#!/usr/bin/env python3
"""Futuristic Streamlit UI for PrizePicks EV model."""

from __future__ import annotations

import os

import pandas as pd
import streamlit as st

from prizepicks_ev_model import calculate_slip_scenarios, run_model

st.set_page_config(page_title="PrizePicks EV Command Center", page_icon="🚀", layout="wide")

st.markdown(
    """
    <style>
      .stApp {
        background: radial-gradient(circle at 10% 20%, #111827 0%, #09090b 40%, #020617 100%);
        color: #e5e7eb;
      }
      .block-container {padding-top: 1.2rem;}
      .card {
        background: linear-gradient(135deg, rgba(30,41,59,.8), rgba(15,23,42,.8));
        border: 1px solid rgba(34,211,238,.35);
        border-radius: 16px;
        padding: 14px 16px;
        box-shadow: 0 0 24px rgba(34,211,238,.12);
      }
      .kpi {font-size: 1.9rem; font-weight: 700; color: #22d3ee;}
      .sub {font-size:.82rem; color:#94a3b8;}
    </style>
    """,
    unsafe_allow_html=True,
)




def _best_leg_probability(row: pd.Series) -> float:
    return float(row["over_prob"] if row["best_pick"] == "over" else row["under_prob"])

st.title("🚀 PrizePicks EV Command Center")
st.caption("Institutional-style EV board with bookmaker consensus, confidence score, and Kelly sizing guidance.")

with st.sidebar:
    st.header("⚙️ Model Controls")
    api_key = st.text_input("The Odds API Key", value=os.getenv("ODDS_API_KEY", ""), type="password")
    league_id = st.number_input("League ID", value=7, step=1)
    state_code = st.text_input("State Code", value="FL")
    sport_key = st.text_input("Sport Key", value="basketball_nba")
    in_game = st.checkbox("In-game only", value=True)
    payout_multiplier = st.number_input("Payout Multiplier", min_value=0.1, value=1.0, step=0.1)
    fallback_sigma = st.number_input("Fallback Sigma", min_value=0.5, value=5.5, step=0.1)
    top_n = st.slider("Rows to show", 10, 100, 30, 5)
    run = st.button("Run EV Model", use_container_width=True)

if run:
    if not api_key:
        st.error("Please enter your The Odds API key.")
    else:
        with st.spinner("Pulling markets and calculating EV..."):
            rows = run_model(
                api_key=api_key,
                league_id=int(league_id),
                state_code=state_code.strip().upper(),
                sport_key=sport_key.strip(),
                in_game=in_game,
                payout_multiplier=float(payout_multiplier),
                fallback_sigma=float(fallback_sigma),
            )

        if not rows:
            st.warning("No matched projections found. Try toggling in-game or changing state/league.")
        else:
            df = pd.DataFrame([r.__dict__ for r in rows])
            df["best_ev"] = df[["ev_over", "ev_under"]].max(axis=1)
            df["best_prob"] = df.apply(_best_leg_probability, axis=1)
            df = df.sort_values("best_ev", ascending=False)

            c1, c2, c3, c4 = st.columns(4)
            with c1:
                st.markdown(f"<div class='card'><div class='sub'>Top EV</div><div class='kpi'>{df['best_ev'].iloc[0]:.3f}</div></div>", unsafe_allow_html=True)
            with c2:
                st.markdown(f"<div class='card'><div class='sub'>Avg Confidence</div><div class='kpi'>{df['confidence'].mean():.1f}</div></div>", unsafe_allow_html=True)
            with c3:
                st.markdown(f"<div class='card'><div class='sub'>Rows Modeled</div><div class='kpi'>{len(df)}</div></div>", unsafe_allow_html=True)
            with c4:
                over_share = (df["best_pick"] == "over").mean() * 100
                st.markdown(f"<div class='card'><div class='sub'>Best Pick Over %</div><div class='kpi'>{over_share:.1f}%</div></div>", unsafe_allow_html=True)

            cols = [
                "player_name",
                "stat_type",
                "prizepicks_line",
                "best_pick",
                "best_prob",
                "ev_over",
                "ev_under",
                "confidence",
                "market_sample_size",
                "kelly_over",
                "kelly_under",
            ]
            st.subheader("📈 Ranked EV Board")
            st.dataframe(df[cols].head(top_n), use_container_width=True, hide_index=True)

            st.subheader("🎯 Slip Probability Lab")
            slip_col1, slip_col2 = st.columns([1, 2])
            with slip_col1:
                slip_size = st.selectbox("Slip size", options=[2, 3, 4, 5, 6], index=3)
                use_top_by = st.radio("Build slip from", options=["Best EV", "Best Probability"], index=0)

            ranked = df.sort_values("best_ev", ascending=False) if use_top_by == "Best EV" else df.sort_values("best_prob", ascending=False)
            selected = ranked.head(int(slip_size)).copy()
            selected_probs = [float(x) for x in selected["best_prob"].tolist()]

            scenarios = calculate_slip_scenarios(selected_probs)
            if not scenarios:
                st.info("No built-in payout template available for that slip size.")
            else:
                metrics = []
                for key in ["power", "flex", "demon_power"]:
                    if key not in scenarios:
                        continue
                    sc = scenarios[key]
                    metrics.append(
                        {
                            "mode": key,
                            "win_all": sc.win_all_probability,
                            "exp_payout": sc.expected_payout,
                            "ev": sc.expected_value,
                            "hit_dist": ", ".join(f"{k}:{v:.1%}" for k, v in sorted(sc.hit_distribution.items())),
                        }
                    )

                with slip_col2:
                    st.dataframe(pd.DataFrame(metrics), use_container_width=True, hide_index=True)

                st.caption(
                    "Assumes independent legs and default payout templates (which can differ by region/promo)."
                )

            with st.expander("Selected legs used for slip simulation"):
                st.dataframe(
                    selected[["player_name", "stat_type", "prizepicks_line", "best_pick", "best_prob", "best_ev"]],
                    use_container_width=True,
                    hide_index=True,
                )

            st.download_button(
                "Download Full Results (CSV)",
                data=df.to_csv(index=False),
                file_name="prizepicks_ev_results.csv",
                mime="text/csv",
                use_container_width=True,
            )
else:
    st.info("Configure parameters on the left and click **Run EV Model**.")
