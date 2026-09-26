/**
 * Map — Population Density (people / sq mi), 2020 Census
 * County values come from data/raw/county_indicators.csv and are rasterized
 * so they can be styled like the other layers. Exported at 1000 m.
 */
var top10Names = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', top10Names));

var densityData = ee.Dictionary({
  'Philadelphia': 11736.88, 'Delaware': 3181.47, 'Montgomery': 1820.12,
  'Allegheny': 1677.90, 'Lehigh': 1117.29, 'Bucks': 1075.82,
  'Northampton': 873.72, 'Chester': 747.15, 'Lancaster': 596.83,
  'Cumberland': 496.30
});

var densityImage = counties
  .map(function (f) { return f.set('pop_density', densityData.get(f.get('NAME'))); })
  .reduceToImage({properties: ['pop_density'], reducer: ee.Reducer.first()});

var densityVis = {min: 400, max: 12000, palette: ['lightyellow', 'yellow', 'orange', 'red', 'darkred']};

// ---- Base map: Pennsylvania outline + county borders --------------------
Map.centerObject(counties, 8);
var pennsylvania = ee.FeatureCollection('TIGER/2018/States')
  .filter(ee.Filter.eq('NAME', 'Pennsylvania'));
Map.addLayer(pennsylvania.style({color: 'black', fillColor: '00000000', width: 2.5}), {}, 'Pennsylvania');
Map.addLayer(densityImage, densityVis, 'Population Density (people/sq mi)');
Map.addLayer(counties.style({color: 'black', fillColor: '00000000', width: 1.5}), {}, 'County Borders');

// ---- Legend --------------------------------------------------------------
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px'}});
legend.add(ui.Label('Population Density (per sq mi)', {fontWeight: 'bold', fontSize: '14px'}));
var palette = ['lightyellow', 'yellow', 'orange', 'red', 'darkred'];
var labels = ['~500', '~3,000', '~6,000', '~9,000', '~12,000'];
for (var i = 0; i < palette.length; i++) {
  var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
  row.add(ui.Label('', {backgroundColor: palette[i], padding: '8px', margin: '4px'}));
  row.add(ui.Label(labels[i], {margin: '4px 0 4px 4px'}));
  legend.add(row);
}
Map.add(legend);

// ---- Export to Google Drive -----------------------------------------------
Export.image.toDrive({
  image: densityImage.visualize(densityVis),
  description: 'PopDensity_Map_PA_Top10',
  scale: 1000,
  region: counties.geometry().bounds(),
  maxPixels: 1e9
});
