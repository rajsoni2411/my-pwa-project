if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch(err => console.error('❌ SW registration failed:', err));
}

const statusEl = document.getElementById('status');
const contentEl = document.getElementById('content');
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const MAX_OFFLINE_POSTS = 10;

function updateStatus() {
    statusEl.textContent = navigator.onLine ? '✅ You are online' : '⚠️ You are offline';
}

async function loadContent() {
    updateStatus();

    if (navigator.onLine) {
        try {
            console.log('Fetching fresh data from network...');
            // Force fetch fresh data ignoring cache
            const res = await fetch(API_URL, { cache: 'reload' });
            const data = await res.json();

            // Show all posts when online
            contentEl.innerHTML = data.map(post =>
                `<article>
          <h3>${post.title}</h3>
          <p>${post.body}</p>
        </article>`
            ).join('');
        } catch (err) {
            console.error('Failed to fetch online data:', err);
            contentEl.innerHTML = `<p>⚠️ Failed to fetch data online</p>`;
        }
    } else {
        if ('caches' in window) {
            const cachedResponse = await caches.match(API_URL);
            if (cachedResponse) {
                const data = await cachedResponse.json();

                // Show only first 10 posts when offline
                const offlineData = data.slice(0, MAX_OFFLINE_POSTS);

                contentEl.innerHTML = offlineData.map(post =>
                    `<article>
            <h3>${post.title}</h3>
            <p>${post.body}</p>
          </article>`
                ).join('') + `<p><em>(Cached - showing 10 posts)</em></p>`;
            } else {
                contentEl.innerHTML = `<p>⚠️ Offline: No cached data available</p>`;
            }
        }
    }
}

// Listen for network status changes and reload content accordingly
window.addEventListener('online', () => {
    console.log('Network is back online — refreshing data');
    loadContent();
});
window.addEventListener('offline', () => {
    console.log('Network is offline — showing cached data');
    loadContent();
});

// Initial content load
loadContent();
