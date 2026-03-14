#!/usr/bin/env python3
"""
PrizePicks EV model using PrizePicks API + The Odds API.

Improvements over the initial version:
- Better game matching via normalized team tokens and start time proximity.
- Weighted market consensus across bookmakers.
- Additional metrics: confidence score, implied edge %, Kelly fraction.
- JSON export for downstream UIs.
- Safer network requests with retry/backoff.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime
from statistics import mean
from typing import Any, Dict, Iterable, List, Optional, Tuple

PRIZEPICKS_BASE = "https://api.prizepicks.com"
ODDS_API_BASE = "https://api.the-odds-api.com/v4"

NBA_STAT_TO_MARKET = {
    "Points": "player_points",
    "Rebounds": "player_rebounds",
    "Assists": "player_assists",
    "Pts+Rebs+Asts": "player_points_rebounds_assists",
    "3-PT Made": "player_threes",
    "Steals": "player_steals",
    "Blocks": "player_blocks",
    "Turnovers": "player_turnovers",
    "Pts+Rebs": "player_points_rebounds",
    "Pts+Asts": "player_points_assists",
    "Rebs+Asts": "player_rebounds_assists",
}

BOOKMAKER_WEIGHTS = {
    "draftkings": 1.2,
    "fanduel": 1.2,
    "betmgm": 1.0,
    "caesars": 1.0,
}


@dataclass
class ProjectionEV:
    projection_id: str
    player_name: str
    stat_type: str
    game_time: str
    prizepicks_line: float
    market_mu: float
    market_sigma: float
    market_sample_size: int
    over_prob: float
    under_prob: float
    edge_over: float
    edge_under: float
    ev_over: float
    ev_under: float
    confidence: float
    kelly_over: float
    kelly_under: float
    best_pick: str


@dataclass
class SlipScenario:
    mode: str
    picks: int
    win_all_probability: float
    hit_distribution: Dict[int, float]
    payout_table: Dict[int, float]
    expected_payout: float
    expected_value: float


def http_get_json(url: str, headers: Optional[Dict[str, str]] = None, retries: int = 3) -> Any:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "zen-scripts-ev-model/1.1"})
    delay = 0.5
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                payload = resp.read().decode("utf-8")
                return json.loads(payload)
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(delay)
            delay *= 2
    raise RuntimeError("unreachable")


def american_to_prob(price: int) -> float:
    if price > 0:
        return 100.0 / (price + 100.0)
    return -price / (-price + 100.0)


def remove_vig_two_way(prob_over_raw: float, prob_under_raw: float) -> Tuple[float, float]:
    total = prob_over_raw + prob_under_raw
    if total <= 0:
        return 0.5, 0.5
    return prob_over_raw / total, prob_under_raw / total


def standard_normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def infer_distribution_from_market_points(
    points: Iterable[Tuple[float, float, float]],
    default_sigma: float = 5.5,
) -> Tuple[float, float]:
    rows = [(line, p, w) for (line, p, w) in points if 0.02 < p < 0.98 and w > 0]
    if not rows:
        return 0.0, default_sigma

    mu_guess = mean(line for line, _, _ in rows)
    sigma = default_sigma

    for _ in range(200):
        grad_mu = 0.0
        grad_sigma = 0.0
        loss = 0.0
        for line, p_over, weight in rows:
            z = (mu_guess - line) / max(sigma, 1e-3)
            pred = standard_normal_cdf(z)
            err = pred - p_over
            loss += weight * err * err

            pdf = math.exp(-0.5 * z * z) / math.sqrt(2.0 * math.pi)
            d_pred_d_mu = pdf / max(sigma, 1e-3)
            d_pred_d_sigma = -pdf * (mu_guess - line) / max(sigma * sigma, 1e-3)

            grad_mu += 2.0 * weight * err * d_pred_d_mu
            grad_sigma += 2.0 * weight * err * d_pred_d_sigma

        lr = 0.06 / (1.0 + loss)
        mu_guess -= lr * grad_mu
        sigma -= lr * grad_sigma
        sigma = max(0.75, min(sigma, 20.0))

    return mu_guess, sigma


def prob_over_line(mu: float, sigma: float, line: float) -> float:
    z = (mu - line) / max(sigma, 1e-6)
    return standard_normal_cdf(z)


def normalize_player_name(name: str) -> str:
    cleaned = name.lower().replace(".", "").replace("'", "")
    for suffix in [" jr", " sr", " ii", " iii", " iv"]:
        if cleaned.endswith(suffix):
            cleaned = cleaned[: -len(suffix)]
    return " ".join(cleaned.split())


def normalize_team_name(name: str) -> str:
    return " ".join(name.lower().replace(".", "").split())


def parse_iso(ts: str) -> Optional[datetime]:
    if not ts:
        return None
    ts = ts.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(ts)
    except ValueError:
        return None


def get_prizepicks_projections(league_id: int, state_code: str, in_game: bool, per_page: int = 250) -> Dict[str, Any]:
    params = {
        "league_id": str(league_id),
        "per_page": str(per_page),
        "single_stat": "true",
        "in_game": str(in_game).lower(),
        "state_code": state_code,
        "game_mode": "prizepools",
    }
    url = f"{PRIZEPICKS_BASE}/projections?{urllib.parse.urlencode(params)}"
    return http_get_json(url)


def get_odds_events(api_key: str, sport_key: str) -> List[Dict[str, Any]]:
    params = {
        "apiKey": api_key,
        "regions": "us",
        "oddsFormat": "american",
        "dateFormat": "iso",
    }
    url = f"{ODDS_API_BASE}/sports/{sport_key}/events?{urllib.parse.urlencode(params)}"
    return http_get_json(url)


def get_event_player_props(api_key: str, sport_key: str, event_id: str, markets: List[str]) -> Dict[str, Any]:
    params = {
        "apiKey": api_key,
        "regions": "us",
        "oddsFormat": "american",
        "dateFormat": "iso",
        "bookmakers": ",".join(BOOKMAKER_WEIGHTS.keys()),
        "markets": ",".join(markets),
    }
    url = f"{ODDS_API_BASE}/sports/{sport_key}/events/{event_id}/odds?{urllib.parse.urlencode(params)}"
    return http_get_json(url)


def collect_market_points_for_player(
    odds_payload: Dict[str, Any],
    player_name: str,
    market_key: str,
) -> List[Tuple[float, float, float]]:
    target = normalize_player_name(player_name)
    points: List[Tuple[float, float, float]] = []

    for bookmaker in odds_payload.get("bookmakers", []):
        book_key = bookmaker.get("key", "")
        weight = BOOKMAKER_WEIGHTS.get(book_key, 1.0)

        for market in bookmaker.get("markets", []):
            if market.get("key") != market_key:
                continue

            grouped: Dict[float, Dict[str, int]] = {}
            for outcome in market.get("outcomes", []):
                desc = outcome.get("description")
                point = outcome.get("point")
                price = outcome.get("price")
                side = (outcome.get("name") or "").lower()

                if desc is None or point is None or price is None or side not in {"over", "under"}:
                    continue
                if normalize_player_name(desc) != target:
                    continue

                grouped.setdefault(float(point), {})[side] = int(price)

            for line, sides in grouped.items():
                if "over" in sides and "under" in sides:
                    p_over_raw = american_to_prob(sides["over"])
                    p_under_raw = american_to_prob(sides["under"])
                    p_over, _ = remove_vig_two_way(p_over_raw, p_under_raw)
                    points.append((line, p_over, weight))

    return points


def compute_pick_ev(hit_prob: float, payout_multiplier: float) -> float:
    return hit_prob * payout_multiplier - (1.0 - hit_prob)


def kelly_fraction(win_prob: float, payout_multiplier: float) -> float:
    b = payout_multiplier
    if b <= 0:
        return 0.0
    k = (b * win_prob - (1 - win_prob)) / b
    return max(0.0, min(k, 1.0))


def confidence_score(sample_size: int, edge_abs: float) -> float:
    sample_component = min(sample_size / 18.0, 1.0)
    edge_component = min(edge_abs / 0.12, 1.0)
    return round(100 * (0.65 * sample_component + 0.35 * edge_component), 1)


def hit_distribution(probabilities: List[float]) -> Dict[int, float]:
    """Distribution for exact hits across picks with independent-leg assumption."""
    dist = {0: 1.0}
    for p in probabilities:
        next_dist: Dict[int, float] = {}
        for hits, prob in dist.items():
            next_dist[hits] = next_dist.get(hits, 0.0) + prob * (1.0 - p)
            next_dist[hits + 1] = next_dist.get(hits + 1, 0.0) + prob * p
        dist = next_dist
    return dist


def build_slip_scenario(probabilities: List[float], mode: str, payout_table: Dict[int, float]) -> SlipScenario:
    dist = hit_distribution(probabilities)
    expected_payout = sum(dist.get(hits, 0.0) * mult for hits, mult in payout_table.items())
    return SlipScenario(
        mode=mode,
        picks=len(probabilities),
        win_all_probability=dist.get(len(probabilities), 0.0),
        hit_distribution=dist,
        payout_table=payout_table,
        expected_payout=expected_payout,
        expected_value=expected_payout - 1.0,
    )


def calculate_slip_scenarios(probabilities: List[float]) -> Dict[str, SlipScenario]:
    """
    Estimate chances/EV for common card formats.
    Payout assumptions are configurable in code and may differ by app, promo, and state.
    """
    n = len(probabilities)
    scenarios: Dict[str, SlipScenario] = {}

    default_power = {
        2: {2: 3.0},
        3: {3: 5.0},
        4: {4: 10.0},
        5: {5: 20.0},
        6: {6: 25.0},
    }
    default_flex = {
        3: {3: 2.25, 2: 1.25},
        4: {4: 5.0, 3: 1.5},
        5: {5: 10.0, 4: 2.0, 3: 0.4},
        6: {6: 25.0, 5: 2.0, 4: 0.4},
    }

    if n in default_power:
        scenarios["power"] = build_slip_scenario(probabilities, "power", default_power[n])
    if n in default_flex:
        scenarios["flex"] = build_slip_scenario(probabilities, "flex", default_flex[n])

    # Demon power-play approximation (higher-risk/higher-reward multiplier model).
    demon_power = {
        2: {2: 4.0},
        3: {3: 8.0},
        4: {4: 18.0},
        5: {5: 35.0},
    }
    if n in demon_power:
        scenarios["demon_power"] = build_slip_scenario(probabilities, "demon_power", demon_power[n])

    return scenarios


def build_external_game_map(projections_payload: Dict[str, Any], odds_events: List[Dict[str, Any]]) -> Dict[str, str]:
    odds_index: List[Tuple[str, str, str, Optional[datetime]]] = []
    for evt in odds_events:
        odds_index.append(
            (
                evt.get("id"),
                normalize_team_name(evt.get("home_team") or ""),
                normalize_team_name(evt.get("away_team") or ""),
                parse_iso(evt.get("commence_time") or ""),
            )
        )

    mapping: Dict[str, str] = {}
    for ent in projections_payload.get("included", []):
        if ent.get("type") != "game":
            continue

        attrs = ent.get("attributes", {})
        ext = attrs.get("external_game_id")
        if not ext:
            continue

        pp_home = normalize_team_name(attrs.get("home_team") or "")
        pp_away = normalize_team_name(attrs.get("away_team") or "")
        pp_time = parse_iso(attrs.get("start_time") or "")

        best_event_id = None
        best_score = -1.0
        for event_id, o_home, o_away, o_time in odds_index:
            score = 0.0
            if pp_home and (pp_home in o_home or o_home in pp_home):
                score += 2
            if pp_away and (pp_away in o_away or o_away in pp_away):
                score += 2

            if pp_time and o_time:
                mins = abs((pp_time - o_time).total_seconds()) / 60.0
                if mins <= 5:
                    score += 2
                elif mins <= 60:
                    score += 1

            if score > best_score:
                best_score = score
                best_event_id = event_id

        if best_event_id and best_score >= 2:
            mapping[ext] = best_event_id

    return mapping


def model_ev(
    projections_payload: Dict[str, Any],
    odds_events_by_game: Dict[str, Dict[str, Any]],
    payout_multiplier: float,
    fallback_sigma: float,
) -> List[ProjectionEV]:
    players_by_id: Dict[str, str] = {}
    games_by_id: Dict[str, Dict[str, Any]] = {}
    for entity in projections_payload.get("included", []):
        typ = entity.get("type")
        ent_id = entity.get("id")
        attrs = entity.get("attributes", {})
        if typ == "new_player":
            players_by_id[ent_id] = attrs.get("name", "")
        elif typ == "game":
            games_by_id[ent_id] = attrs

    rows: List[ProjectionEV] = []
    for proj in projections_payload.get("data", []):
        attrs = proj.get("attributes", {})
        stat_type = attrs.get("stat_type")
        line_score = attrs.get("line_score")
        if stat_type not in NBA_STAT_TO_MARKET or line_score is None:
            continue

        rel = proj.get("relationships", {})
        player_id = rel.get("new_player", {}).get("data", {}).get("id")
        game_id = rel.get("game", {}).get("data", {}).get("id")

        player_name = players_by_id.get(player_id, "")
        game_attrs = games_by_id.get(game_id, {})
        external_game_id = game_attrs.get("external_game_id")
        game_time = game_attrs.get("start_time", "")
        if not player_name or not external_game_id:
            continue

        odds_payload = odds_events_by_game.get(external_game_id)
        if not odds_payload:
            continue

        market_points = collect_market_points_for_player(
            odds_payload=odds_payload,
            player_name=player_name,
            market_key=NBA_STAT_TO_MARKET[stat_type],
        )
        if not market_points:
            continue

        mu, sigma = infer_distribution_from_market_points(market_points, fallback_sigma)
        pp_line = float(line_score)
        over_prob = max(0.01, min(prob_over_line(mu, sigma, pp_line), 0.99))
        under_prob = 1.0 - over_prob

        ev_over = compute_pick_ev(over_prob, payout_multiplier)
        ev_under = compute_pick_ev(under_prob, payout_multiplier)
        edge_over = over_prob - 0.5
        edge_under = under_prob - 0.5
        best_pick = "over" if ev_over >= ev_under else "under"
        best_edge_abs = abs(edge_over) if best_pick == "over" else abs(edge_under)

        rows.append(
            ProjectionEV(
                projection_id=proj.get("id", ""),
                player_name=player_name,
                stat_type=stat_type,
                game_time=game_time,
                prizepicks_line=pp_line,
                market_mu=mu,
                market_sigma=sigma,
                market_sample_size=len(market_points),
                over_prob=over_prob,
                under_prob=under_prob,
                edge_over=edge_over,
                edge_under=edge_under,
                ev_over=ev_over,
                ev_under=ev_under,
                confidence=confidence_score(len(market_points), best_edge_abs),
                kelly_over=kelly_fraction(over_prob, payout_multiplier),
                kelly_under=kelly_fraction(under_prob, payout_multiplier),
                best_pick=best_pick,
            )
        )

    rows.sort(key=lambda r: max(r.ev_over, r.ev_under), reverse=True)
    return rows


def run_model(
    api_key: str,
    league_id: int = 7,
    state_code: str = "FL",
    sport_key: str = "basketball_nba",
    in_game: bool = True,
    payout_multiplier: float = 1.0,
    fallback_sigma: float = 5.5,
    sleep_between_events_ms: int = 150,
) -> List[ProjectionEV]:
    projections = get_prizepicks_projections(league_id, state_code, in_game)
    odds_events = get_odds_events(api_key, sport_key)
    ext_to_event = build_external_game_map(projections, odds_events)

    used_markets = sorted(
        {
            NBA_STAT_TO_MARKET.get(item.get("attributes", {}).get("stat_type"))
            for item in projections.get("data", [])
        }
        - {None}
    )

    odds_events_by_game: Dict[str, Dict[str, Any]] = {}
    for ext_game_id, event_id in ext_to_event.items():
        try:
            odds_payload = get_event_player_props(api_key, sport_key, event_id, used_markets)
            odds_events_by_game[ext_game_id] = odds_payload
            time.sleep(max(sleep_between_events_ms, 0) / 1000.0)
        except Exception as exc:
            print(f"WARN: odds fetch failed for event {event_id}: {exc}", file=sys.stderr)

    return model_ev(projections, odds_events_by_game, payout_multiplier, fallback_sigma)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="PrizePicks EV model (NBA)")
    p.add_argument("--league-id", type=int, default=7)
    p.add_argument("--state-code", default="FL")
    p.add_argument("--sport-key", default="basketball_nba")
    p.add_argument("--api-key", default=os.getenv("ODDS_API_KEY", ""))
    p.add_argument("--in-game", action="store_true", default=True)
    p.add_argument("--not-in-game", action="store_false", dest="in_game")
    p.add_argument("--payout-multiplier", type=float, default=1.0)
    p.add_argument("--fallback-sigma", type=float, default=5.5)
    p.add_argument("--top", type=int, default=25)
    p.add_argument("--sleep-between-events-ms", type=int, default=150)
    p.add_argument("--json-out", default="", help="Optional output file path for full JSON rows")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    if not args.api_key:
        print("Missing Odds API key. Set --api-key or ODDS_API_KEY env var.", file=sys.stderr)
        return 2

    rows = run_model(
        api_key=args.api_key,
        league_id=args.league_id,
        state_code=args.state_code,
        sport_key=args.sport_key,
        in_game=args.in_game,
        payout_multiplier=args.payout_multiplier,
        fallback_sigma=args.fallback_sigma,
        sleep_between_events_ms=args.sleep_between_events_ms,
    )

    if not rows:
        print("No matched projections found. Try different state/league/time window.")
        return 0

    print(
        "\t".join(
            [
                "player",
                "stat",
                "line",
                "over_prob",
                "under_prob",
                "ev_over",
                "ev_under",
                "best",
                "confidence",
                "samples",
                "projection_id",
            ]
        )
    )

    for row in rows[: args.top]:
        print(
            "\t".join(
                [
                    row.player_name,
                    row.stat_type,
                    f"{row.prizepicks_line:.2f}",
                    f"{row.over_prob:.3f}",
                    f"{row.under_prob:.3f}",
                    f"{row.ev_over:.3f}",
                    f"{row.ev_under:.3f}",
                    row.best_pick,
                    f"{row.confidence:.1f}",
                    str(row.market_sample_size),
                    row.projection_id,
                ]
            )
        )

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as f:
            json.dump([asdict(r) for r in rows], f, indent=2)
        print(f"Wrote {len(rows)} rows to {args.json_out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
