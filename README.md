# Memori Quickstart

Minimal example of running Memori with OpenAI and SQLite, adapted from the official quickstart guide ([source](https://memorilabs.ai/docs/getting-started/quick-start/)).

## What this demo shows
- Automatic memory: Memori captures facts from LLM conversations and persists them to SQLite.
- Attribution: `entity_id` + `process_id` isolate memories per user/app.
- Recall: Subsequent calls pull stored facts so the model can answer with prior context.
- Pluggable storage: SQLite here; can swap for Postgres/others in real apps.

## Prerequisites
- Python 3.10+
- One of:
  - `OPENAI_API_KEY` for OpenAI (default provider)
  - `GOOGLE_API_KEY` for Gemini (`MEMORI_PROVIDER=gemini`)

## Setup
```bash
cd /Users/meghaarora/Repos/memori-quickstart
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 🚀 Interactive Web Demo (Recommended)

Start the web interface for an interactive chat experience with persistent memory:

```bash
# Set your API key
export OPENAI_API_KEY="your-api-key-here"
# or for Gemini:
# export MEMORI_PROVIDER=gemini
# export GOOGLE_API_KEY="your-google-api-key"

# Start the web server
python app.py
```

Then open your browser to `http://localhost:5000` to:
- **Chat Interface**: Have real-time conversations where the AI remembers information you share
- **Theory Page**: Learn about how Memori works under the hood
- **Memory Persistence**: Each session maintains its own isolated memory

The web interface features:
- Beautiful Memori Labs themed UI
- Real-time chat with memory recall
- Session-based memory isolation
- Reset functionality to start fresh
- Responsive design for mobile and desktop

## Run the script demo
```bash
# set env (copy env.sample to .env and edit, or export manually)
# default: OpenAI
# export OPENAI_API_KEY="your-api-key-here"
python quickstart.py

# or use Gemini (free tier available)
# export MEMORI_PROVIDER=gemini
# export GOOGLE_API_KEY="your-google-api-key"
# optional: override model
# export GEMINI_MODEL="gemini-1.5-flash"
python quickstart.py
```

You should see two responses: the first stores the fact, and the second recalls it from Memori.

## Inspect stored memories (optional)
```bash
echo "select * from memori_entity_fact;" | sqlite3 memori.db
```

## Summary
- Run `python quickstart.py` to show two-turn capture and recall.
- Show the stored fact: `sqlite3 memori.db "select content, created_at from memori_entity_fact;"`.
- Change `entity_id` in `quickstart.py` (or temporarily in code) and rerun to show isolation: the new entity starts blank; switching back restores recall.
- Add a second fact (edit the first prompt to mention city + color) and ask a combined question to show multi-fact recall.
- Optional reset: delete `memori.db` for a cold-start demo.

## Interactive CLI demo
- Start the loop: `python interactive_cli.py`
- Type questions; memories accumulate per `MEMORI_ENTITY_ID`/`MEMORI_PROCESS_ID` (defaults: `demo-entity` / `demo-cli`).
- Stop with `exit` or blank line; the script waits for augmentation to finish so new facts persist.

## How it works (high level)
- Schema build: On first run, Memori creates tables like `memori_entity_fact`, `memori_conversation`, etc., in SQLite.
- LLM call: The first chat completion runs through OpenAI (default) and Memori queues augmentation to extract/store facts.
- Augmentation: `memori.augmentation.wait()` flushes async writes so the short script exits only after memory is persisted.
- Recall: A new client + Memori instance loads stored context and surfaces it to the model, enabling grounded answers.
- Attribution: `entity_id`/`process_id` scope memories, so different users/apps do not leak context.

## Notes
- The script creates `memori.db` locally and will reuse it on subsequent runs.
- Configuration values (entity/process IDs, model name) match the quickstart so you can verify behavior easily.
- `MEMORI_PROVIDER` can be `openai` (default) or `gemini`; model can be overridden via `OPENAI_MODEL` or `GEMINI_MODEL`.

