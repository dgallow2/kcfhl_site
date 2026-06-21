import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path

import streamlit as st

st.set_page_config(page_title="KCFHL Trade Tool", layout="wide")

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = Path(__file__).resolve().parents[2]
ROSTERS_PATH = ROOT_DIR / "01 - site-pages" / "01 - current" / "data" / "rosters.json"
TRANSACTIONS_PATH = SCRIPT_DIR / "transactions.json"

ROSTER_BUCKETS = [
    ("forwards", "Forwards"),
    ("defence", "Defence"),
    ("goalies", "Goalies"),
    ("minor_pro", "Minor Pro"),
    ("prospects", "Prospects"),
]


def load_json(path: Path, default_value):
    if not path.exists():
        return deepcopy(default_value)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, value):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(value, f, indent=2, ensure_ascii=False)
        f.write("\n")


def normalize_schema(data):
    slot_limits = data.get("slot_limits", {})
    entry_years = slot_limits.get("entry_years", ["2026", "2027"])
    entry_rounds = slot_limits.get("entry_rounds", ["1st", "2nd", "3rd", "4th"])
    minor_pro_rounds = slot_limits.get("minor_pro_rounds", ["1st", "2nd", "3rd", "4th", "5th", "6th"])

    for team in data.get("teams", []):
        team.setdefault("roster", {})
        for bucket, _ in ROSTER_BUCKETS:
            team["roster"].setdefault(bucket, [])

        team.setdefault("entry_picks", {})
        for year in entry_years:
            year_map = team["entry_picks"].setdefault(year, {})
            for round_name in entry_rounds:
                year_map.setdefault(round_name, [])

        team.setdefault("minor_pro_picks", {})
        for round_name in minor_pro_rounds:
            team["minor_pro_picks"].setdefault(round_name, [])

    return data


def team_lookup(data):
    return {team["id"]: team for team in data.get("teams", [])}


def build_entry_pick_tokens(team, entry_years, entry_rounds):
    tokens = []
    for year in entry_years:
        for round_name in entry_rounds:
            owners = team.get("entry_picks", {}).get(year, {}).get(round_name, [])
            for owner in owners:
                tokens.append({"kind": "entry", "year": year, "round": round_name, "owner": owner})
    return tokens


def build_minor_pro_pick_tokens(team, minor_pro_rounds):
    tokens = []
    for round_name in minor_pro_rounds:
        owners = team.get("minor_pro_picks", {}).get(round_name, [])
        for owner in owners:
            tokens.append({"kind": "minor_pro", "round": round_name, "owner": owner})
    return tokens


def token_label(token):
    if token["kind"] == "entry":
        return f"{token['year']} {token['round']} ({token['owner']})"
    return f"Minor Pro {token['round']} ({token['owner']})"


def token_key(token, index):
    year = token.get("year", "-")
    return f"{token['kind']}|{year}|{token['round']}|{token['owner']}|{index}"


def serialize_tokens(tokens):
    return [dict(token) for token in tokens]


def ensure_assets_exist(team, outgoing):
    errors = []

    for bucket, selected in outgoing["roster"].items():
        current = team["roster"].get(bucket, [])
        for player in selected:
            if player not in current:
                errors.append(f"{team['name']}: {player} not found in {bucket}.")

    for token in outgoing["entry_picks"]:
        current = team.get("entry_picks", {}).get(token["year"], {}).get(token["round"], [])
        if token["owner"] not in current:
            errors.append(
                f"{team['name']}: {token_label(token)} not found in entry picks."
            )

    for token in outgoing["minor_pro_picks"]:
        current = team.get("minor_pro_picks", {}).get(token["round"], [])
        if token["owner"] not in current:
            errors.append(
                f"{team['name']}: {token_label(token)} not found in minor pro picks."
            )

    return errors


def transfer_assets(source, target, outgoing):
    for bucket, selected in outgoing["roster"].items():
        for player in selected:
            source["roster"][bucket].remove(player)
            target["roster"][bucket].append(player)

    for token in outgoing["entry_picks"]:
        source_bucket = source["entry_picks"][token["year"]][token["round"]]
        source_bucket.remove(token["owner"])
        target["entry_picks"][token["year"]][token["round"]].append(token["owner"])

    for token in outgoing["minor_pro_picks"]:
        source_bucket = source["minor_pro_picks"][token["round"]]
        source_bucket.remove(token["owner"])
        target["minor_pro_picks"][token["round"]].append(token["owner"])


