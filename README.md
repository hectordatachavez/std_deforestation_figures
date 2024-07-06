# Forest Change Area Calculation per Year

This repository contains code to calculate annual forest change area using Google Earth Engine (GEE). The code loops through shapefiles in your GEE assets, computes forest cover and loss based on standard definitions, and outputs the results for each year in table format.

## Overview

The code calculates the forest cover area for a given region using thresholds for cover and minimum area, then computes annual forest loss and updates the forest area accordingly. Results are printed to the console and can be visualized in a bar chart within the GEE environment.

## Data description

We used forest change data in the [Hansen Global Forest Change v1.11 (2000-2023)](https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2023_v1_11). We used the FAO's forest definition to identify loss between the year 2015 and the year 2020. The FAO's forest definition includes *"Land spanning more than 0.5 hectares with trees higher than 5 meters and a canopy cover of more than 10 percent."*

## Output

The GEE code outputs a CSV file with the following columns:

-   `year`: The year of the data.

-   `loss`: The forest loss area in hectares for that year.

-   `forest_area`: The remaining forest area in hectares after accounting for the loss of the previous year.
