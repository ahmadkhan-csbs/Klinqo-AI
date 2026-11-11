/**
 * Overpass API Harvester for Kolkata Metropolitan Area
 * Queries real OpenStreetMap hospital & clinic nodes inside bbox [22.35, 88.20, 22.75, 88.55]
 */
import fs from 'fs';
import path from 'path';

const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const BBOX = '22.35,88.20,22.75,88.55';

const QUERY = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](${BBOX});
  way["amenity"="hospital"](${BBOX});
);
out center 50;
`;

async function harvest() {
  console.log('Querying OpenStreetMap Overpass API for Kolkata Healthcare Nodes...');
  let data = null;

  for (const url of OVERPASS_URLS) {
    try {
      console.log(`Trying Overpass endpoint: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(QUERY)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'KlinqoArogyaPathKolkataHarvester/1.0',
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        data = await res.json();
        console.log(`Success from ${url}! Fetched ${data.elements?.length || 0} elements.`);
        break;
      } else {
        console.warn(`Endpoint ${url} failed with status: ${res.status}`);
      }
    } catch (e) {
      console.warn(`Error contacting ${url}:`, e.message);
    }
  }

  if (data && data.elements && data.elements.length > 0) {
    const simplified = data.elements
      .map((el) => {
        const tags = el.tags || {};
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        const name = tags.name || tags['name:en'] || null;
        if (!name) return null;
        return {
          id: el.id,
          name,
          type: tags.amenity,
          operator: tags.operator || tags['operator:type'] || 'Unknown',
          address: tags['addr:street'] || tags['addr:full'] || tags['addr:suburb'] || tags['addr:city'] || 'Kolkata Metropolitan Area',
          pincode: tags['addr:postcode'] || '',
          phone: tags.phone || tags['contact:phone'] || tags['emergency:phone'] || '',
          lat,
          lon,
        };
      })
      .filter(Boolean);

    const outPath = path.join(process.cwd(), 'src/data/osm_kolkata_harvest.json');
    fs.writeFileSync(outPath, JSON.stringify(simplified, null, 2), 'utf8');
    console.log(`Saved ${simplified.length} harvested OSM records to ${outPath}`);
  } else {
    console.log('Overpass response empty or unavailable. Proceeding with verified curated geospatial data.');
  }
}

harvest();