def check_roster_limits(data):
    limits = data.get("slot_limits", {})
    errors = []
    for team in data.get("teams", []):
        for bucket, label in ROSTER_BUCKETS:
            cap = limits.get(bucket)
            if cap is None:
                continue
            count = len(team.get("roster", {}).get(bucket, []))
            if count > cap:
                errors.append(f"{team['name']} exceeds {label} limit ({count}/{cap}).")
    return errors


def render_team_snapshot(team, entry_years, entry_rounds, minor_pro_rounds):
    for bucket, label in ROSTER_BUCKETS:
        values = team["roster"].get(bucket, [])
        st.markdown(f"**{label} ({len(values)})**")
        st.write(", ".join(values) if values else "(Empty)")

    st.markdown("**Entry Picks**")
    for year in entry_years:
        lines = []
        for round_name in entry_rounds:
            owners = team.get("entry_picks", {}).get(year, {}).get(round_name, [])
            text = ", ".join(owners) if owners else "None"
            lines.append(f"{round_name}: {text}")
        st.write(f"{year}: " + " | ".join(lines))

    st.markdown("**Minor Pro Picks**")
    lines = []
    for round_name in minor_pro_rounds:
        owners = team.get("minor_pro_picks", {}).get(round_name, [])
        text = ", ".join(owners) if owners else "None"
        lines.append(f"{round_name}: {text}")
    st.write(" | ".join(lines))


def summarize_outgoing(outgoing):
    parts = []
    for bucket, label in ROSTER_BUCKETS:
        values = outgoing["roster"].get(bucket, [])
        if values:
            parts.append(f"{label}: {', '.join(values)}")

    if outgoing["entry_picks"]:
        parts.append("Entry Picks: " + ", ".join(token_label(t) for t in outgoing["entry_picks"]))

    if outgoing["minor_pro_picks"]:
        parts.append(
            "Minor Pro Picks: " + ", ".join(token_label(t) for t in outgoing["minor_pro_picks"])
        )

    return " | ".join(parts) if parts else "nothing"


