# zen-scripts

## PrizePicks EV model + futuristic dashboard

This repo includes:
- `prizepicks_ev_model.py`: CLI EV engine
- `prizepicks_ev_dashboard.py`: Streamlit dashboard UI

Both combine:
- PrizePicks projections API
- The Odds API player prop markets

## 1) Install requirements

```bash
python3 -m pip install streamlit pandas
```

## 2) Set your Odds API key

```bash
export ODDS_API_KEY="<your_the_odds_api_key>"
```

## 3) Run the CLI model

```bash
python3 prizepicks_ev_model.py --league-id 7 --state-code FL --sport-key basketball_nba --top 25 --json-out ev.json
```

This prints top EV rows in your terminal and writes full output to `ev.json`.

## 4) Open the dashboard

Start Streamlit:

```bash
python3 -m streamlit run prizepicks_ev_dashboard.py
```

Then open this URL in your browser:

```text
http://localhost:8501
```

## Dashboard quick use

1. Enter your Odds API key in the sidebar (or rely on `ODDS_API_KEY`).
2. Pick league/state/sport settings.
3. Click **Run EV Model**.
4. View:
   - Ranked EV board
   - Slip Probability Lab (Power / Flex / Demon assumptions)
   - CSV download button

## EV model features

- Better game matching using team names + start-time proximity.
- Weighted bookmaker consensus and retry/backoff network handling.
- Additional metrics:
  - confidence score
  - Kelly fraction sizing hints
  - market sample size, inferred market mean/sigma
- Optional JSON export for downstream analysis.
- Slip probability modeling for common cards (Power/Flex/Demon Power assumptions), including hit distributions and EV.

> This is a modeling utility, not betting advice.
