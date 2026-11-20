"""
FinSight Transactions Route
Provides searching, filtering, sorting, pagination, and CSV export for individual ledger records.
"""

from typing import Optional
from fastapi import APIRouter, Response
from backend.app.database import execute_query
from backend.app.services.analytics_service import build_filter_clauses

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("")
def get_transactions(
    page: int = 1,
    limit: int = 25,
    sort_by: str = "transaction_date",
    order: str = "desc",
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None,
    export_csv: bool = False,
):
    where_clause, params = build_filter_clauses(
        start_date=start_date,
        end_date=end_date,
        category=category,
        payment_method=payment_method,
        status=status,
        region=region,
        search=search,
    )

    if transaction_type:
        prefix = " AND " if where_clause else " WHERE "
        where_clause += f"{prefix} transaction_type = ?"
        params.append(transaction_type)

    # Valid sortable columns to prevent SQL injection
    valid_cols = {
        "transaction_id", "transaction_date", "transaction_type",
        "amount", "category", "payment_method", "customer_id",
        "merchant", "status", "region"
    }
    safe_sort = sort_by if sort_by in valid_cols else "transaction_date"
    safe_order = "DESC" if order.lower() == "desc" else "ASC"

    # Export to CSV if requested
    if export_csv:
        csv_sql = f"""
            SELECT * FROM transactions {where_clause}
            ORDER BY {safe_sort} {safe_order}
            LIMIT 10000;
        """
        rows = execute_query(csv_sql, params)
        if not rows:
            return Response(content="", media_type="text/csv")

        header = list(rows[0].keys())
        csv_lines = [",".join(header)]
        for r in rows:
            csv_lines.append(",".join([f'"{str(r.get(h, ""))}"' for h in header]))

        csv_content = "\n".join(csv_lines)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=finsight_transactions.csv"}
        )

    # Pagination count
    count_sql = f"SELECT COUNT(*) AS total FROM transactions {where_clause};"
    count_res = execute_query(count_sql, params)
    total_records = count_res[0]["total"] if count_res else 0

    offset = (page - 1) * limit
    paginated_sql = f"""
        SELECT * FROM transactions {where_clause}
        ORDER BY {safe_sort} {safe_order}
        LIMIT {limit} OFFSET {offset};
    """
    records = execute_query(paginated_sql, params)

    total_pages = (total_records + limit - 1) // limit

    return {
        "page": page,
        "limit": limit,
        "total_records": total_records,
        "total_pages": total_pages,
        "records": records,
    }
