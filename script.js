const WEATHER_API_KEY = "6b269ed9c2c30ffa5f2d349325ff1b26";

/* =======================
   Utilities & helpers
======================= */
function getRandomUV(){ return Math.floor(Math.random()*11); }

function getIconFile(name){
  const condition = name.toLowerCase();
  // Check snow first before clouds (since "snow" might contain "cloud")
  if(condition.includes('snow')) return 'snow_icon.jpg';
  if(condition.includes('rain') || condition.includes('drizzle')) return 'rain_icon.jpg';
  if(condition.includes('thunderstorm') || condition.includes('storm')) return 'storm_icon.jpg';
  if(condition.includes('clear') || condition.includes('sunny')) return 'sunny_icon.jpg';
  if(condition.includes('cloud') || condition.includes('mist') || condition.includes('fog')) return 'cloudy_icon.jpg';
  return 'storm_icon.jpg'; // default fallback
}

function getBackgroundFile(name){
  const condition = name.toLowerCase();
  // Check snow first before clouds (since "snow" might contain "cloud")
  if(condition.includes('snow')) return 'snow.jpg';
  if(condition.includes('rain') || condition.includes('drizzle')) return 'rain.jpg';
  if(condition.includes('thunderstorm') || condition.includes('storm')) return 'storm.jpg';
  if(condition.includes('clear') || condition.includes('sunny')) return 'sunny.jpg';
  if(condition.includes('cloud') || condition.includes('mist') || condition.includes('fog')) return 'cloudy.jpg';
  return 'storm.jpg'; // default fallback
}

function formatTemp(t){
  if(unit === 'metric') return `${t} °C`;
  return `${Math.round(t * 9/5 + 32)} °F`;
}

/* =======================
   DOM refs & state
======================= */
const startSearchBtn = document.getElementById("startSearchBtn");
const cityInputHome = document.getElementById("cityInputHome");
const appContent = document.getElementById("appContent");
const welcome = document.getElementById("welcome");
const themeToggle = document.getElementById('themeToggle');
const signOutBtn = document.getElementById('signOutBtn');
const authOverlay = document.getElementById('authOverlay');
const tabSignup = document.getElementById('tabSignup');
const tabSignin = document.getElementById('tabSignin');
const signupBtn = document.getElementById('signupBtn');
const signinBtn = document.getElementById('signinBtn');
const suName = document.getElementById('suName');
const suEmail = document.getElementById('suEmail');
const suPass = document.getElementById('suPass');
const siEmail = document.getElementById('siEmail');
const siPass = document.getElementById('siPass');

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const unitToggle = document.getElementById("unitToggle");
const geoBtn = document.getElementById("geoBtn");
const searchHistoryDiv = document.getElementById("searchHistory");
const historyToggle = document.getElementById('historyToggle');

let unit = 'metric';
let unitSymbol = '°C';
let tempChart = null;
let comparisonChart = null;
let isLoading = false;
let map = null;
let mapMarker = null;
let lastFetched = { current:null, forecast:null };

/* =======================
   Animations
======================= */
const animLayer = document.getElementById('weatherAnimation');
function clearAnimationLayer(){ animLayer.innerHTML = ''; }
function animateCondition(cond){
  clearAnimationLayer();
  cond = cond.toLowerCase();
  if(cond.includes('rain')){
    for(let i=0;i<60;i++){
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = Math.random() * 100 + 'vw';
      drop.style.animationDuration = (0.7 + Math.random() * 0.9) + 's';
      drop.style.opacity = 0.6 + Math.random() * 0.4;
      animLayer.appendChild(drop);
    }
  } else if(cond.includes('cloud')){
    for(let i=0;i<6;i++){
      const c = document.createElement('div');
      c.className = 'cloud';
      c.style.top = (5 + Math.random() * 70) + '%';
      c.style.left = (-30 - Math.random()*20) + 'vw';
      c.style.width = (120 + Math.random()*120) + 'px';
      c.style.height = (40 + Math.random()*40) + 'px';
      c.style.animationDuration = (20 + Math.random()*20) + 's';
      animLayer.appendChild(c);
    }
  }
}

