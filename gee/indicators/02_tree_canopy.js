/**
 * 02 — Mean Tree Canopy Cover (%) per study county
 * Dataset : USGS NLCD Tree Canopy Cover v2023-5 (CONUS, 30 m)
 * Period  : 2023
 */
var countiesList = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];

// STATEFP filter is required: many of these county names also exist in other states.
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', countiesList));

var tcc = ee.ImageCollection('USGS/NLCD_RELEASES/2023_REL/TCC/v2023-5')
  .filter(ee.Filter.calendarRange(2023, 2023, 'year'))
  .filter('study_area == "CONUS"')
  .first();

var canopy = tcc.select('Science_Percent_Tree_Canopy_Cover');

var results = counties.map(function (feature) {
  var mean = canopy.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: feature.geometry(),
    scale: 30,
    maxPixels: 1e9
  }).get('Science_Percent_Tree_Canopy_Cover');
  return feature.set('Mean_Tree_Canopy_Percent', mean);
});

print('Mean Tree Canopy Cover by County (%)', results.reduceColumns({
  selectors: ['NAME', 'Mean_Tree_Canopy_Percent'],
  reducer: ee.Reducer.toList(2)
}));
