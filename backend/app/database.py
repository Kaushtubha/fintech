"""
FinSight Database Connection & Query Helper
Provides thread-safe connections to the analytical DuckDB database.
"""

import os
import duckdb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "finsight.duckdb")
CLEAN_CSV = os.path.join(BASE_DIR, "data", "processed", "transactions_cleaned.csv")


def get_db_connection(read_only: bool = True):
    """
    Returns a DuckDB connection. If the database file is missing,
    it automatically initializes it from the cleaned CSV.
    """
    if not os.path.exists(DB_PATH):
        con = duckdb.connect(DB_PATH)
        con.execute(f"CREATE TABLE transactions AS SELECT * FROM read_csv_auto('{CLEAN_CSV.replace(os.sep, '/')}')")
        return con

    return duckdb.connect(DB_PATH, read_only=read_only)


def execute_query(sql: str, params: list = None) -> list[dict]:
    """
    Executes a SQL query and returns a list of dictionaries with column names as keys.
    """
    con = get_db_connection(read_only=True)
    try:
        if params:
            res = con.execute(sql, params)
        else:
            res = con.execute(sql)

        cols = [desc[0] for desc in res.description]
        rows = res.fetchall()
        return [dict(zip(cols, row)) for row in rows]
    finally:
        con.close()