/* =======================
   Search history
======================= */
function loadSearchHistory(){
  const arr = JSON.parse(localStorage.getItem('ws_history') || '[]');
  renderSearchHistory(arr);
}
function addToSearchHistory(city){
  if(!city) return;
  let arr = JSON.parse(localStorage.getItem('ws_history') || '[]');
  arr = arr.filter(c => c !== city);
  arr.unshift(city);
  if(arr.length > 6) arr.pop();
  localStorage.setItem('ws_history', JSON.stringify(arr));
  renderSearchHistory(arr);
}
function renderSearchHistory(arr){
  searchHistoryDiv.innerHTML = '';
  arr.forEach(city => {
    const btn = document.createElement('button');
    btn.className = 'history-btn';
    btn.textContent = city;
    btn.onclick = () => performSearch(city);
    searchHistoryDiv.appendChild(btn);
  });
}

/* =======================
   Fetch & render
======================= */
async function fetchWeather(city){
  try{
    setLoading(true);
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=${unit}`);
    const data = await res.json();
    if(data.cod !== 200) throw new Error(data.message);

    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=${unit}`);
    const forecast = await forecastRes.json();
    return { data, forecast };
  } catch(err){
    console.warn("API fetch failed:", err.message);
    alert("Unable to fetch weather for "+city);
    return null;
  }
  finally{ setLoading(false); }
}

async function performSearch(raw){
  const result = await fetchWeather(raw);
  if(!result) return;

  const data = {
    name: result.data.name,
    sys: { country: result.data.sys.country },
    main: { temp: result.data.main.temp, humidity: result.data.main.humidity },
    weather: result.data.weather,
    wind: { speed: result.data.wind.speed },
    uv: getRandomUV(),
    bg: getBackgroundFile(result.data.weather[0].main),
    icon: getIconFile(result.data.weather[0].main)
  };
  const forecast = { list: result.forecast.list };

  showAppIfHidden();
  renderFullUI(data, forecast);
  addToSearchHistory(data.name);
}

function showAppIfHidden(){ 
  if(welcome) welcome.classList.add('d-none'); 
  appContent.classList.remove('d-none'); 
}

/* =======================
   Auth
======================= */
function isAuthed(){ return !!localStorage.getItem('ws_user'); }
function requireAuth(){ if(!isAuthed()){ authOverlay.classList.remove('d-none'); } }
function finishAuth(user){ localStorage.setItem('ws_user', JSON.stringify(user)); authOverlay.classList.add('d-none'); }
function signOut(){ localStorage.removeItem('ws_user'); location.reload(); }

tabSignup?.addEventListener('click', ()=>{ tabSignup.classList.add('active'); tabSignin.classList.remove('active'); document.getElementById('signupForm').classList.remove('d-none'); document.getElementById('signinForm').classList.add('d-none'); });
tabSignin?.addEventListener('click', ()=>{ tabSignin.classList.add('active'); tabSignup.classList.remove('active'); document.getElementById('signinForm').classList.remove('d-none'); document.getElementById('signupForm').classList.add('d-none'); });
signupBtn?.addEventListener('click', ()=>{
  const name = suName.value.trim(); const email = suEmail.value.trim(); const pass = suPass.value;
  if(!name || !email || !pass){ alert('Please fill all fields'); return; }
  localStorage.setItem('ws_user_creds', JSON.stringify({ email, pass, name }));
  finishAuth({ name, email });
});
signinBtn?.addEventListener('click', ()=>{
  const email = siEmail.value.trim(); const pass = siPass.value;
  const creds = JSON.parse(localStorage.getItem('ws_user_creds')||'{}');
  if(!creds.email){ alert('No account found, please sign up'); return; }
  if(email===creds.email && pass===creds.pass){ finishAuth({ name: creds.name, email }); }
  else{ alert('Invalid credentials'); }
});
signOutBtn?.addEventListener('click', signOut);

