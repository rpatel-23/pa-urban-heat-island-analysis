/**
 * Map — Tree Canopy Cover (%), 2023
 * Dataset: USGS NLCD Tree Canopy Cover v2023-5. Exported at 30 m.
 */
var top10Names = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', top10Names));

var nlcd = ee.ImageCollection('USGS/NLCD_RELEASES/2023_REL/TCC/v2023-5')
  .filterBounds(counties)
  .first()
  .select('Science_Percent_Tree_Canopy_Cover')
  .clip(counties);

var canopyVis = {min: 0, max: 60, palette: ['white', 'lightgreen', 'green', 'darkgreen']};

// ---- Base map: Pennsylvania outline + county borders --------------------
Map.centerObject(counties, 8);
var pennsylvania = ee.FeatureCollection('TIGER/2018/States')
  .filter(ee.Filter.eq('NAME', 'Pennsylvania'));
Map.addLayer(pennsylvania.style({color: 'black', fillColor: '00000000', width: 2.5}), {}, 'Pennsylvania');
Map.addLayer(nlcd, canopyVis, 'Tree Canopy Coverage (%)');
Map.addLayer(counties.style({color: 'black', fillColor: '00000000', width: 1.5}), {}, 'County Borders');

// ---- Legend --------------------------------------------------------------
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px'}});
legend.add(ui.Label('Tree Canopy (%)', {fontWeight: 'bold', fontSize: '14px'}));
var palette = ['white', 'lightgreen', 'green', 'darkgreen'];
var labels = ['0%', '20%', '40%', '60%'];
for (var i = 0; i < palette.length; i++) {
  var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
  row.add(ui.Label('', {backgroundColor: palette[i], padding: '8px', margin: '4px'}));
  row.add(ui.Label(labels[i], {margin: '4px 0 4px 4px'}));
  legend.add(row);
}
Map.add(legend);

// ---- Export to Google Drive -----------------------------------------------
Export.image.toDrive({
  image: nlcd.visualize(canopyVis),
  description: 'TreeCanopy_Map_PA_Top10',
  scale: 30,
  region: counties.geometry().bounds(),
  maxPixels: 1e9
});
