/**
 * 03 — Mean NDVI per study county
 * Dataset : Landsat 8 Collection 2, Level 2 (30 m)
 * Period  : June 1 – August 31, 2024 (median composite)
 * Formula : NDVI = (NIR - Red) / (NIR + Red) = (SR_B5 - SR_B4) / (SR_B5 + SR_B4)
 *
 * Note: computed on the raw SR bands, as in the submitted analysis.
 * See README → "Limitations & Future Work".
 */
var countiesList = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];

// STATEFP filter is required: many of these county names also exist in other states.
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', countiesList));

Map.centerObject(counties, 7);

var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterDate('2024-06-01', '2024-08-31')
  .filterBounds(counties)
  .median();

var ndvi = landsat.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');

var results = counties.map(function (feature) {
  var mean = ndvi.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: feature.geometry(),
    scale: 30,
    maxPixels: 1e9
  }).get('NDVI');
  return feature.set('Mean_NDVI', mean);
});

print('Mean NDVI per county:', results.reduceColumns({
  selectors: ['NAME', 'Mean_NDVI'],
  reducer: ee.Reducer.toList(2)
}));