/* =======================
   Render UI
======================= */
function renderFullUI(current, forecast){
  document.getElementById('cityName').innerText = `${current.name}, ${current.sys.country}`;
  document.getElementById('heroIcon').src = `images/${current.icon}`;
  animateTemperature(current.main.temp);
  document.getElementById('heroExtra').innerText = `Wind: ${current.wind.speed} ${unit==='metric'?'m/s':'mph'} | Humidity: ${current.main.humidity}% | UV: ${current.uv}`;

  const adv = document.getElementById('advice');
  let t = current.main.temp;
  let adviceText = t < 10 ? "Cold — wear a warm jacket ❄️" : t < 20 ? "Mild — light sweater 🙂" : "Warm — T-shirt 👕";
  adv.innerHTML = `<div class="glass p-3" style="color:#fff">${adviceText}</div>`;

  document.body.style.backgroundImage = `url('images/${current.bg}')`;
  animateCondition(current.weather[0].main);

  const hourEl = document.getElementById('hourlyForecast');
  hourEl.innerHTML = '';
  forecast.list.slice(0,8).forEach(it => {
    const hour = new Date(it.dt_txt).getHours();
    const card = document.createElement('div');
    card.className = 'card p-2';
    card.innerHTML = `<h6>${hour}:00</h6>
      <img src="images/${getIconFile(it.weather[0].main)}" width="40" alt="icon">
      <p class="mb-0">${formatTemp(it.main.temp)}</p>`;
    hourEl.appendChild(card);
  });

  const daily = forecast.list.filter((_,i)=> i%8===0);
  const f = document.getElementById('forecast'); f.innerHTML = '';
  daily.forEach(d => {
    const col = document.createElement('div'); col.className = 'col-md-2';
    const c = document.createElement('div'); c.className = 'card p-2';
    c.innerHTML = `<h6>${new Date(d.dt_txt).toLocaleDateString()}</h6>
      <img src="images/${getIconFile(d.weather[0].main)}" width="40" alt="icon">
      <p class="mb-0">${formatTemp(d.main.temp)}</p>`;
    col.appendChild(c); f.appendChild(col);
  });

  renderTemperatureChart(daily);
  lastFetched.current = current; lastFetched.forecast = daily;
  const lastUpdatedEl = document.getElementById('lastUpdated');
  if(lastUpdatedEl){ lastUpdatedEl.innerText = new Date().toLocaleString(); }
  const heroContainer = document.getElementById('heroContainer');
  heroContainer.classList.remove('fade-in'); void heroContainer.offsetWidth; heroContainer.classList.add('fade-in');
}

/* =======================
   Loading UI helpers
======================= */
function setLoading(state){
  isLoading = state;
  const hero = document.getElementById('hero');
  const heroSk = document.getElementById('heroSkeleton');
  const hourly = document.getElementById('hourlyForecast');
  const hourlySk = document.getElementById('hourlySkeleton');
  const forecast = document.getElementById('forecast');
  const forecastSk = document.getElementById('forecastSkeleton');
  if(state){
    hero.classList.add('d-none'); heroSk.classList.remove('d-none');
    hourly.classList.add('d-none'); hourlySk.classList.remove('d-none');
    forecast.classList.add('d-none'); forecastSk.classList.remove('d-none');
  }else{
    hero.classList.remove('d-none'); heroSk.classList.add('d-none');
    hourly.classList.remove('d-none'); hourlySk.classList.add('d-none');
    forecast.classList.remove('d-none'); forecastSk.classList.add('d-none');
  }
}

/* =======================
   Temp count-up animation
======================= */
function animateTemperature(targetTemp){
  const el = document.getElementById('heroTemp');
  let start = 0;
  const duration = 600;
  const startTime = performance.now();
  function step(now){
    const progress = Math.min(1, (now - startTime) / duration);
    const current = Math.round(start + (targetTemp - start) * progress);
    el.textContent = formatTemp(current).replace(/\s/g,' ');
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =======================
   Charts
======================= */
function renderTemperatureChart(daily){
  const labels = daily.map(d => new Date(d.dt_txt).toLocaleDateString());
  const data = daily.map(d => d.main.temp);
  const ctx = document.getElementById('tempChart').getContext('2d');
  if(tempChart) tempChart.destroy();
  tempChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets:[{label:`Temp (${unitSymbol})`,data,borderColor:'#34d399',backgroundColor:'rgba(52,211,153,0.18)',fill:true,pointRadius:6,tension:0.35}] },
    options: { responsive:true, plugins:{ tooltip:{ enabled:true }, legend:{ labels:{ color:'#fff' } } }, scales:{ x:{ ticks:{ color:'#fff' } }, y:{ ticks:{ color:'#fff' } } } }
  });
}

