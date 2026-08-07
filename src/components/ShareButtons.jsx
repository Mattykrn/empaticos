import React, { useState } from 'react';

/**
 * ShareButtons ofrece compartir una entrada en redes sociales o copiar su enlace.
 */
export default function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title || 'Entrada'} · Comunidad EMpaticos – Apoyo en Esclerosis Múltiple ❤️`;
  const shareUrl = window.location.href.split('#')[0];

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const links = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      className: 'share-whatsapp',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: 'x',
      label: 'X',
      className: 'share-x',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      className: 'share-facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-label">Compartir:</span>
      {links.map((link) => (
        <a
          key={link.key}
          className={`share-link ${link.className}`}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          title={`Compartir en ${link.label}`}
        >
          {link.label}
        </a>
      ))}
      <button type="button" className="share-link share-copy" onClick={handleCopy}>
        {copied ? '✓ Copiado' : 'Copiar enlace'}
      </button>
    </div>
  );
}
