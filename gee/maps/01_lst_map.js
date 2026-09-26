/**
 * Map — Mean Summer Land Surface Temperature (°F), 2020–2025
 * Dataset: NASA MODIS Terra MOD11A1. Exported at 1000 m (native MODIS resolution).
 */
var top10Names = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', top10Names));

var meanLST = ee.ImageCollection('MODIS/006/MOD11A1')
  .filterDate('2020-06-01', '2025-08-31')
  .filter(ee.Filter.calendarRange(6, 8, 'month'))
  .select('LST_Day_1km')
  .map(function (img) {
    return img.multiply(0.02).subtract(273.15).multiply(9 / 5).add(32).rename('LST_F');
  })
  .mean()
  .clip(counties);

var lstVis = {min: 83, max: 96, palette: ['blue', 'cyan', 'yellow', 'orange', 'red']};

// ---- Base map: Pennsylvania outline + county borders --------------------
Map.centerObject(counties, 8);
var pennsylvania = ee.FeatureCollection('TIGER/2018/States')
  .filter(ee.Filter.eq('NAME', 'Pennsylvania'));
Map.addLayer(pennsylvania.style({color: 'black', fillColor: '00000000', width: 2.5}), {}, 'Pennsylvania');
Map.addLayer(meanLST, lstVis, 'Mean Summer LST (°F)');
Map.addLayer(counties.style({color: 'black', fillColor: '00000000', width: 1.5}), {}, 'County Borders');

// ---- Legend --------------------------------------------------------------
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px'}});
legend.add(ui.Label('Summer LST (°F)', {fontWeight: 'bold', fontSize: '14px'}));
var palette = ['blue', 'cyan', 'yellow', 'orange', 'red'];
var labels = ['83°F (Cool)', '87°F', '90°F', '93°F', '96°F (Hot)'];
for (var i = 0; i < palette.length; i++) {
  var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
  row.add(ui.Label('', {backgroundColor: palette[i], padding: '8px', margin: '4px'}));
  row.add(ui.Label(labels[i], {margin: '4px 0 4px 4px'}));
  legend.add(row);
}
Map.add(legend);

// ---- Export to Google Drive -----------------------------------------------
Export.image.toDrive({
  image: meanLST.visualize(lstVis),
  description: 'LST_Map_PA_Top10',
  scale: 1000,
  region: counties.geometry().bounds(),
  maxPixels: 1e9
});
