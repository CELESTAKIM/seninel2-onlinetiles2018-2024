// -------------------------------
// KENYA SENTINEL-2 BASEMAPS 2018–2024       link: https://code.earthengine.google.com/ff0bd40f47c9053779879df288587b37
// -------------------------------

// Load Kenya boundary
var kenya = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level0")
               .filter(ee.Filter.eq('ADM0_NAME', 'Kenya'));

Map.centerObject(kenya, 6);
Map.addLayer(kenya, {color:'blue'}, 'Kenya boundary');

// Sentinel-2 SR Harmonized collection
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(kenya)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map(function(img){
    // Cloud masking
    var qa = img.select('QA60');
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
                 .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    return img.updateMask(mask);
  });

// Visualization parameters
var vis = {bands:['B4','B3','B2'], min:0, max:3000, gamma:1.2};

// Years to process
var years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

// Loop through years
years.forEach(function(year) {
  var start = ee.Date.fromYMD(year, 1, 1);
  var end = ee.Date.fromYMD(year, 12, 31);
  
  var yearComposite = s2.filterDate(start, end).median().clip(kenya);
  
  Map.addLayer(yearComposite, vis, 'Sentinel-2 ' + year);
  
  var mapid = yearComposite.getMap(vis);
  print('🗺️ Tile URL for ' + year + ':', mapid.urlFormat);
});
