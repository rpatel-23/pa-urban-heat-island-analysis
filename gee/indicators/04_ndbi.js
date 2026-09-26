/**
 * 04 — Mean NDBI per study county
 * Dataset : Landsat 8 Collection 2, Level 2 (30 m)
 * Period  : June 1 – August 31, 2024 (median composite)
 * Formula : NDBI = (SWIR1 - NIR) / (SWIR1 + NIR) = (SR_B6 - SR_B5) / (SR_B6 + SR_B5)
 *           Higher values = more built-up / impervious surface.
 */
var countiesList = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];

// STATEFP filter is required: many of these county names also exist in other states.
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', countiesList));

var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterDate('2024-06-01', '2024-08-31')
  .filterBounds(counties)
  .median();

var ndbi = landsat.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI');

var results = counties.map(function (feature) {
  var mean = ndbi.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: feature.geometry(),
    scale: 30,
    maxPixels: 1e9
  }).get('NDBI');
  return feature.set('Mean_NDBI', mean);
});

print('Mean NDBI per county:', results.reduceColumns({
  selectors: ['NAME', 'Mean_NDBI'],
  reducer: ee.Reducer.toList(2)
}));
