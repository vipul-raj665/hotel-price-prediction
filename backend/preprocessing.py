from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from backend.config import CATEGORICAL_FEATURES, NUMERICAL_FEATURES


def build_preprocessor(cat_cols=CATEGORICAL_FEATURES, num_cols=NUMERICAL_FEATURES):
    """
    Constructs a ColumnTransformer pipeline:
    - Numerical features: Median imputation
    - Categorical features: Constant imputation + One-Hot Encoding (handle_unknown='ignore')
    """
    num_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ])

    cat_pipeline = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, num_cols),
            ("cat", cat_pipeline, cat_cols)
        ],
        remainder="drop"
    )

    return preprocessor
