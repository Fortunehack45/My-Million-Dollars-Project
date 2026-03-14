import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  path, 
  image,
  type = 'website'
}) => {
  const { pathname } = useLocation();
  
  const siteTitle = 'Argus Protocol | Institutional Compute Infrastructure';
  const fullTitle = title ? `${title} | Argus Protocol` : siteTitle;
  const siteDescription = description || 'Argus Protocol is the premier institutional-grade compute layer for the decentralized web. Deploy zero-touch validator nodes, mine ARG credits securely, and power the next generation multi-chain economy.';
  const siteUrl = 'https://argus-protocol.xyz';
  const canonicalUrl = `${siteUrl}${path || pathname}`;
  
  // Professional OG Image
  const ogImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/image.png`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={siteDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
