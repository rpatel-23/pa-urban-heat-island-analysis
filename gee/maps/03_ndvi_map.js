/**
 * Map — NDVI, Summer 2024
 * Dataset: Landsat 8 C2 L2 median composite (Jun–Aug 2024). Exported at 30 m.
 */
var top10Names = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', top10Names));

var ndvi = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterDate('2024-06-01', '2024-08-31')
  .filterBounds(counties)
  .median()
  .normalizedDifference(['SR_B5', 'SR_B4'])
  .rename('NDVI')
  .clip(counties);

var ndviVis = {min: 0.1, max: 0.4, palette: ['white', 'yellow', 'lightgreen', 'green', 'darkgreen']};

// ---- Base map: Pennsylvania outline + county borders --------------------
Map.centerObject(counties, 8);
var pennsylvania = ee.FeatureCollection('TIGER/2018/States')
  .filter(ee.Filter.eq('NAME', 'Pennsylvania'));
Map.addLayer(pennsylvania.style({color: 'black', fillColor: '00000000', width: 2.5}), {}, 'Pennsylvania');
Map.addLayer(ndvi, ndviVis, 'Summer NDVI 2024');
Map.addLayer(counties.style({color: 'black', fillColor: '00000000', width: 1.5}), {}, 'County Borders');

// ---- Legend --------------------------------------------------------------
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px'}});
legend.add(ui.Label('NDVI Value', {fontWeight: 'bold', fontSize: '14px'}));
var palette = ['white', 'yellow', 'lightgreen', 'green', 'darkgreen'];
var labels = ['0.1 (Sparse)', '0.2', '0.3', '0.35', '0.4 (Dense)'];
for (var i = 0; i < palette.length; i++) {
  var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
  row.add(ui.Label('', {backgroundColor: palette[i], padding: '8px', margin: '4px'}));
  row.add(ui.Label(labels[i], {margin: '4px 0 4px 4px'}));
  legend.add(row);
}
Map.add(legend);

// ---- Export to Google Drive -----------------------------------------------
Export.image.toDrive({
  image: ndvi.visualize(ndviVis),
  description: 'NDVI_Map_PA_Top10',
  scale: 30,
  region: counties.geometry().bounds(),
  maxPixels: 1e9
});
