// Sample data for the design prototypes. Not real listings, dealers or prices.
window.PNW = (function () {
  const places = {
    Yakima: { state: 'WA', county: 'Yakima', lat: 46.60, lng: -120.51 },
    Prosser: { state: 'WA', county: 'Benton', lat: 46.21, lng: -119.77 },
    Kennewick: { state: 'WA', county: 'Benton', lat: 46.21, lng: -119.14 },
    'Spokane Valley': { state: 'WA', county: 'Spokane', lat: 47.67, lng: -117.24 },
    Salem: { state: 'OR', county: 'Marion', lat: 44.94, lng: -123.04 },
    Bend: { state: 'OR', county: 'Deschutes', lat: 44.06, lng: -121.31 },
    Medford: { state: 'OR', county: 'Jackson', lat: 42.33, lng: -122.87 },
    Boise: { state: 'ID', county: 'Ada', lat: 43.62, lng: -116.21 },
    Nampa: { state: 'ID', county: 'Canyon', lat: 43.58, lng: -116.56 },
    "Coeur d'Alene": { state: 'ID', county: 'Kootenai', lat: 47.68, lng: -116.78 },
  };
  const zips = {
    '98901': 'Yakima', '99350': 'Prosser', '99336': 'Kennewick', '99206': 'Spokane Valley',
    '97301': 'Salem', '97701': 'Bend', '97501': 'Medford', '83702': 'Boise', '83651': 'Nampa', '83814': "Coeur d'Alene",
  };
  const dealers = [
    { id: 'd1', name: 'Sample Valley Homes', town: 'Yakima', tier: 'mirrored' },
    { id: 'd2', name: 'Sample Cascade Housing', town: 'Salem', tier: 'indexed' },
    { id: 'd3', name: 'Sample Snake River Homes', town: 'Nampa', tier: 'managed' },
    { id: 'd4', name: 'Sample Inland Homes', town: 'Spokane Valley', tier: 'mirrored' },
  ];
  const homes = [
    { id: 'h1', title: '2019 double-wide, 3 bed 2 bath', maker: 'Skyline', model: 'Sample 2856-3B', year: 2019, beds: 3, baths: 2, sqft: 1456, sections: 2, price: 139900, kind: 'stock', condition: 'used', move: 'may stay', town: 'Yakima', park: 'Sample Orchard Park', lotRent: 650, dealer: 'd1', checked: 1, palette: 0 },
    { id: 'h2', title: 'New 2026 triple-wide, 4 bed 2 bath', maker: 'Champion', model: 'Sample 4476-4B', year: 2026, beds: 4, baths: 2, sqft: 2128, sections: 3, price: 172500, priceKind: 'from', kind: 'order', condition: 'new', move: 'delivered', town: 'Salem', dealer: 'd2', checked: 2, palette: 1 },
    { id: 'h3', title: '1998 double-wide, must be moved', maker: 'Fleetwood', model: 'unknown', year: 1998, beds: 3, baths: 2, sqft: 1344, sections: 2, price: 42000, kind: 'stock', condition: 'used', move: 'must move', town: 'Prosser', dealer: null, seller: 'Private seller', checked: 0, palette: 2 },
    { id: 'h4', title: '2022 single-wide, 2 bed 2 bath', maker: 'Clayton', model: 'Sample Tempo 16x76', year: 2022, beds: 2, baths: 2, sqft: 1140, sections: 1, price: 89900, kind: 'stock', condition: 'used', move: 'may stay', town: 'Boise', park: 'Sample Riverside 55+', lotRent: 780, dealer: 'd3', checked: 1, palette: 3 },
    { id: 'h5', title: 'New 2026 double-wide, 3 bed 2 bath', maker: 'Clayton', model: 'Sample Tempo 28x60', year: 2026, beds: 3, baths: 2, sqft: 1620, sections: 2, price: 158000, priceKind: 'from', kind: 'order', condition: 'new', move: 'delivered', town: 'Nampa', dealer: 'd3', checked: 0, palette: 4 },
    { id: 'h6', title: '2008 double-wide on its own lot', maker: 'Marlette', model: 'unknown', year: 2008, beds: 3, baths: 2, sqft: 1512, sections: 2, price: 176000, kind: 'stock', condition: 'used', move: 'may stay', town: 'Bend', dealer: 'd2', checked: 5, palette: 5 },
    { id: 'h7', title: '2015 single-wide in a family park', maker: 'Champion', model: 'Sample 1672-2B', year: 2015, beds: 2, baths: 1, sqft: 1064, sections: 1, price: 64500, kind: 'stock', condition: 'used', move: 'may stay', town: 'Kennewick', park: 'Sample Columbia Village', lotRent: 595, dealer: null, seller: 'Private seller', checked: 3, palette: 6 },
    { id: 'h8', title: '2021 double-wide, 4 bed 2 bath', maker: 'Skyline', model: 'Sample 2868-4B', year: 2021, beds: 4, baths: 2, sqft: 1848, sections: 2, price: 169000, kind: 'stock', condition: 'used', move: 'must move', town: 'Spokane Valley', dealer: 'd4', checked: 1, palette: 7 },
    { id: 'h9', title: '1985 single-wide, as-is', maker: 'unknown', model: 'unknown', year: 1985, beds: 2, baths: 1, sqft: 924, sections: 1, price: 18500, kind: 'stock', condition: 'used', move: 'must move', town: 'Medford', dealer: null, seller: 'Private seller', checked: 6, palette: 8 },
    { id: 'h10', title: 'New 2026 double-wide, 3 bed 2 bath', maker: 'Skyline', model: 'Sample 2856-3B', year: 2026, beds: 3, baths: 2, sqft: 1456, sections: 2, price: 149900, priceKind: 'from', kind: 'order', condition: 'new', move: 'delivered', town: 'Spokane Valley', dealer: 'd4', checked: 2, palette: 9 },
    { id: 'h11', title: '2017 double-wide near the lake', maker: 'Kit', model: 'Sample Northwest 28x56', year: 2017, beds: 3, baths: 2, sqft: 1560, sections: 2, price: 124000, kind: 'stock', condition: 'used', move: 'may stay', town: "Coeur d'Alene", park: 'Sample Lakeview Estates', lotRent: 720, dealer: null, seller: 'Private seller', checked: 1, palette: 1 },
  ];
  homes.forEach(h => { h.place = places[h.town]; h.dealerObj = dealers.find(d => d.id === h.dealer) || null; });

  const miles = (a, b) => {
    const r = x => x * Math.PI / 180, R = 3958.8;
    const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(s)));
  };
  function search({ zip = '', radius = 200, maxPrice = 0, beds = 0, baths = 0, kind = 'all', move = 'any' } = {}) {
    const origin = places[zips[zip]];
    return homes.map(h => ({ ...h, distance: origin ? miles(origin, h.place) : null }))
      .filter(h => !origin || h.distance <= radius)
      .filter(h => !maxPrice || h.price <= maxPrice)
      .filter(h => h.beds >= beds && h.baths >= baths)
      .filter(h => kind === 'all' || h.kind === kind)
      .filter(h => move === 'any' || (move === 'stay' ? h.move === 'may stay' : h.move === 'must move'))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0) || a.price - b.price);
  }
  const money = n => '$' + n.toLocaleString('en-US');
  const priceLabel = h => (h.priceKind === 'from' ? 'from ' : '') + money(h.price);
  const checkedLabel = h => h.checked === 0 ? 'Checked today' : h.checked === 1 ? 'Checked yesterday' : `Checked ${h.checked} days ago`;
  const sellerName = h => h.dealerObj ? h.dealerObj.name : h.seller;
  const sellerKind = h => h.dealerObj ? 'Dealer' : 'Owner';

  // Drawn stand-ins for listing photos, so the prototypes need no image files.
  const skies = [['#bcd3e6', '#e9f1f7'], ['#f3d9b1', '#fbeedd'], ['#c9d8c5', '#eef3ec'], ['#d7cde6', '#f1edf7'], ['#b9d9d6', '#e8f4f3'], ['#e8c9b9', '#f8ece5'], ['#cfd6de', '#eef1f4'], ['#e3dcb6', '#f6f3e2'], ['#c3cfdd', '#ecf0f5'], ['#d9e4c4', '#f2f6ea']];
  const sidings = ['#e8e3d6', '#c9d4dc', '#d8c8b0', '#b8c6b3', '#e2d6c3', '#c7c2d6', '#d9dcd2', '#cdb9a4', '#bfcad6', '#e6ddc8'];
  const roofs = ['#4b4f55', '#5b4a3f', '#3f4a52', '#55504a', '#4a4540', '#3d4750'];
  function photo(h, variant = 0) {
    const i = (h.palette + variant) % skies.length;
    const [sky1, sky2] = skies[i], siding = sidings[(i + 3) % sidings.length], roof = roofs[i % roofs.length];
    const w = h.sections === 1 ? 380 : h.sections === 2 ? 470 : 540;
    const x = (640 - w) / 2, y = 190, height = h.sections === 1 ? 118 : 138;
    const windows = Array.from({ length: Math.floor(w / 78) }, (_, k) => `<rect x="${x + 34 + k * 78}" y="${y + 34}" width="40" height="34" rx="2" fill="#6f8797" opacity=".75"/>`).join('');
    return `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sample photo placeholder">
      <defs><linearGradient id="s${h.id}${variant}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient></defs>
      <rect width="640" height="400" fill="url(#s${h.id}${variant})"/>
      <path d="M0 250 Q160 205 320 240 T640 225 V400 H0Z" fill="#9fb08f" opacity=".55"/>
      <rect x="0" y="${y + height}" width="640" height="${400 - y - height}" fill="#a8b596"/>
      <polygon points="${x - 10},${y} ${x + w / 2},${y - (h.sections === 1 ? 26 : 44)} ${x + w + 10},${y}" fill="${roof}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${height}" fill="${siding}"/>
      <rect x="${x}" y="${y + height - 14}" width="${w}" height="14" fill="#8d8a80" opacity=".6"/>
      ${windows}
      <rect x="${x + w - 70}" y="${y + 40}" width="34" height="${height - 40}" fill="#7a6a58"/>
      <rect x="${x + w - 86}" y="${y + height - 4}" width="66" height="8" fill="#6d665c"/>
    </svg>`;
  }
  return { places, zips, dealers, homes, search, money, priceLabel, checkedLabel, sellerName, sellerKind, photo };
})();
