/**
 * Map — Composite County Need Score (0–5)
 * Scores are produced by analysis/county_need_score.py
 * (see data/processed/county_need_scores.csv). Exported at 1000 m.
 *
 * If you change the input data, re-run the Python script and paste the new
 * scores into the dictionary below.
 */
var top10Names = [
  'Philadelphia', 'Montgomery', 'Delaware', 'Bucks', 'Lehigh',
  'Allegheny', 'Cumberland', 'Lancaster', 'Northampton', 'Chester'
];
var counties = ee.FeatureCollection('TIGER/2018/Counties')
  .filter(ee.Filter.eq('STATEFP', '42'))
  .filter(ee.Filter.inList('NAME', top10Names));

var needScores = ee.Dictionary({
  'Philadelphia': 5.000,
  'Northampton': 1.891,
  'Lancaster': 1.417,
  'Delaware': 1.301,
  'Montgomery': 1.154,
  'Allegheny': 0.815,
  'Bucks': 0.806,
  'Lehigh': 0.755,
  'Cumberland': 0.541,
  'Chester': 0.106
});

var scoreImage = counties
  .map(function (f) { return f.set('Need_Score', needScores.get(f.get('NAME'))); })
  .reduceToImage({properties: ['Need_Score'], reducer: ee.Reducer.first()});

var scoreVis = {min: 0, max: 5, palette: ['#f2e6ff', '#c483f5', '#9b30d9', '#6a0dad', '#3b006e']};

// ---- Base map: Pennsylvania outline + county borders --------------------
Map.centerObject(counties, 8);
var pennsylvania = ee.FeatureCollection('TIGER/2018/States')
  .filter(ee.Filter.eq('NAME', 'Pennsylvania'));
Map.addLayer(pennsylvania.style({color: 'black', fillColor: '00000000', width: 2.5}), {}, 'Pennsylvania');
Map.addLayer(scoreImage, scoreVis, 'County Need Score');
Map.addLayer(counties.style({color: 'black', fillColor: '00000000', width: 1.5}), {}, 'County Borders');

// ---- Legend --------------------------------------------------------------
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px'}});
legend.add(ui.Label('County Need Score', {fontWeight: 'bold', fontSize: '14px'}));
var palette = ['#f2e6ff', '#c483f5', '#9b30d9', '#6a0dad', '#3b006e'];
var labels = ['0 (Low Need)', '1.25', '2.50', '3.75', '5.0 (High Need)'];
for (var i = 0; i < palette.length; i++) {
  var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
  row.add(ui.Label('', {backgroundColor: palette[i], padding: '8px', margin: '4px'}));
  row.add(ui.Label(labels[i], {margin: '4px 0 4px 4px'}));
  legend.add(row);
}
Map.add(legend);

// ---- Export to Google Drive -----------------------------------------------
Export.image.toDrive({
  image: scoreImage.visualize(scoreVis),
  description: 'CountyNeedScore_Map_PA_Top10',
  scale: 1000,
  region: counties.geometry().bounds(),
  maxPixels: 1e9
});
