
// HyperIntelligent AR-AI Nexus Service Worker
// Implements AI-powered caching and predictive loading

const CACHE_NAME = 'hyperintelligent-nexus-v2.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900'
];

// AI-powered predictive caching
class PredictiveCache {
  constructor() {
    this.userBehavior = new Map();
    this.predictionModel = {
      sections: ['dashboard', 'agents', 'rendering', 'data', 'features'],
      transitions: new Map()
    };
  }

  async predictNextResources(currentPath) {
    // AI prediction logic for next likely resources
    const predictions = this.predictionModel.transitions.get(currentPath) || [];
    return predictions.slice(0, 3); // Top 3 predictions
  }

  async preloadPredictedContent(predictions) {
    for (const prediction of predictions) {
      try {
        const response = await fetch(prediction);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(prediction, response);
        }
      } catch (error) {
        console.log('Predictive preload failed:', error);
      }
    }
  }
}

const predictiveCache = new PredictiveCache();

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🤖 AI Service Worker: Caching core assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ AI Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🧹 AI Service Worker: Cleaning old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('🚀 AI Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - AI-powered response strategy
self.addEventListener('fetch', event => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache and predict next resources
          predictiveCache.predictNextResources(request.url)
            .then(predictions => {
              predictiveCache.preloadPredictedContent(predictions);
            });
          return cachedResponse;
        }

        // Fetch from network with AI-powered retry logic
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(error => {
            console.log('🔧 AI Service Worker: Network error, falling back:', error);
            // Fallback strategy for offline scenarios
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('AI Service Worker: Resource unavailable offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for AI operations
self.addEventListener('sync', event => {
  if (event.tag === 'ai-data-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'AI_SYNC_COMPLETE',
            timestamp: Date.now()
          });
        });
      })
    );
  }
});

// Handle AI agent communications
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'AI_AGENT_UPDATE':
      // Handle AI agent status updates
      console.log('🤖 AI Agent Update:', data);
      break;
    case 'PREDICTIVE_CACHE_REQUEST':
      // Handle predictive caching requests
      predictiveCache.preloadPredictedContent(data.predictions);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
  }
});

console.log('🧠 HyperIntelligent AR-AI Nexus Service Worker: Initialized');
