importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.routing.registerRoute(
  new RegExp('.*\.js'),
  new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
  // Cache CSS files.
  /\.css$/,
  // Use cache but update in the background.
  new workbox.strategies.StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: 'css-cache',
);

workbox.routing.registerRoute(
  // Cache image files.
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  // Use the cache if it's available.
  new workbox.strategies.CacheFirst({
    // Use a custom cache name.
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        // Cache only 20 images.
        maxEntries: 20,
        // Cache for a maximum of a week.
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);

workbox.precaching.precacheAndRoute([
  {
    "url": "Assets/fonts/fonts.css",
    "revision": "08304ae04c149904710453ce13a0f528"
  },
  {
    "url": "Assets/fonts/Jost-300-Light.ttf",
    "revision": "d31e2e437e383a1eb550c45207b6c2ef"
  },
  {
    "url": "Assets/fonts/Jost-400-Book.ttf",
    "revision": "49cbd928da11ec96d360be6a691431c6"
  },
  {
    "url": "Assets/fonts/Jost-500-Medium.ttf",
    "revision": "90f3226adcb294f01692bfb3d0e9bb96"
  },
  {
    "url": "Assets/fonts/Jost-600-Semi.ttf",
    "revision": "b638ab720f8ba66039cdb02a21c2f16f"
  },
  {
    "url": "Assets/fonts/Jost-700-Bold.ttf",
    "revision": "48900fc9fb6e9712bcb333419bbe8b62"
  },
  {
    "url": "Assets/images/behance.svg",
    "revision": "ffdbfcc21bb21f0bdea2af3655c065cd"
  },
  {
    "url": "Assets/images/github.svg",
    "revision": "78058cdf0f31cdacee83267e26fc2d23"
  },
  {
    "url": "Assets/images/grid.svg",
    "revision": "e0cbcdc5913a9411311e070ef1d5626d"
  },
  {
    "url": "Assets/images/Group 22.png",
    "revision": "33178f6a83ab32f0f4f0d82c272b629e"
  },
  {
    "url": "Assets/images/Group 22@2x.png",
    "revision": "48cc0dcfd2674978f5bbcc426bb73cf6"
  },
  {
    "url": "Assets/images/Group 24.png",
    "revision": "d1c025517b5fef26f0555e693c7758fd"
  },
  {
    "url": "Assets/images/Group 24@2x.png",
    "revision": "e65bc3ca749be72d87b25c0878bcdc7a"
  },
  {
    "url": "Assets/images/HERO.png",
    "revision": "0539887a617e3a36296abd2d76056e7a"
  },
  {
    "url": "Assets/images/icon-close.png",
    "revision": "c3153497d594e93f174ef564fa12f9c9"
  },
  {
    "url": "Assets/images/icon-close.svg",
    "revision": "bf6f6fc0f993510af242e516254e8ea2"
  },
  {
    "url": "Assets/images/icon-close@2x.png",
    "revision": "804f730048194fa0d8bf9e59c8e0decc"
  },
  {
    "url": "Assets/images/icons8-twitter-104.png",
    "revision": "c6946dec140d5be55aa9f5aff7e3a5e4"
  },
  {
    "url": "Assets/images/icons8-twitter-104@2x.png",
    "revision": "518f5726e1ea6645b3cadb3dee441491"
  },
  {
    "url": "Assets/images/instagram-logo.png",
    "revision": "7eb2b43b894d90b12fe116c51cf510d0"
  },
  {
    "url": "Assets/images/instagram-logo@2x.png",
    "revision": "dc158bf6f0fa54bc63b73e0fcd545bf0"
  },
  {
    "url": "Assets/images/linkedin.svg",
    "revision": "5965bdc99f5d9d916acad2b650b12dc0"
  },
  {
    "url": "Assets/images/logo.png",
    "revision": "98f3ec20e27738d13893470a92d99187"
  },
  {
    "url": "Assets/images/logo@2x.png",
    "revision": "2c82d8b8a54d4bc52281e33e9cb32e39"
  },
  {
    "url": "Assets/images/menu.svg",
    "revision": "dbb6008f0e468cae766a5892b528bb10"
  },
  {
    "url": "Assets/images/opt/img--bg.webp",
    "revision": "c7afee3a41b5a38df7bfcb0cffbcd0cb"
  },
  {
    "url": "Assets/images/ProjPreview.png",
    "revision": "a2ea30f32b3dd8a9b1cf08a9554264e2"
  },
  {
    "url": "Assets/images/ProjPreview@2x.png",
    "revision": "742106e853cacb74cb4b863158834a54"
  },
  {
    "url": "Assets/images/reddit.svg",
    "revision": "ad8d10cef9cf2108486aeda4debf48e7"
  },
  {
    "url": "Assets/images/Scroll Icon.svg",
    "revision": "c553b43e1f0ca27851a09d6c181facbd"
  },
  {
    "url": "Assets/images/SIMOSWSSR.png",
    "revision": "eebfc7187d9836348248dbfcdf097f5e"
  },
  {
    "url": "Assets/images/SIMOSWSSR.svg",
    "revision": "7776f9f1f7fd79b035052bf1fd366779"
  },
  {
    "url": "Assets/images/SIMOSWSSR@2x.png",
    "revision": "95779a1b7c455e42f7c3a5558cc08c20"
  },
  {
    "url": "Assets/images/START.png",
    "revision": "ec8c367fa3af834fd966477666f185f3"
  },
  {
    "url": "Assets/images/Union 3@2x.png",
    "revision": "10cdfd2808d1eea70a7900b1ce3f0731"
  },
  {
    "url": "Assets/images/youtube.svg",
    "revision": "da410bb26486d458eb4d56537644cb81"
  },
  {
    "url": "Assets/scripts/canvas.js",
    "revision": "d8e2f7cba6b5e1157d28449b79d2028b"
  },
  {
    "url": "Assets/scripts/index.js",
    "revision": "5c6b3d8ce926faf961606d935c9bed6b"
  },
  {
    "url": "Assets/styles/main.css",
    "revision": "1951dc0a534c8defe62fae7ea70ca834"
  },
  {
    "url": "index.html",
    "revision": "44a2a0a29d2c76e764596103248ec345"
  },
  {
    "url": "manifest.json",
    "revision": "ba57baaf62ad05bc28e4bb22df3026dd"
  },
  {
    "url": "now.json",
    "revision": "926133ff77162c2a9d4769c1e560c4a5"
  },
  {
    "url": "offline.html",
    "revision": "771d9dcc8ceda1fef645f92d5b1878e8"
  },
  {
    "url": "package.json",
    "revision": "860211cfcd7de0f72da865a9d0e89597"
  },
  {
    "url": "service-worker.js",
    "revision": "8d860342c0354fa70345e54c31f0cea0"
  },
  {
    "url": "workbox-config.js",
    "revision": "f740a266510d2564db8f3c6ff317d0f9"
  }
]);