import mysql.connector
import pandas as pd
import numpy as np

RESOURCES_TO_PREDICT = ["ICU Beds", "Ventilators", "Oxygen Cylinders"]

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="KAVI@123mg",
        database="erbts"
    )

def add_time_features(df, date_col="ts"):
    df["dow"] = df[date_col].dt.dayofweek
    df["month"] = df[date_col].dt.month
    df["dow_sin"] = np.sin(2 * np.pi * df["dow"] / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["dow"] / 7)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
    return df

def build_features(hospitalId: str) -> pd.DataFrame:
    conn = get_connection()

    # 1) Base usage + inventory snapshot
    usage_query = """
        SELECT hu.ts, hu.hospitalId, hu.resourceType, hu.used, hu.on_hand,
               ar.total_quantity, ar.available
        FROM historical_usage hu
        LEFT JOIN available_resources ar
          ON hu.hospitalId = ar.hospitalId AND hu.resourceType = ar.resource_type
        WHERE hu.hospitalId = %s
    """
    df = pd.read_sql(usage_query, conn, params=[hospitalId])
    if df.empty:
        conn.close()
        return df
    df["ts"] = pd.to_datetime(df["ts"])

    # 2) Borrow (pending)
    borrow_query = """
        SELECT resourceType,
               SUM(quantity) as pending_borrow,
               MAX(urgency_level) as urgency_level
        FROM borrow_requests
        WHERE (fromHospitalId = %s OR toHospitalId = %s)
          AND status='pending'
        GROUP BY resourceType
    """
    df_borrow = pd.read_sql(borrow_query, conn, params=[hospitalId, hospitalId])

    # 3) Transfers
    transfer_query = """
        SELECT resourceType,
            SUM(CASE WHEN toHospitalId=%s THEN quantity ELSE 0 END) as transfer_in,
            SUM(CASE WHEN fromHospitalId=%s THEN quantity ELSE 0 END) as transfer_out
        FROM transfers
        GROUP BY resourceType
    """
    df_transfer = pd.read_sql(transfer_query, conn, params=[hospitalId, hospitalId])

    # 4) Maintenance (days until next due)
    maint_query = """
        SELECT resourceType, DATEDIFF(nextServiceDue, CURDATE()) as maintenance_due
        FROM equipment_maintenance
        WHERE hospitalId = %s
    """
    df_maint = pd.read_sql(maint_query, conn, params=[hospitalId])

    # 5) Hospital info + location
    hosp_query = "SELECT hospitalId, district, state FROM hospital WHERE hospitalId = %s"
    df_hosp = pd.read_sql(hosp_query, conn, params=[hospitalId])

    loc_query = "SELECT hospitalId, latitude, longitude FROM hospital_location WHERE hospitalId = %s"
    df_loc = pd.read_sql(loc_query, conn, params=[hospitalId])

    conn.close()

    # Merge
    df = df.merge(df_borrow, on="resourceType", how="left")
    df = df.merge(df_transfer, on="resourceType", how="left")
    df = df.merge(df_maint, on="resourceType", how="left")
    df = df.merge(df_hosp, on="hospitalId", how="left")
    df = df.merge(df_loc, on="hospitalId", how="left")

    # Fill
    df["pending_borrow"] = df.get("pending_borrow", 0).fillna(0)
    df["urgency_level"]  = df.get("urgency_level", "Medium").fillna("Medium")
    df["transfer_in"]    = df.get("transfer_in", 0).fillna(0)
    df["transfer_out"]   = df.get("transfer_out", 0).fillna(0)
    df["maintenance_due"]= df.get("maintenance_due", 30).fillna(30)

    # Time features
    df = add_time_features(df, "ts")

    # Keep only resources of interest
    df = df[df["resourceType"].isin(RESOURCES_TO_PREDICT)].copy()

    # Rename to match your TRAINING columns
    df.rename(columns={
        "pending_borrow": "borrow_quantity",
        "transfer_in": "transfer_in_qty",
        "transfer_out": "transfer_out_qty",
        "latitude": "hospital_latitude",
        "longitude": "hospital_longitude"
    }, inplace=True)

    # Return ALL cols incl. ts – the preprocessor will pick only needed cols by name
    return df