async function renderComparisonChartAPI(aCity, bCity){
  const aData = await fetchWeather(aCity);
  const bData = await fetchWeather(bCity);
  if(!aData || !bData) return;

  const dailyA = aData.forecast.list.filter((_,i)=>i%8===0).map(d=>d.main.temp);
  const dailyB = bData.forecast.list.filter((_,i)=>i%8===0).map(d=>d.main.temp);
  const labels = aData.forecast.list.filter((_,i)=>i%8===0).map(d=>new Date(d.dt_txt).toLocaleDateString());

  const ctx = document.getElementById('comparisonChart').getContext('2d');
  if(comparisonChart) comparisonChart.destroy();
  comparisonChart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{label:aData.data.name,data:dailyA,backgroundColor:'rgba(124,58,237,0.8)'},{label:bData.data.name,data:dailyB,backgroundColor:'rgba(59,130,246,0.8)'}] },
    options:{ responsive:true, plugins:{ legend:{ labels:{ color:'#fff' } }, tooltip:{ enabled:true } }, scales:{ x:{ ticks:{ color:'#fff' } }, y:{ ticks:{ color:'#fff' } } } }
  });
}

/* =======================
   Coords-based flow
======================= */
async function fetchWeatherByCoords(lat, lon){
  try{
    setLoading(true);
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${unit}`);
    const data = await res.json();
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${unit}`);
    const forecast = await forecastRes.json();
    return { data, forecast };
  }catch(e){ console.warn(e); alert('Unable to fetch by coordinates'); return null; }
  finally{ setLoading(false); }
}

async function useCoords(lat, lon){
  const result = await fetchWeatherByCoords(lat, lon);
  if(!result) return;
  const data = {
    name: result.data.name,
    sys: { country: result.data.sys.country },
    main: { temp: result.data.main.temp, humidity: result.data.main.humidity },
    weather: result.data.weather,
    wind: { speed: result.data.wind.speed },
    uv: getRandomUV(),
    bg: getBackgroundFile(result.data.weather[0].main),
    icon: getIconFile(result.data.weather[0].main)
  };
  const forecast = { list: result.forecast.list };
  showAppIfHidden();
  renderFullUI(data, forecast);
  addToSearchHistory(`${lat.toFixed(2)},${lon.toFixed(2)}`);
}

/* =======================
   Map & Places
======================= */
function initMap(){
  map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution:'' }).addTo(map);
  const defaultView = [20.5937, 78.9629]; // India center fallback
  map.setView(defaultView, 4);
  map.on('click', (e)=>{
    const { lat, lng } = e.latlng; setLatLonInputs(lat, lng); placeMarker(lat, lng); useCoords(lat, lng);
  });
  if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(pos=>{ const { latitude, longitude } = pos.coords; map.setView([latitude, longitude], 10); placeMarker(latitude, longitude); setLatLonInputs(latitude, longitude); }); }
}

function placeMarker(lat, lon){
  if(mapMarker){ map.removeLayer(mapMarker); }
  mapMarker = L.marker([lat, lon]).addTo(map);
}

function setLatLonInputs(lat, lon){
  document.getElementById('latInput').value = lat.toFixed(6);
  document.getElementById('lonInput').value = lon.toFixed(6);
}

async function geocodePlace(q){
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
  const json = await res.json();
  return json?.[0];
}

/* =======================
   Event wiring
======================= */
startSearchBtn?.addEventListener('click', () => {
  const v = cityInputHome.value.trim();
  if(!v){ alert('Type a city'); return; }
  performSearch(v);
});

// Enter shortcuts
cityInputHome?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ startSearchBtn.click(); }});
cityInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ searchBtn.click(); }});
document.getElementById('compareCityA').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ document.getElementById('compareBtn').click(); }});
document.getElementById('compareCityB').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ document.getElementById('compareBtn').click(); }});

searchBtn.addEventListener('click', ()=> {
  const v = cityInput.value.trim();
  if(!v){ alert('Type a city'); return; }
  performSearch(v);
});

