const DOM = {
  origin: document.getElementById("origin"),
  destination: document.getElementById("destination"),
  departureWindow: document.getElementById("departure-window"),
  travelMode: document.getElementById("travel-mode"),
  runAnalysis: document.getElementById("run-analysis"),
  refreshData: document.getElementById("refresh-data"),
  mapsRoute: document.getElementById("maps-route"),
  googleMapsLink: document.getElementById("google-maps-link"),
  routeTitle: document.getElementById("route-title"),
  riskPill: document.getElementById("risk-pill"),
  safetyScore: document.getElementById("safety-score"),
  delayMinutes: document.getElementById("delay-minutes"),
  totalTime: document.getElementById("total-time"),
  crowdingRisk: document.getElementById("crowding-risk"),
  lightingScore: document.getElementById("lighting-score"),
  transitScore: document.getElementById("transit-score"),
  recommendation: document.getElementById("recommendation"),
  actionsList: document.getElementById("actions-list"),
  trendChart: document.getElementById("trend-chart"),
  eventStream: document.getElementById("event-stream"),
  scoreRing: document.getElementById("score-ring"),
  refreshClock: document.getElementById("refresh-clock"),
};

const state = {
  focus: "safety",
  lastSnapshot: null,
  originPlace: null,
  destinationPlace: null,
};

const riskProfiles = {
  metro: { baseScore: 86, delay: 8, crowding: 2, lighting: 1, reliability: 2, heat: 0.6, baseTime: 31 },
  bus: { baseScore: 72, delay: 14, crowding: 3, lighting: 2, reliability: 3, heat: 0.75, baseTime: 42 },
  ridehail: { baseScore: 78, delay: 9, crowding: 1, lighting: 1, reliability: 2, heat: 0.5, baseTime: 24 },
  bike: { baseScore: 64, delay: 6, crowding: 1, lighting: 3, reliability: 2, heat: 0.55, baseTime: 18 },
};

const neighborhoodSignals = [
  "platform crowding rising near interchange stations",
  "two minor signal delays reported on the east corridor",
  "street lighting adequate on the recommended path",
  "a bus bunching event detected three stops ahead",
  "pedestrian traffic is lighter on the north exit",
  "no incident alerts in the last 12 minutes",
  "ride-hail pickup times are normal for this hour",
  "live train arrival variance is widening slightly",
];

