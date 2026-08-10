import { useEffect } from 'react';

const SEO = ({ activeTab, activeServicePage, service }) => {
  useEffect(() => {
    let title = 'Painter in Lucknow | House Painter Lucknow | Wall Painting Services - Munnalal Painter';
    let description = 'Top-rated Painter in Lucknow offering professional House Painter Lucknow, Wall Painting Services Lucknow, Interior Painter Lucknow & Exterior Painting Lucknow. Call +91 76684 15684 for free estimate!';
    let canonical = 'https://munnalalpainter.in/';

    if (activeServicePage && service) {
      const serviceName = service.title || 'Painting Service';
      const cleanSlug = service.slug || serviceName.toLowerCase().replace(/\s+/g, '-');
      canonical = `https://munnalalpainter.in/#/service/${cleanSlug}`;

      if (cleanSlug.includes('interior')) {
        title = `Interior Painter Lucknow | Wall Painting Services Lucknow - Munnalal Painter`;
        description = `Expert Interior Painter Lucknow. Transform your living rooms & bedrooms with smooth, washable Asian & Berger paints, zero-dust sanding, & shade consultation.`;
      } else if (cleanSlug.includes('exterior')) {
        title = `Exterior Painting Lucknow | Best House Painter Lucknow - Munnalal Painter`;
        description = `Weather-proof Exterior Painting Lucknow. 10-year UV & fungal protection for your home exterior. Get instant quote from top House Painter in Lucknow.`;
      } else if (cleanSlug.includes('house')) {
        title = `House Painter Lucknow | Full Home Wall Painting Services Lucknow`;
        description = `Reliable House Painter Lucknow for 1BHK, 2BHK, 3BHK flats & villas. 100% dust-free machine sanding & transparent sq.ft rates by Munnalal Painter.`;
      } else if (cleanSlug.includes('texture')) {
        title = `Texture Painter in Lucknow | Royale Play Wall Painting Services Lucknow`;
        description = `Luxury Texture Wall Painting Services Lucknow. Metallic, stencil, 3D accents & velvet finishes by skilled Painters in Lucknow.`;
      } else if (cleanSlug.includes('putty')) {
        title = `Wall Putty & Primer Work Lucknow | House Painter Lucknow Base Prep`;
        description = `Mirror-smooth double coat white cement wall putty application in Lucknow with machine sanding for long-lasting paint finish.`;
      } else if (cleanSlug.includes('waterproofing')) {
        title = `Waterproofing Services Lucknow | Roof & Damp Wall Protection`;
        description = `Advanced damp-proof waterproofing treatments in Lucknow. Stop leakage & paint peeling with elastomeric membrane coatings.`;
      } else {
        title = `${serviceName} in Lucknow | Professional Painter in Lucknow - Munnalal Painter`;
        description = `Get top-quality ${serviceName} in Lucknow by Munnalal Painter. Transparent per sq.ft rates, dust-free machine sanding & certified materials.`;
      }
    } else if (activeTab && activeTab !== 'home') {
      const capitalizedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      canonical = `https://painterlko-beige.vercel.app/#${activeTab}`;
      
      switch (activeTab) {
        case 'about':
          title = `About Us - Top House Painter in Lucknow | Munnalal Painter`;
          description = `Learn about Munnalal Painter - 10+ years experienced Painter in Lucknow serving Gomti Nagar, Hazratganj, Alambagh, and Indira Nagar.`;
          break;
        case 'services':
          title = `Wall Painting Services Lucknow | Interior & Exterior Painter Lucknow`;
          description = `Explore comprehensive Wall Painting Services Lucknow: House Painter, Interior Painting, Exterior Painting, Texture, Putty, & Waterproofing.`;
          break;
        case 'gallery':
          title = `Painting Work Gallery Lucknow | House Painter Lucknow Portfolio`;
          description = `View real before & after photo and video transformations of homes painted by expert Painters in Lucknow.`;
          break;
        case 'pricing':
          title = `House Painter Lucknow Rate & Cost Calculator | Wall Painting Charges`;
          description = `Calculate estimated per sq.ft costs for House Painting, Interior, Exterior, and Texture painting in Lucknow instantly.`;
          break;
        case 'contact':
          title = `Contact Painter in Lucknow | Book Free Site Visit - Munnalal Painter`;
          description = `Contact Munnalal Painter for free site inspection and wall painting quotes in Lucknow. Call +91 76684 15684.`;
          break;
        default:
          title = `${capitalizedTab} | Painter in Lucknow - Munnalal Painter`;
      }
    }

    // Update Document Title
    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Update OG Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonical);

    // Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    }
  }, [activeTab, activeServicePage, service]);

  return null;
};

export default SEO;
