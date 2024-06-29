// GEE script to loop through the landscape area shapegiles in the assets folder and analyse forest change using the Hansen Global Forest Change v1.11 (2000-2023). Forest definition follows FAO guidelines. Results are exported into GDrive as csv files per landscape.

// Get a list of all the shapefiles in your assets
var shapefiles = ee.data.listAssets("projects/[*username*]/assets").assets;

// Loop through the shapefiles
shapefiles.forEach(function(asset) {
  var assetId = asset.id;
  var assetName = assetId.split('/').pop(); // Extract the name of the asset


  // Load the current shapefile
  var aoi = ee.FeatureCollection(assetId);

  // Load image/data of interest
  var dataset = ee.Image('UMD/hansen/global_forest_change_2022_v1_10');

  // Set up the base mask for forest area in the year 2000
  // FAO Forest Definition:
    // Land spanning more than 0.5 hectares with trees higher than 5 meters and a canopy cover of more than 10 percent,
  // or trees able to reach these thresholds in situ. It does not include land that is predominantly under agricultural or urban land use.

  /// Canopy cover percentage (e.g. 30%) for consistency with Hansen data
  var cc = ee.Number(30);
  /// Minimum forest area in pixels (e.g. 6 pixels, ~ 0.5 ha in this example).
  var pixels = ee.Number(6);
  /// Select 'treecover2000' in the Global Forest Change dataset.
  var canopyCover = dataset.select(['treecover2000']);
  /// Apply the minimum canopy cover percentage (e.g. >= 10%). Use selfMask() to set other other areas transparent by assigning value zero.
  var canopyCover10 = canopyCover.gte(cc).selfMask();
  /// Apply the minimum area requirement using connectedPixelCount. Use connectedPixelCount() to get contiguous area.
  var contArea = canopyCover10.connectedPixelCount();
  /// Apply the minimum area requirement: this is the base mask for forest in year 2000
  var minArea = contArea.gte(pixels).selfMask();


  // Get the "loss" and "lossyear" bands
  var lossImage = dataset.select(['loss']);
  var lossAreaImage = lossImage.multiply(ee.Image.pixelArea());
  var lossYear = dataset.select(['lossyear']);


  // In a loop: calculate loss area per year for pixels that in yr 2000 were considered forest according to FAO def
  var lossByYear = lossAreaImage.addBands(lossYear)
  .updateMask(minArea.eq(1))
  .reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1
    }),
    geometry: aoi,
    scale: 30,
    maxPixels: 1e30
  });


  // Format the output as a table
  var statsFormatted = ee.List(lossByYear.get('groups'))
  .map(function(el) {
    var d = ee.Dictionary(el);
    var year = ee.Number(d.get('group')).format("20%02d");
    var lossArea = d.get('sum');
    return ee.Feature(null, {
      'Year': year,
      'Loss Area': lossArea
    });
  });


  // Create a feature collection with the loss area data
  var lossAreaCollection = ee.FeatureCollection(statsFormatted);


  // Export the results as CSV in the G-Drive of the user
  Export.table.toDrive({
    collection: lossAreaCollection,
    description: assetName + '_FAOforestdef',
    fileFormat: 'CSV'
  });
});