def main():
    st.title("KCFHL Trade Tool")
    st.caption(f"Roster source: {ROSTERS_PATH}")

    if not ROSTERS_PATH.exists():
        st.error(f"Missing roster file: {ROSTERS_PATH}")
        return

    data = normalize_schema(load_json(ROSTERS_PATH, {}))
    transactions = load_json(TRANSACTIONS_PATH, [])

    teams = data.get("teams", [])
    if len(teams) < 2:
        st.error("Need at least two teams in rosters.json.")
        return

    slot_limits = data.get("slot_limits", {})
    entry_years = slot_limits.get("entry_years", ["2026", "2027"])
    entry_rounds = slot_limits.get("entry_rounds", ["1st", "2nd", "3rd", "4th"])
    minor_pro_rounds = slot_limits.get("minor_pro_rounds", ["1st", "2nd", "3rd", "4th", "5th", "6th"])

    team_name_by_id = {team["id"]: team["name"] for team in teams}
    team_ids = [team["id"] for team in teams]

    left_sel, right_sel = st.columns(2)
    with left_sel:
        team_a_id = st.selectbox(
            "Select Team A",
            team_ids,
            index=0,
            format_func=lambda team_id: team_name_by_id[team_id],
            key="team_a",
        )

    team_b_options = [team_id for team_id in team_ids if team_id != team_a_id]
    with right_sel:
        team_b_id = st.selectbox(
            "Select Team B",
            team_b_options,
            index=0,
            format_func=lambda team_id: team_name_by_id[team_id],
            key="team_b",
        )

    lookup = team_lookup(data)
    team_a = lookup[team_a_id]
    team_b = lookup[team_b_id]

    st.subheader("Select Outgoing Assets")
    col_a, col_b = st.columns(2)

    outgoing_a = {"roster": {}, "entry_picks": [], "minor_pro_picks": []}
    outgoing_b = {"roster": {}, "entry_picks": [], "minor_pro_picks": []}

    with col_a:
        st.markdown(f"**Outgoing from {team_a['name']}**")
        for bucket, label in ROSTER_BUCKETS:
            outgoing_a["roster"][bucket] = st.multiselect(
                label,
                team_a["roster"][bucket],
                default=[],
                key=f"a_{bucket}",
            )

        entry_tokens_a = build_entry_pick_tokens(team_a, entry_years, entry_rounds)
        entry_a_map = {token_key(token, idx): token for idx, token in enumerate(entry_tokens_a)}
        selected_entry_a = st.multiselect(
            "Entry Picks",
            list(entry_a_map.keys()),
            default=[],
            format_func=lambda key: token_label(entry_a_map[key]),
            key="a_entry_picks",
        )
        outgoing_a["entry_picks"] = [entry_a_map[key] for key in selected_entry_a]

        minor_tokens_a = build_minor_pro_pick_tokens(team_a, minor_pro_rounds)
        minor_a_map = {token_key(token, idx): token for idx, token in enumerate(minor_tokens_a)}
        selected_minor_a = st.multiselect(
            "Minor Pro Picks",
            list(minor_a_map.keys()),
            default=[],
            format_func=lambda key: token_label(minor_a_map[key]),
            key="a_minor_pro_picks",
        )
        outgoing_a["minor_pro_picks"] = [minor_a_map[key] for key in selected_minor_a]

    with col_b:
        st.markdown(f"**Outgoing from {team_b['name']}**")
        for bucket, label in ROSTER_BUCKETS:
            outgoing_b["roster"][bucket] = st.multiselect(
                label,
                team_b["roster"][bucket],
                default=[],
                key=f"b_{bucket}",
            )

        entry_tokens_b = build_entry_pick_tokens(team_b, entry_years, entry_rounds)
        entry_b_map = {token_key(token, idx): token for idx, token in enumerate(entry_tokens_b)}
        selected_entry_b = st.multiselect(
            "Entry Picks",
            list(entry_b_map.keys()),
            default=[],
            format_func=lambda key: token_label(entry_b_map[key]),
            key="b_entry_picks",
        )
        outgoing_b["entry_picks"] = [entry_b_map[key] for key in selected_entry_b]

        minor_tokens_b = build_minor_pro_pick_tokens(team_b, minor_pro_rounds)
        minor_b_map = {token_key(token, idx): token for idx, token in enumerate(minor_tokens_b)}
        selected_minor_b = st.multiselect(
            "Minor Pro Picks",
            list(minor_b_map.keys()),
            default=[],
            format_func=lambda key: token_label(minor_b_map[key]),
            key="b_minor_pro_picks",
        )
        outgoing_b["minor_pro_picks"] = [minor_b_map[key] for key in selected_minor_b]

    errors = []
    errors.extend(ensure_assets_exist(team_a, outgoing_a))
    errors.extend(ensure_assets_exist(team_b, outgoing_b))

    proposed = deepcopy(data)
    proposed_lookup = team_lookup(proposed)

    if not errors:
        transfer_assets(proposed_lookup[team_a_id], proposed_lookup[team_b_id], outgoing_a)
        transfer_assets(proposed_lookup[team_b_id], proposed_lookup[team_a_id], outgoing_b)
        errors.extend(check_roster_limits(proposed))

    st.subheader("Preview")
    preview_left, preview_right = st.columns(2)

    with preview_left:
        st.markdown(f"#### {team_a['name']} (after trade)")
        render_team_snapshot(proposed_lookup[team_a_id], entry_years, entry_rounds, minor_pro_rounds)

    with preview_right:
        st.markdown(f"#### {team_b['name']} (after trade)")
        render_team_snapshot(proposed_lookup[team_b_id], entry_years, entry_rounds, minor_pro_rounds)

    if errors:
        st.error(" | ".join(errors))

    if st.button("Confirm Trade", disabled=bool(errors)):
        now = datetime.now()
        proposed["last_updated"] = now.strftime("%Y-%m-%d")

        tx = {
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": (
                f"{team_a['name']} sent {summarize_outgoing(outgoing_a)} to {team_b['name']}; "
                f"{team_b['name']} sent {summarize_outgoing(outgoing_b)} to {team_a['name']}"
            ),
            "details": {
                "team_a": {
                    "id": team_a_id,
                    "name": team_a["name"],
                    "sent": {
                        "roster": outgoing_a["roster"],
                        "entry_picks": serialize_tokens(outgoing_a["entry_picks"]),
                        "minor_pro_picks": serialize_tokens(outgoing_a["minor_pro_picks"]),
                    },
                },
                "team_b": {
                    "id": team_b_id,
                    "name": team_b["name"],
                    "sent": {
                        "roster": outgoing_b["roster"],
                        "entry_picks": serialize_tokens(outgoing_b["entry_picks"]),
                        "minor_pro_picks": serialize_tokens(outgoing_b["minor_pro_picks"]),
                    },
                },
            },
        }

        transactions.insert(0, tx)
        save_json(ROSTERS_PATH, proposed)
        save_json(TRANSACTIONS_PATH, transactions)
        st.success("Trade saved. rosters.json and transactions.json were updated.")

    st.subheader("Transaction History")
    if not transactions:
        st.write("No trades recorded yet.")
    else:
        for entry in transactions:
            with st.expander(f"{entry['timestamp']} — {entry['summary']}"):
                st.json(entry.get("details", {}))


if __name__ == "__main__":
    main()
