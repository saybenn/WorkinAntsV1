import Head from "next/head";
import React from "react";

export interface MetaInput {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export interface JsonLdOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
}

export interface JsonLdWebsite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
}

export type JsonLd = JsonLdOrganization | JsonLdWebsite;

/** Build simple meta from args or site.meta */
export function getMeta({
  title,
  description,
  url,
  image,
}: MetaInput): MetaInput {
  const meta: MetaInput = {};

  if (title !== undefined) meta.title = title;
  if (description !== undefined) meta.description = description;
  if (url !== undefined) meta.url = url;
  if (image !== undefined) meta.image = image;

  return meta;
}

/** JSON-LD helpers (extend as needed later) */
export function organizationJsonLd({
  name,
  url,
  logo,
}: {
  name: string;
  url: string;
  logo?: string;
}): JsonLdOrganization {
  const org: JsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
  };

  if (logo !== undefined) {
    org.logo = logo;
  }

  return org;
}

export function websiteJsonLd({
  name,
  url,
}: {
  name: string;
  url: string;
}): JsonLdWebsite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
  };
}

/** Drop-in SEO head block */
interface SEOProps {
  meta?: MetaInput;
  jsonLd?: JsonLd[];
}

export const SEO: React.FC<SEOProps> = ({ meta = {}, jsonLd = [] }) => {
  const { title, description, url, image } = meta;
  const serialized = jsonLd.length ? JSON.stringify(jsonLd) : null;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />

      {/* JSON-LD */}
      {serialized && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialized }}
        />
      )}
    </Head>
  );
};
