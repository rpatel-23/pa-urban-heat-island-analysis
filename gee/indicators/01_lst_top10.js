/**
 * 01 — Land Surface Temperature: find the 10 hottest PA counties
 * Dataset : NASA MODIS Terra MOD11A1 (daily LST, 1 km)
 * Period  : June–August, 2020–2025
 * Output  : Console table of the top 10 counties by mean summer daytime LST (°F)
 *
 * Note: MODIS/006 is the collection used for the submitted analysis. If it is
 * unavailable in your Earth Engine account, swap in 'MODIS/061/MOD11A1'.
 */
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'));            // Pennsylvania

var lst = ee.ImageCollection('MODIS/006/MOD11A1')
  .filterDate('2020-06-01', '2025-08-31')
  .filter(ee.Filter.calendarRange(6, 8, 'month'))    // summer months only
  .select('LST_Day_1km')
  .map(function (img) {
    return img.multiply(0.02)                        // scale factor -> Kelvin
      .subtract(273.15)                              // -> °C
      .multiply(9 / 5).add(32)                       // -> °F
      .rename('LST_F');
  });

var meanLST = lst.mean();

var countyStats = meanLST.reduceRegions({
  collection: counties,
  reducer: ee.Reducer.mean(),
  scale: 1000
});

var top10 = countyStats
  .map(function (f) {
    return ee.Feature(null, {
      county: f.get('NAME'),
      temperature_F: f.get('mean')
    });
  })
  .filter(ee.Filter.notNull(['temperature_F']))
  .sort('temperature_F', false)
  .limit(10);

var table = top10.aggregate_array('county')
  .zip(top10.aggregate_array('temperature_F'))
  .map(function (row) {
    row = ee.List(row);
    return { county: row.get(0), temperature_F: row.get(1) };
  });

print('Number of PA counties:', counties.size());
print('Top 10 Hottest PA Counties (Summer LST °F)', table);
