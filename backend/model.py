from sklearn.ensemble import RandomForestRegressor
from backend.config import RANDOM_STATE, N_ESTIMATORS


def build_model(n_estimators=N_ESTIMATORS, random_state=RANDOM_STATE, n_jobs=-1, max_depth=22):
    """
    Creates a classical RandomForestRegressor for hotel price prediction.
    """
    model = RandomForestRegressor(
        n_estimators=n_estimators,
        random_state=random_state,
        n_jobs=n_jobs,
        max_depth=max_depth
    )
    return model