const routeNamePairs = [
  ["San Francisco", "Los Angeles"],
  ["New York", "Boston"],
  ["Seattle", "Portland"],
  ["Chicago", "Milwaukee"],
  ["Austin", "Houston"],
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function getWeightMultiplier() {
  switch (state.focus) {
    case "speed":
      return -4;
    case "cost":
      return -2;
    default:
      return 6;
  }
}

function buildSnapshot() {
  const mode = DOM.travelMode.value;
  const profile = riskProfiles[mode];
  const departureIndex = DOM.departureWindow.selectedIndex;
  const departureBias = [0, 3, 6, 10][departureIndex];
  const windowNoise = randomInt(-4, 6);
  const timeOfDayPenalty = new Date().getHours() >= 18 ? 8 : 0;
  const score = clamp(
    profile.baseScore - departureBias - timeOfDayPenalty + windowNoise + getWeightMultiplier(),
    32,
    96,
  );
  const delay = clamp(profile.delay + departureBias + randomInt(-3, 5), 2, 32);
  const crowding = clamp(profile.crowding + Math.round(departureBias / 6) + randomInt(0, 1), 1, 5);
  const lighting = clamp(5 - profile.lighting + randomInt(-1, 1), 1, 5);
  const reliability = clamp(5 - profile.reliability + randomInt(-1, 1), 1, 5);

  const safetyBand = score >= 82 ? "Low risk" : score >= 68 ? "Moderate risk" : "High risk";
  const crowdingBand = crowding >= 4 ? "High" : crowding >= 3 ? "Rising" : "Normal";
  const lightingBand = lighting >= 4 ? "Excellent" : lighting >= 3 ? "Good" : "Patchy";
  const transitBand = reliability >= 4 ? "Reliable" : reliability >= 3 ? "Stable" : "Unstable";

  // Use accurate location data from Google Places or fallback to defaults
  const origin = state.originPlace?.name || DOM.origin.value.trim() || "Current location";
  const destination = state.destinationPlace?.name || DOM.destination.value.trim() || "Chosen destination";

  return {
    origin,
    destination,
    originLat: state.originPlace?.lat,
    originLng: state.originPlace?.lng,
    destinationLat: state.destinationPlace?.lat,
    destinationLng: state.destinationPlace?.lng,
    mode,
    score,
    delay,
    totalTime: profile.baseTime + delay,
    crowdingBand,
    lightingBand,
    transitBand,
    safetyBand,
    detail: generateRecommendation(mode, score, delay, crowding, lighting, reliability),
    actions: buildActions(mode, score, delay, crowding, lighting, reliability),
    trend: buildTrend(score, delay, crowding, lighting, reliability),
    events: buildEvents(score, delay, crowding, reliability),
  };
}

function generateRecommendation(mode, score, delay, crowding, lighting, reliability) {
  if (score >= 82) {
    return `Take the ${prettyMode(mode)} now. Conditions are favorable, with a ${delay}-minute delay estimate and stable corridor signals.`;
  }

  if (score >= 68) {
    return `Use the ${prettyMode(mode)} route, but leave a little earlier. Delay risk is ${delay} minutes and crowding is ${crowding >= 4 ? "high" : "manageable"}.`;
  }

  return `Choose a safer fallback: switch to ${mode === "bike" ? "metro + walk" : "ride hail or metro"}. The corridor is under pressure and reliability is only ${reliability}/5.`;
}

function buildActions(mode, score, delay, crowding, lighting, reliability) {
  const actions = [];

  if (score >= 82) {
    actions.push(`Proceed with the ${prettyMode(mode)} route.`);
  } else {
    actions.push(`Leave ${Math.max(4, Math.round((82 - score) / 2))} minutes earlier.`);
  }

  if (crowding >= 4) {
    actions.push("Prefer the less crowded station exit or side street.");
  }

  if (lighting <= 2) {
    actions.push("Avoid poorly lit connectors after dusk.");
  }

  if (reliability <= 2) {
    actions.push("Keep a backup mode in Google Maps before departing.");
  }

  actions.push(`Estimated delay: ${delay} minutes.`);
  return actions.slice(0, 3);
}

function buildTrend(score, delay, crowding, lighting, reliability) {
  const base = [score, score - 4, score - 2, score + 1, score - 7, score - 5, score - 1, score + 2];
  return base.map((value, index) => {
    const adjusted = clamp(value - delay / 5 + lighting * 2 - crowding * 2 + reliability, 26, 96);
    const labels = ["Now", "+10m", "+20m", "+30m", "+40m", "+50m", "+60m", "Plan"];
    return { label: labels[index], value: adjusted };
  });
}

function buildEvents(score, delay, crowding, reliability) {
  const today = formatTime();
  return [
    {
      title: "Transit feed updated",
      time: today,
      text: `Live arrival predictions changed by ${delay > 12 ? "+" : ""}${randomInt(1, 4)} minutes on the recommended corridor.`,
    },
    {
      title: "Crowd density observed",
      time: formatTime(),
      text: crowding >= 4 ? "Platform density is above baseline; select a quieter boarding point." : "Platform density remains within a normal range.",
    },
    {
      title: "Safety model recalculated",
      time: formatTime(),
      text: score >= 80 ? "Route remains acceptable for immediate departure." : reliability <= 2 ? "Backup route suggested because reliability dipped." : "Route is usable with a small buffer.",
    },
  ];
}

function prettyMode(mode) {
  return {
    metro: "metro + walk",
    bus: "bus + walk",
    ridehail: "ride hail",
    bike: "bike route",
  }[mode];
}

function renderTrend(trend) {
  DOM.trendChart.innerHTML = trend
    .map((point) => {
      const height = clamp(point.value, 24, 96);
      const opacity = 0.35 + (height / 120);
      return `<div class="bar" data-label="${point.label}" style="height:${height}%; opacity:${opacity}"></div>`;
    })
    .join("");
}

function renderEvents(events) {
  DOM.eventStream.innerHTML = events
    .map(
      (event) => `
        <article class="event">
          <div class="event-time">${event.time}</div>
          <div class="event-title">${event.title}</div>
          <div class="event-text">${event.text}</div>
        </article>
      `,
    )
    .join("");
}

function renderActions(actions) {
  DOM.actionsList.innerHTML = actions
    .map((action) => `<div class="bullet">${action}</div>`)
    .join("");
}

function renderSnapshot(snapshot) {
  DOM.routeTitle.textContent = `${snapshot.origin} to ${snapshot.destination}`;
  DOM.safetyScore.textContent = Math.round(snapshot.score);
  DOM.delayMinutes.textContent = `${snapshot.delay} min`;
  DOM.totalTime.textContent = `${snapshot.totalTime} min`;
  DOM.crowdingRisk.textContent = snapshot.crowdingBand;
  DOM.lightingScore.textContent = snapshot.lightingBand;
  DOM.transitScore.textContent = snapshot.transitBand;
  DOM.riskPill.textContent = snapshot.safetyBand;
  DOM.recommendation.textContent = snapshot.detail;
  DOM.refreshClock.textContent = formatTime();

  const circumference = 439.82;
  const offset = circumference - (snapshot.score / 100) * circumference;
  DOM.scoreRing.style.strokeDashoffset = `${offset}`;

  renderTrend(snapshot.trend);
  renderEvents(snapshot.events);
  renderActions(snapshot.actions);

  // Build accurate Google Maps URL with coordinates if available
  let mapsUrl;
  if (snapshot.originLat && snapshot.originLng && snapshot.destinationLat && snapshot.destinationLng) {
    mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${snapshot.originLat},${snapshot.originLng}&destination=${snapshot.destinationLat},${snapshot.destinationLng}&travelmode=${snapshot.mode === "ridehail" ? "driving" : snapshot.mode === "bike" ? "bicycling" : "transit"}`;
  } else {
    mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(snapshot.origin)}&destination=${encodeURIComponent(snapshot.destination)}&travelmode=${snapshot.mode === "ridehail" ? "driving" : snapshot.mode === "bike" ? "bicycling" : "transit"}`;
  }
  DOM.mapsRoute.href = mapsUrl;
  DOM.googleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(snapshot.destination)}`;
}

function updateSnapshot() {
  const snapshot = buildSnapshot();
  state.lastSnapshot = snapshot;
  renderSnapshot(snapshot);
}

function syncDestinationPair() {
  const pair = routeNamePairs[randomInt(0, routeNamePairs.length - 1)];
  if (!DOM.origin.value || DOM.origin.value === "San Francisco") {
    DOM.origin.value = pair[0];
  }
  if (!DOM.destination.value || DOM.destination.value === "Los Angeles") {
    DOM.destination.value = pair[1];
  }
}

function initializeGooglePlacesAutocomplete() {
  const service = new google.maps.places.AutocompleteService();
  const sessionToken = new google.maps.places.AutocompleteSessionToken();

  function setupAutocomplete(inputElement, placeStateKey) {
    // Fetch place predictions
    $(inputElement).autocomplete({
      source: function (request, response) {
        service.getPlacePredictions(
          {
            input: request.term,
            sessionToken: sessionToken,
            types: ["geocode"], // Include all address types
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              response(
                predictions.map((prediction) => ({
                  label: prediction.description,
                  value: prediction.description,
                  placeId: prediction.place_id,
                })),
              );
            } else {
              response([]);
            }
          },
        );
      },
      select: function (event, ui) {
        const placeService = new google.maps.places.PlacesService(document.createElement("div"));
        placeService.getDetails(
          { placeId: ui.item.placeId, sessionToken: sessionToken, fields: ["geometry", "formatted_address", "name"] },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
              const placeData = {
                name: place.formatted_address || place.name || ui.item.value,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              
              if (placeStateKey === "origin") {
                state.originPlace = placeData;
              } else {
                state.destinationPlace = placeData;
              }
              
              updateSnapshot();
            }
          },
        );
        return false;
      },
      minLength: 3,
    });
  }

  setupAutocomplete("#origin", "origin");
  setupAutocomplete("#destination", "destination");
}

function bindChips() {
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", function(event) {
      event.preventDefault();
      
      // Remove active class from all chips
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.remove("active");
      });
      
      // Add active class to clicked chip
      this.classList.add("active");
      
      // Update state and refresh
      state.focus = this.dataset.weight;
      updateSnapshot();
    });
  });
}

function startAutoRefresh() {
  setInterval(() => {
    DOM.refreshClock.textContent = formatTime();
    if (document.visibilityState === "visible") {
      updateSnapshot();
    }
  }, 7000);
}

DOM.runAnalysis.addEventListener("click", updateSnapshot);
DOM.refreshData.addEventListener("click", updateSnapshot);
[DOM.origin, DOM.destination, DOM.departureWindow, DOM.travelMode].forEach((element) => {
  element.addEventListener("change", updateSnapshot);
});

syncDestinationPair();
initializeGooglePlacesAutocomplete();
bindChips();
updateSnapshot();
startAutoRefresh();
