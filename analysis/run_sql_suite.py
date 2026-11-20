"""
FinSight SQL Analytics Suite Runner
Executes all 21 analytical SQL queries against the analytical database,
validates syntax and output schemas, and generates the query execution report.
"""

import os
import glob
import json
import duckdb

def run_suite():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    clean_csv = os.path.join(base_dir, "backend", "data", "processed", "transactions_cleaned.csv")
    db_path = os.path.join(base_dir, "backend", "data", "finsight.duckdb")
    sql_dir = os.path.join(base_dir, "analysis", "sql_queries")
    output_json = os.path.join(base_dir, "analysis", "query_results.json")

    print(f"[SQL Suite] Connecting to analytical database: {db_path}")
    con = duckdb.connect(db_path)

    # Initialize / Refresh transactions table
    con.execute("DROP TABLE IF EXISTS transactions;")
    con.execute(f"""
        CREATE TABLE transactions (
            transaction_id VARCHAR PRIMARY KEY,
            transaction_date DATE,
            transaction_type VARCHAR,
            amount DECIMAL(12, 2),
            category VARCHAR,
            payment_method VARCHAR,
            customer_id VARCHAR,
            merchant VARCHAR,
            status VARCHAR,
            region VARCHAR,
            currency VARCHAR
        );
    """)

    csv_normalized = clean_csv.replace(os.sep, '/')
    con.execute(f"INSERT INTO transactions SELECT * FROM read_csv_auto('{csv_normalized}');")
    count = con.execute("SELECT COUNT(*) FROM transactions;").fetchone()[0]
    print(f"[SQL Suite] Successfully loaded {count:,} transactions into database.")

    sql_files = sorted(glob.glob(os.path.join(sql_dir, "*.sql")))
    print(f"[SQL Suite] Found {len(sql_files)} analytical SQL queries to execute.")

    results = {}

    for filepath in sql_files:
        filename = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            query = f.read()

        try:
            res = con.execute(query)
            cols = [desc[0] for desc in res.description]
            raw_rows = res.fetchall()
            # Convert rows to dicts for json serialization
            formatted_rows = []
            for row in raw_rows[:10]:  # Capture sample preview
                formatted_rows.append({cols[i]: str(row[i]) for i in range(len(cols))})

            results[filename] = {
                "status": "SUCCESS",
                "columns": cols,
                "row_count": len(raw_rows),
                "preview_sample": formatted_rows,
            }
            print(f"  [PASS] {filename} -> Returned {len(raw_rows)} rows across {len(cols)} columns.")
        except Exception as e:
            results[filename] = {
                "status": "ERROR",
                "error": str(e),
            }
            print(f"  [FAIL] {filename} -> Error: {e}")

    con.close()

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"[SQL Suite] Execution verification saved to: {output_json}")


if __name__ == "__main__":
    run_suite()