unitToggle.addEventListener('click', ()=>{
  unit = unit === 'metric' ? 'imperial' : 'metric';
  unitSymbol = unit === 'metric' ? '°C' : '°F';
  unitToggle.innerText = unit === 'metric' ? 'Show °F' : 'Show °C';
  const last = JSON.parse(localStorage.getItem('ws_history') || '[]')[0];
  if(last) performSearch(last);
});

geoBtn.addEventListener('click', () => {
  if(!navigator.geolocation){ alert('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    // fallback: nearest sample city
    let pick = 'newyork';
    if(lon > 60 && lon < 100 && lat > 6 && lat < 40) pick = 'bangalore';
    else if(lon > -15 && lon < 10) pick = 'london';
    else if(lon > 120 && lon < 150) pick = 'tokyo';
    performSearch(pick);
  }, ()=> alert('Unable to get location'));
});

document.getElementById('compareBtn').addEventListener('click', ()=>{
  const a = document.getElementById('compareCityA').value;
  const b = document.getElementById('compareCityB').value;
  if(!a || !b){ alert('Enter both cities to compare'); return; }
  renderComparisonChartAPI(a,b);
});

// map/places wiring
const placeSearch = document.getElementById('placeSearch');
const useCoordsBtn = document.getElementById('useCoordsBtn');
placeSearch?.addEventListener('keydown', async (e)=>{
  if(e.key==='Enter'){
    const q = placeSearch.value.trim(); if(!q) return;
    const p = await geocodePlace(q);
    if(!p){ alert('Place not found'); return; }
    const lat = parseFloat(p.lat), lon = parseFloat(p.lon);
    setLatLonInputs(lat, lon); map.setView([lat, lon], 11); placeMarker(lat, lon); useCoords(lat, lon);
  }
});
useCoordsBtn?.addEventListener('click', ()=>{
  const lat = parseFloat(document.getElementById('latInput').value);
  const lon = parseFloat(document.getElementById('lonInput').value);
  if(Number.isFinite(lat) && Number.isFinite(lon)) useCoords(lat, lon);
});

/* =======================
   Theme toggle
======================= */
function applyTheme(theme){
  if(theme==='light'){
    document.body.classList.add('light');
    themeToggle.textContent = 'Dark Mode';
  }else{
    document.body.classList.remove('light');
    themeToggle.textContent = 'Light Mode';
  }
}

const savedTheme = localStorage.getItem('ws_theme') || 'dark';
applyTheme(savedTheme);
themeToggle?.addEventListener('click', ()=>{
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem('ws_theme', next);
  applyTheme(next);
});

/* =======================
   Init
======================= */
loadSearchHistory();

// footer year
const fy = document.getElementById('footerYear');
if(fy){ fy.textContent = new Date().getFullYear(); }

// initialize features
requireAuth();
if(document.getElementById('map')){ initMap(); }

// toggle history dropdown
historyToggle?.addEventListener('click', ()=>{
  searchHistoryDiv.classList.toggle('d-none');
});

/* =======================
   Download Report (PDF)
======================= */
document.getElementById('downloadBtn')?.addEventListener('click', ()=>{
  if(!lastFetched.current || !lastFetched.forecast){ alert('Search first to generate a report'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const cur = lastFetched.current;
  doc.setFontSize(16);
  doc.text(`Weather Report — ${cur.name}, ${cur.sys.country}`, 14, 18);
  doc.setFontSize(11);
  doc.text(`Temperature: ${formatTemp(cur.main.temp)} | Humidity: ${cur.main.humidity}% | Wind: ${cur.wind.speed} ${unit==='metric'?'m/s':'mph'}`, 14, 28);
  doc.text(`Condition: ${cur.weather?.[0]?.main || ''}`, 14, 36);
  doc.text('5-Day Outlook:', 14, 48);
  let y = 56;
  lastFetched.forecast.forEach(d => {
    const line = `${new Date(d.dt_txt).toLocaleDateString()}  —  ${formatTemp(d.main.temp)}  (${d.weather?.[0]?.main || ''})`;
    doc.text(line, 14, y);
    y += 8;
  });
  doc.save(`WeatherReport_${cur.name}.pdf`);
});

