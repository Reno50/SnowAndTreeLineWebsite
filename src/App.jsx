// The json data (collected_data.json) needs some documentation:
/*
  Name, long, lat should be self explanitory - just make sure lat and long are decimal
  Treeline and snowline are in feet of elevation above sea level - 
    treeline is obvious, 
    but snowline is somewhat arbitrary - here are the qualifications:
      must be above the end of any large glaciers on the mountain / range
      must roughly look like the middle of the glacier, or the line where snow begins to accumulate as opposed to melt (ablattion line)
  Cover_quality is from 0 to 5:
    0 - No glaciers exist in this range -- snowline is null
    1 - Glaciers exist only in occasional cirques, extend for 500 feet or less, are visibly spotty or inconsistent, and do not contain crevaces of notable size
    2 - Glaciers only in occasional or uncommon cirques, but may extend longer than 500 feet, appear wider, appear more consistent, and may even have some small crevaces due to topography
    3 - Glaciers exist and are not necessarily confined to a small cirque or other topographic feature, likely longer than 500 feet but possibly just very wide, but are still uncommon and have relatively small crevaces 
    4 - Glaciers exist, are somewhat common, and have visible large crevaces, extending for greater than 500 feet and generally appearing quite consistent
    5 - Glaciers are quite common and icefields / 'sufficiently' large glaciers exist in this range, surpassing all other categories
  Cover quality is chosen (along with snowline elevation) based on the highest category achieved in the range, and elevation is set accordingly
   - ex: Rainier has many glaciers below its given snowline of 7700, but that is the lowest that fryingpan glacier goes
         it is also where I would anticipate an icefield would become impossible - that is just based on visual observation, though,
         and I think it would be unlikely for an icefield to form on a mountain in rainiers place unless it was at least ~9000 feet ASL
*/

import { useState, useEffect, useRef } from 'react'
import * as d3 from "d3"
import './App.css'

const requestUrl = window.location.origin

const zero_color = "#AA0000";  // Keep: strong red
const one_color  = "#CC4400";  // Changed: clearer red-orange
const two_color  = "#D98C00";  // Changed: warm amber
const three_color = "#A5A530"; // Changed: soft yellow-green
const four_color = "#20A040";  // Keep: clean green
const five_color = "#00CC40";  // Keep: bright green

