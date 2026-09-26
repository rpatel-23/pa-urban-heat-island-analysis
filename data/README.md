# Data

| File | Description |
|---|---|
| `raw/county_indicators.csv` | County-level values for all five indicators, as extracted from Google Earth Engine (LST, tree canopy, NDVI, NDBI) and the 2020 Census (population, land area, density). |
| `processed/county_need_scores.csv` | Output of `analysis/county_need_score.py`: min-max normalized indicators and the composite County Need Score. |

## Columns (`county_indicators.csv`)

| Column | Unit | Source | Period |
|---|---|---|---|
| `lst_f` | °F, mean summer daytime land surface temperature | NASA MODIS Terra MOD11A1 | Jun–Aug, 2020–2025 |
| `tree_canopy_pct` | % of county area under canopy | USGS NLCD Tree Canopy Cover v2023-5 | 2023 |
| `ndvi` | index (−1 to 1) | Landsat 8 C2 L2, bands 5 & 4 | Jun–Aug 2024 |
| `population_2020` | people | U.S. Census Bureau 2020 Decennial Census (via Carney, 2025) | 2020 |
| `land_area_sq_mi` | square miles | same | 2020 |
| `pop_density` | people / sq mi | `population_2020 / land_area_sq_mi` | 2020 |
| `ndbi` | index (−1 to 1), higher = more built-up | Landsat 8 C2 L2, bands 6 & 5 | Jun–Aug 2024 |
