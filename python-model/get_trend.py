import pandas as pd
from datetime import date, timedelta
from build_features import get_connection

def last_n_days_used(hospitalId: str, resourceType: str, days: int = 7):
    sql = """
      SELECT DATE(ts) as d, SUM(used) as used
      FROM historical_usage
      WHERE hospitalId=%s AND resourceType=%s
      GROUP BY DATE(ts)
      ORDER BY d DESC
      LIMIT %s
    """
    conn = get_connection()
    try:
        df = pd.read_sql(sql, conn, params=[hospitalId, resourceType, days])
    finally:
        conn.close()
    if df.empty:
        return []
    df = df.sort_values("d")
    return [{"date": str(r.d), "used": int(r.used)} for r in df.itertuples(index=False)]

# Example usage in API layer:
# trend = last_n_days_used("DL_AIIMS", "ICU Beds", days=7)
# then append predicted_for + predicted_quantity from `predictions` table for tomorrow.
