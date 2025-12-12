import os
import sqlite3

from memori import Memori
from openai import OpenAI


def get_sqlite_connection():
    return sqlite3.connect("memori.db")


def require_api_key(env_var: str) -> str:
    api_key = os.getenv(env_var)
    if not api_key:
        raise RuntimeError(f"Set {env_var} in your environment before running this script.")
    return api_key


def init_memori():
    client = OpenAI(api_key=require_api_key("OPENAI_API_KEY"))
    memori = Memori(conn=get_sqlite_connection).llm.register(client)
    entity_id = os.getenv("MEMORI_ENTITY_ID", "demo-entity")
    process_id = os.getenv("MEMORI_PROCESS_ID", "demo-cli")
    memori.attribution(entity_id=entity_id, process_id=process_id)
    memori.config.storage.build()
    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    return client, memori, model, entity_id, process_id


def main():
    client, memori, model, entity_id, process_id = init_memori()
    print(f"Memori interactive demo. entity_id={entity_id} process_id={process_id}")
    print("Type a message and press Enter. Type 'exit' or empty line to quit.\n")

    try:
        while True:
            user = input("You: ").strip()
            if user == "" or user.lower() in ("exit", "quit"):
                break

            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": user}],
            )
            print(f"AI: {response.choices[0].message.content}\n")
    except KeyboardInterrupt:
        print()
    finally:
        # Ensure async augmentation finishes before exit so memories persist.
        memori.augmentation.wait()
        print("Goodbye!")


if __name__ == "__main__":
    main()

