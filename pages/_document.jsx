// Fichier: pages/_document.jsx

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Intégration des polices Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* La ligne Tailwind CDN n'est PAS nécessaire si vous l'avez configuré localement */}
        {/* <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> */}
      </Head>
      {/* Appliquer les classes de style du <body> */}
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}