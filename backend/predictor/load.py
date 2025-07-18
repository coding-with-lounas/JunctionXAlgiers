import pandas as pd
import joblib

# Step 1: Load the Excel file
data = pd.read_excel("WQD.xlsx")

# Step 2: Remove the last column (assumed to be the target or extra column)
df = data.iloc[:, :-1]

# Step 3: Load the scaler
scaler = joblib.load("scaler.pkl")

# ⚠️ Step 4: Transform using DataFrame to preserve column names
X_scaled = scaler.transform(df)  # Keep df, don't convert to .values

# Step 5: Load the model
model = joblib.load("model.pkl")

# Step 6: Predict
predictions = model.predict(X_scaled)

# Step 7: Output the predictions
print("Predictions:", predictions)
