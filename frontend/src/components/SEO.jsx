import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords }) {
  const defaultTitle = "JobPulse | The Ultimate Internal Recruitment Platform";
  const defaultDescription = "Discover open roles, track your applications, and manage interviews with unprecedented ease on JobPulse.";
  const defaultKeywords = "job portal, recruitment, internal hiring, candidate dashboard, hr platform";

  const seo = {
    title: title ? `${title} | JobPulse` : defaultTitle,
    description: description || defaultDescription,
    keywords: keywords || defaultKeywords,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={seo.title} />
      <meta property="twitter:description" content={seo.description} />
    </Helmet>
  );
}
