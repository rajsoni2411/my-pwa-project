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

async function getCachedData() {
    const cache = await caches.open('pwa-posts-cache-v2');
    const cachedResponse = await cache.match(API_URL);
    if (cachedResponse) {
        return await cachedResponse.json();
    }
    return [];
}

async function loadContent() {
    updateStatus();

    if (navigator.onLine) {
        try {
            const res = await fetch(API_URL, { cache: 'no-store' }); // Force no stale cache
            const data = await res.json();

            contentEl.innerHTML = data.map(post => `
                <article>
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                </article>
            `).join('');
        } catch (err) {
            console.error('Fetch failed online:', err);
            const data = await getCachedData();
            contentEl.innerHTML = `<p>⚠️ Network error. Showing cached ${data.length} posts.</p>` + data.map(post => `
        <article>
          <h3>${post.title}</h3>
          <p>${post.body}</p>
        </article>
      `).join('');
        }
    } else {
        const data = await getCachedData();
        const limited = data.slice(0, MAX_OFFLINE_POSTS);
        contentEl.innerHTML = limited.map(post => `
        <article>
            <h3>${post.title}</h3>
            <p>${post.body}</p>
        </article>
        `).join('') + `<p><em>(Offline - Showing 10 cached posts)</em></p>`;
    }

}

window.addEventListener('online', loadContent);
window.addEventListener('offline', loadContent);

// Initial load
loadContent();