function D3Map() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear everything

    const projection = d3.geoEqualEarth()
      .scale(190)
      .translate([480, 250]);

    const pathGenerator = d3.geoPath().projection(projection);

    const zoomLayer = svg.append("g");

    const mapLayer = zoomLayer.append("g").attr("class", "map");
    const annotationLayer = zoomLayer.append("g").attr("class", "annotations");


    // Zoom stuff
    svg.call(d3.zoom()
      .scaleExtent([1, 20])
      .on("zoom", (event) => {
        var opacity = Math.pow(event.transform.k, 3) / 4096;
        if (opacity < 0.125) {
          opacity = 0;
        } else if (opacity > 1) {
          opacity = 1;
        }
        var titleOpacity = Math.pow(event.transform.k, 3/2) / 16;
        if (titleOpacity < 0.2) {
          titleOpacity = 0;
        } else if (titleOpacity > 1) {
          titleOpacity = 1;
        }

        zoomLayer.attr("transform", event.transform);
        annotationLayer.selectAll("circle").attr("r", 3 / event.transform.k); // Set the radius of annotations as 3 / zoom

        annotationLayer.selectAll("text.title").attr("font-size", 10 / event.transform.k); // Set the font size as 8 / zoom
        annotationLayer.selectAll("text.title").attr("x", d => projection([d.long, d.lat])[0] + (6 / event.transform.k));
        annotationLayer.selectAll("text.title").attr("y", d => projection([d.long, d.lat])[1] - (3 / event.transform.k));
        annotationLayer.selectAll("text.title").attr("opacity", d => titleOpacity);

        annotationLayer.selectAll("text.treeline_desc").attr("font-size", 6 / (event.transform.k));
        annotationLayer.selectAll("text.treeline_desc").attr("x", d => projection([d.long, d.lat])[0] + (6 / event.transform.k));
        annotationLayer.selectAll("text.treeline_desc").attr("y", d => projection([d.long, d.lat])[1] + (6 / event.transform.k));
        annotationLayer.selectAll("text.treeline_desc").attr("opacity", d => opacity);
        
        annotationLayer.selectAll("text.snowline_desc").attr("font-size", 6 / (event.transform.k));
        annotationLayer.selectAll("text.snowline_desc").attr("x", d => projection([d.long, d.lat])[0] + (6 / event.transform.k));
        annotationLayer.selectAll("text.snowline_desc").attr("y", d => projection([d.long, d.lat])[1] + (15 / event.transform.k));
        annotationLayer.selectAll("text.snowline_desc").attr("opacity", d => opacity);
        
    }));

    d3.json("/SnowAndTreeLineWebsite/custom_geo.json").then(worldData => {
      mapLayer.selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("fill", "#D6D6DA")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 0.5);
    }).catch(console.error);

    d3.json("/SnowAndTreeLineWebsite/collected_data.json").then(annotations => {
      annotationLayer.selectAll("circle")
        .data(annotations)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.long, d.lat])[0])
        .attr("cy", d => projection([d.long, d.lat])[1])
        .attr("r", 3)
        .attr("fill", d => { // Oof, best way to do the color i guess
          switch (d.cover_quality) {
            case 0: return zero_color;
            case 1: return one_color;
            case 2: return two_color;
            case 3: return three_color;
            case 4: return four_color;
            case 5: return five_color;
            default: return "#222222";
          }
        })
    
      annotationLayer.selectAll("text.title")
        .data(annotations)
        .enter()
        .append("text")
        .attr("class", "title")
        .attr("x", d => projection([d.long, d.lat])[0] + 6)
        .attr("y", d => projection([d.long, d.lat])[1] - 3)
        .text(d => d.name)
        .attr("font-size", 8)
        .attr("fill", d => {
          switch (d.cover_quality) {
            case 0: return zero_color;
            case 1: return one_color;
            case 2: return two_color;
            case 3: return three_color;
            case 4: return four_color;
            case 5: return five_color;
            default: return "#222222";
          }
        })
        .attr("opacity", 0);
      
      annotationLayer.selectAll("text.treeline_desc")
        .data(annotations.filter(d => d.treeline != null))
        .enter()
        .append("text")
        .attr("class", "treeline_desc")
        .attr("x", d => projection([d.long, d.lat])[0] + 6)
        .attr("y", d => projection([d.long, d.lat])[1] + 6)
        .text(d => "Tree line: " + d.treeline + " feet ASL")
        .attr("font-size", 6)
        .attr("fill", "#333")
        .attr("opacity", 0);
      
      annotationLayer.selectAll("text.snowline_desc")
        .data(annotations.filter(d => d.snowline != null))
        .enter()
        .append("text")
        .attr("class", "snowline_desc")
        .attr("x", d => projection([d.long, d.lat])[0] + 6)
        .attr("y", d => projection([d.long, d.lat])[1] + 15)
        .text(d => "Snow line: " + d.snowline + " feet ASL")
        .attr("font-size", 6)
        .attr("fill", "#333")
        .attr("opacity", 0);
      
    });

  }, []);

  return (
    <div style={{ width: "90%", maxWidth: "10000px", margin: "0 auto" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 960 500"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ border: "1px solid #ccc" }}
      />
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <title>Snow and Tree-line website</title>
      <h1>A snow and tree-line visualization and inference website</h1>
      <br></br>
      <p style={{ width: "90%", margin: "0 auto" }}>
        This first map is a visualization of the tree and snow lines of many mountain ranges in the present day. The tree and snow lines are listed, if they exist, and the color of the dot is representitave of the glacier cover in the range. For this, the key is:
      </p>
      <br></br>
      <p style={{color: zero_color, width: "90%", margin: "0 auto"}}>0: No glaciers exist in this range</p>
      
      <p style={{color: one_color, width: "90%", margin: "0 auto"}}>1: Glaciers exist only in occasional cirques, extend for 500 feet or less, are visibly spotty or inconsistent, and do not contain crevaces of notable size </p>

      <p style={{color: two_color, width: "90%", margin: "0 auto"}}>2: Glaciers only in occasional or uncommon cirques, but may extend longer than 500 feet, appear wider, appear more consistent, and may even have some small crevaces due to topography </p>

      <p style={{color: three_color, width: "90%", margin: "0 auto"}}>3: Glaciers exist and are not necessarily confined to a small cirque or other topographic feature, likely longer than 500 feet but possibly just very wide, but are still uncommon and have relatively small crevaces </p>

      <p style={{color: four_color, width: "90%", margin: "0 auto"}}>4: Glaciers exist, are somewhat common, and have visible large crevaces, extending for greater than 500 feet and generally appearing quite consistent </p>

      <p style={{color: five_color, width: "90%", margin: "0 auto"}}>5: Glaciers are quite common and icefields / 'sufficiently' large glaciers exist in this range, surpassing all other categories </p>

      <br></br>
      <p style={{ width: "90%", margin: "0 auto" }}>
        Zoom in on the map to view the names of each range, and zoom further to view the treeline and snowline elevations, if they exist for the range
      </p>
      <D3Map></D3Map>
    </div>
  );
}

export default App