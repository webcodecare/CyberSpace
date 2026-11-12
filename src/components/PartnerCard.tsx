export interface PartnerCardData {
  id: number | string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}

export default function PartnerCard({ partner }: { partner: PartnerCardData }) {
  const content = (
    <>
      <div className="partner-card__logo">
        {partner.logoUrl ? (
          <img src={partner.logoUrl} alt={partner.name} loading="lazy" decoding="async" />
        ) : (
          <span className="partner-card__fallback">{partner.name}</span>
        )}
      </div>
      <p className="partner-card__name">{partner.name}</p>
    </>
  );

  if (partner.websiteUrl) {
    return (
      <a
        className="partner-card"
        href={partner.websiteUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={partner.name}
      >
        {content}
      </a>
    );
  }
  return <div className="partner-card">{content}</div>;
}
