
import json
import streamlit as st
from datetime import datetime
from copy import deepcopy

st.set_page_config(page_title="KCFHL Trade Tool (Two-Team)", layout="wide")

@st.cache_resource
def load_data():
    with open("rosters.json", "r", encoding="utf-8") as f:
        rosters = json.load(f)
    try:
        with open("transactions.json", "r", encoding="utf-8") as f:
            tx = json.load(f)
    except FileNotFoundError:
        tx = []
    return rosters, tx

def save_rosters(rosters):
    with open("rosters.json", "w", encoding="utf-8") as f:
        json.dump(rosters, f, indent=2, ensure_ascii=False)

def save_transactions(transactions):
    with open("transactions.json", "w", encoding="utf-8") as f:
        json.dump(transactions, f, indent=2, ensure_ascii=False)

def multiselect_with_search(label, options, key=None):
    return st.multiselect(label, options, default=[], key=key)

st.title("KCFHL Trade Tool — Two-Team Trades (Phase 1a)")

rosters, transactions = load_data()
teams = list(rosters.keys())

left_sel, right_sel = st.columns(2)
with left_sel:
    team_a = st.selectbox("Select Team A", teams, index=0, key="team_a")
with right_sel:
    team_b = st.selectbox("Select Team B", [t for t in teams if t != team_a], index=0, key="team_b")

st.subheader("Select Outgoing Assets")

colA, colB = st.columns(2)
with colA:
    st.markdown(f"**Outgoing from {team_a}**")
    a_players   = multiselect_with_search("Players",   rosters[team_a]["players"], key="a_players")
    a_minorpro  = multiselect_with_search("Minor Pro", rosters[team_a]["minor_pro"], key="a_minorpro")
    a_prospects = multiselect_with_search("Prospects", rosters[team_a]["prospects"], key="a_prospects")
    a_picks     = multiselect_with_search("Picks",     rosters[team_a]["picks"], key="a_picks")
with colB:
    st.markdown(f"**Outgoing from {team_b}**")
    b_players   = multiselect_with_search("Players",   rosters[team_b]["players"], key="b_players")
    b_minorpro  = multiselect_with_search("Minor Pro", rosters[team_b]["minor_pro"], key="b_minorpro")
    b_prospects = multiselect_with_search("Prospects", rosters[team_b]["prospects"], key="b_prospects")
    b_picks     = multiselect_with_search("Picks",     rosters[team_b]["picks"], key="b_picks")

st.subheader("Preview Trade")
preview_cols = st.columns(2)

proposed = deepcopy(rosters)

# Remove outgoing from A
for lst_name, sel in [("players", a_players), ("minor_pro", a_minorpro), ("prospects", a_prospects), ("picks", a_picks)]:
    proposed[team_a][lst_name] = [x for x in proposed[team_a][lst_name] if x not in sel]

# Remove outgoing from B
for lst_name, sel in [("players", b_players), ("minor_pro", b_minorpro), ("prospects", b_prospects), ("picks", b_picks)]:
    proposed[team_b][lst_name] = [x for x in proposed[team_b][lst_name] if x not in sel]

# Append incoming
for lst_name, sel in [("players", b_players), ("minor_pro", b_minorpro), ("prospects", b_prospects), ("picks", b_picks)]:
    proposed[team_a][lst_name].extend(sel)
for lst_name, sel in [("players", a_players), ("minor_pro", a_minorpro), ("prospects", a_prospects), ("picks", a_picks)]:
    proposed[team_b][lst_name].extend(sel)

with preview_cols[0]:
    st.markdown(f"#### {team_a} (after trade)")
    for category in ["players", "minor_pro", "prospects", "picks"]:
        st.markdown(f"**{category.capitalize()}**")
        st.write(", ".join(proposed[team_a][category]) if proposed[team_a][category] else "—")

with preview_cols[1]:
    st.markdown(f"#### {team_b} (after trade)")
    for category in ["players", "minor_pro", "prospects", "picks"]:
        st.markdown(f"**{category.capitalize()}**")
        st.write(", ".join(proposed[team_b][category]) if proposed[team_b][category] else "—")

# Validation
errors = []
if team_a == team_b:
    errors.append("Team A and Team B must be different.")

def ensure_subset(team, field, selected):
    missing = [x for x in selected if x not in rosters[team][field]]
    if missing:
        errors.append(f"{team}: {field} contains items not on roster: {missing}")

ensure_subset(team_a, "players", a_players)
ensure_subset(team_a, "minor_pro", a_minorpro)
ensure_subset(team_a, "prospects", a_prospects)
ensure_subset(team_a, "picks", a_picks)

ensure_subset(team_b, "players", b_players)
ensure_subset(team_b, "minor_pro", b_minorpro)
ensure_subset(team_b, "prospects", b_prospects)
ensure_subset(team_b, "picks", b_picks)

if errors:
    st.error(" | ".join(errors))

def build_trade_summary(from_team, to_team, a_out, b_out):
    def assets_to_text(assets):
        combined = assets["players"] + assets["minor_pro"] + assets["prospects"] + assets["picks"]
        return ", ".join(combined) if combined else "nothing"

    left = f"{from_team} traded {assets_to_text(a_out)} to {to_team}"
    right = f"{to_team} traded {assets_to_text(b_out)} to {from_team}"
    return f"{left}; {right}"

if st.button("Confirm Trade", disabled=bool(errors)):
    rosters = proposed
    a_out = {"players": a_players, "minor_pro": a_minorpro, "prospects": a_prospects, "picks": a_picks}
    b_out = {"players": b_players, "minor_pro": b_minorpro, "prospects": b_prospects, "picks": b_picks}
    summary = build_trade_summary(team_a, team_b, a_out, b_out)
    entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "summary": summary,
        "details": {
            "teams": [
                {"team": team_a, "sent": a_out, "received": b_out},
                {"team": team_b, "sent": b_out, "received": a_out}
            ]
        }
    }
    transactions.insert(0, entry)
    save_rosters(rosters)
    save_transactions(transactions)
    st.success("Trade saved! rosters.json and transactions.json updated.")

st.subheader("Transaction History")
if not transactions:
    st.write("No trades recorded yet.")
else:
    for tx in transactions:
        with st.expander(f"{tx['timestamp']} — {tx['summary']}"):
            st.json(tx["details"])
