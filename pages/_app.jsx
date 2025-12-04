// Fichier: pages/_app.jsx
import '../styles/globals.css' // ✅ Cette ligne est cruciale

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}