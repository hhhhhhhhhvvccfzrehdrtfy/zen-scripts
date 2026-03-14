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

## 2) Create your environment file (important)

```bash
cp .env.example .env
```

Then edit `.env` and set your key:

```dotenv
ODDS_API_KEY=your_real_key_here
LEAGUE_ID=7
STATE_CODE=FL
SPORT_KEY=basketball_nba
```

> The app now auto-loads `.env`, so you do **not** need to export manually every time.

## 3) Run the CLI model

```bash
python3 prizepicks_ev_model.py --top 25 --json-out ev.json
```

This prints top EV rows in your terminal and writes full output to `ev.json`.
You can still override values with flags like `--league-id`, `--state-code`, `--sport-key`, or `--api-key`.

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

1. Confirm your key is loaded (or paste it in sidebar).
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
