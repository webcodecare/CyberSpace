import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { CACHE_TAGS, serverGet } from "@/lib/server-api";
import { FadeDown, FadeLeft, FadeRight, FadeUp } from "@/components/Motion";
import CareerApplicationForm from "@/components/CareerApplicationForm";

interface CareerPageData {
  heroTitleAZ: string | null;
  heroTitleEN: string | null;
  heroTitleRU: string | null;
  heroDescAZ: string | null;
  heroDescEN: string | null;
  heroDescRU: string | null;
  heroImageUrl: string | null;
  heroCta1AZ: string | null;
  heroCta1EN: string | null;
  heroCta1RU: string | null;
  heroCta2AZ: string | null;
  heroCta2EN: string | null;
  heroCta2RU: string | null;
  introHeadingAZ: string | null;
  introHeadingEN: string | null;
  introHeadingRU: string | null;
  introBodyAZ: string | null;
  introBodyEN: string | null;
  introBodyRU: string | null;
  introImageUrl: string | null;
  missionAZ: string | null;
  missionEN: string | null;
  missionRU: string | null;
  visionAZ: string | null;
  visionEN: string | null;
  visionRU: string | null;
  cultureHeadingAZ: string | null;
  cultureHeadingEN: string | null;
  cultureHeadingRU: string | null;
  cultureBodyAZ: string | null;
  cultureBodyEN: string | null;
  cultureBodyRU: string | null;
  seoTitleAZ: string | null;
  seoTitleEN: string | null;
  seoTitleRU: string | null;
  seoDescAZ: string | null;
  seoDescEN: string | null;
  seoDescRU: string | null;
  isPublished: boolean;
}

interface CareerBenefit {
  id: number;
  icon: string | null;
  titleAZ: string;
  titleEN: string;
  titleRU: string;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
}
interface CareerExpertise {
  id: number;
  icon: string | null;
  titleAZ: string;
  titleEN: string;
  titleRU: string;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
}
interface CareerGalleryImage {
  id: number;
  imageUrl: string;
  captionAZ: string | null;
  captionEN: string | null;
  captionRU: string | null;
}
interface CareerOpportunity {
  id: number;
  titleAZ: string;
  titleEN: string;
  titleRU: string;
  department: string | null;
  location: string | null;
  typeAZ: string | null;
  typeEN: string | null;
  typeRU: string | null;
  descAZ: string | null;
  descEN: string | null;
  descRU: string | null;
}

const DEFAULTS: Record<
  Locale,
  {
    heroTitle: string;
    heroDesc: string;
    cta1: string;
    cta2: string;
    introHeading: string;
    introBody: string;
    mission: string;
    vision: string;
    cultureHeading: string;
    cultureBody: string;
  }
> = {
  en: {
    heroTitle: "Build Technology. Shape the Future.",
    heroDesc:
      "Join a team of technology enthusiasts helping businesses build smarter, more secure and reliable IT infrastructure.",
    cta1: "Explore Open Positions",
    cta2: "Discover Our Culture",
    introHeading: "More Than a Workplace. A Place to Grow.",
    introBody:
      "Cyberspace is a professional B2B technology solutions provider. We bring enterprise IT infrastructure, networking, security and storage to businesses across Azerbaijan — and we grow that expertise through the people who deliver it.",
    mission:
      "To deliver reliable, modern IT infrastructure and expert support that helps our clients' businesses run smarter and safer, every day.",
    vision:
      "To be the most trusted technology partner for enterprise clients in the region, known for expertise, integrity and long-term relationships.",
    cultureHeading: "Life at Cyberspace",
    cultureBody:
      "A collaborative, technology-driven team where certified engineers, sales specialists and support staff work closely together on real enterprise projects.",
  },
  az: {
    heroTitle: "Texnologiya Qur. Gələcəyi Formalaşdır.",
    heroDesc:
      "Bizneslərə daha ağıllı, təhlükəsiz və etibarlı İT infrastrukturu qurmağa kömək edən texnologiya həvəskarları komandasına qoşulun.",
    cta1: "Açıq Vakansiyalara Bax",
    cta2: "Mədəniyyətimizi Kəşf Edin",
    introHeading: "Sadəcə İş Yeri Deyil. İnkişaf Yeri.",
    introBody:
      "Cyberspace peşəkar B2B texnologiya həlləri təchizatçısıdır. Biz Azərbaycan üzrə bizneslərə korporativ İT infrastrukturu, şəbəkə, təhlükəsizlik və yaddaş həlləri çatdırırıq — və bu ekspertizayı onu çatdıran insanlar vasitəsilə inkişaf etdiririk.",
    mission:
      "Müştərilərimizin biznesinin hər gün daha ağıllı və təhlükəsiz işləməsinə kömək edən etibarlı, müasir İT infrastrukturu və ekspert dəstəyi təqdim etmək.",
    vision:
      "Regionda korporativ müştərilər üçün ekspertizası, dürüstlüyü və uzunmüddətli münasibətləri ilə tanınan ən etibarlı texnologiya tərəfdaşı olmaq.",
    cultureHeading: "Cyberspace-də Həyat",
    cultureBody:
      "Sertifikatlı mühəndislərin, satış mütəxəssislərinin və dəstək komandasının real korporativ layihələr üzərində birgə işlədiyi əməkdaşlıq yönümlü, texnologiya əsaslı komanda.",
  },
  ru: {
    heroTitle: "Создавай технологии. Формируй будущее.",
    heroDesc:
      "Присоединяйтесь к команде энтузиастов технологий, которые помогают бизнесу строить более умную, безопасную и надёжную IT-инфраструктуру.",
    cta1: "Смотреть вакансии",
    cta2: "Узнать о нашей культуре",
    introHeading: "Больше, чем работа. Место для роста.",
    introBody:
      "Cyberspace — профессиональный поставщик B2B технологических решений. Мы обеспечиваем бизнес в Азербайджане корпоративной IT-инфраструктурой, сетевыми решениями, безопасностью и хранением данных — и развиваем эту экспертизу через людей, которые её реализуют.",
    mission:
      "Предоставлять надёжную, современную IT-инфраструктуру и экспертную поддержку, которая помогает бизнесу наших клиентов работать умнее и безопаснее каждый день.",
    vision:
      "Стать самым надёжным технологическим партнёром для корпоративных клиентов в регионе, известным своей экспертизой, честностью и долгосрочными отношениями.",
    cultureHeading: "Жизнь в Cyberspace",
    cultureBody:
      "Сплочённая, технологически ориентированная команда, где сертифицированные инженеры, специалисты по продажам и поддержке работают вместе над реальными корпоративными проектами.",
  },
};

const fetchCareerPage = () =>
  serverGet<CareerPageData | null>("/career/page", null, [CACHE_TAGS.career]);
const fetchActiveBenefits = () =>
  serverGet<CareerBenefit[]>("/career/benefits/active", [], [CACHE_TAGS.career]);
const fetchActiveExpertise = () =>
  serverGet<CareerExpertise[]>("/career/expertise/active", [], [CACHE_TAGS.career]);
const fetchActiveGallery = () =>
  serverGet<CareerGalleryImage[]>("/career/gallery/active", [], [CACHE_TAGS.career]);
const fetchActiveOpportunities = () =>
  serverGet<CareerOpportunity[]>("/career/opportunities/active", [], [CACHE_TAGS.career]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  const page = await fetchCareerPage();
  const L = lang.toUpperCase() as "AZ" | "EN" | "RU";
  const title = (page?.[`seoTitle${L}` as keyof CareerPageData] as string | null) ?? t.nav.careers;
  const desc =
    (page?.[`seoDesc${L}` as keyof CareerPageData] as string | null) ?? DEFAULTS[lang].heroDesc;
  return pageMeta(lang, "/careers", `Cyberspace — ${title}`, desc);
}

export default async function CareersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const c = t.careers;
  const L = lang as Locale;
  const U = lang.toUpperCase() as "AZ" | "EN" | "RU";
  const d = DEFAULTS[L];

  const [page, benefits, expertise, gallery, opportunities] = await Promise.all([
    fetchCareerPage(),
    fetchActiveBenefits(),
    fetchActiveExpertise(),
    fetchActiveGallery(),
    fetchActiveOpportunities(),
  ]);

  if (page && page.isPublished === false) notFound();

  const pick = (base: Partial<Record<string, string | null>>, key: string, fallback: string) =>
    base[`${key}${U}`] ?? fallback;

  const pageAny = (page ?? {}) as unknown as Record<string, string | null>;

  const heroTitle = pick(pageAny, "heroTitle", d.heroTitle);
  const heroDesc = pick(pageAny, "heroDesc", d.heroDesc);
  const heroCta1 = pick(pageAny, "heroCta1", d.cta1);
  const heroCta2 = pick(pageAny, "heroCta2", d.cta2);
  const introHeading = pick(pageAny, "introHeading", d.introHeading);
  const introBody = pick(pageAny, "introBody", d.introBody);
  const mission = pick(pageAny, "mission", d.mission);
  const vision = pick(pageAny, "vision", d.vision);
  const cultureHeading = pick(pageAny, "cultureHeading", d.cultureHeading);
  const cultureBody = pick(pageAny, "cultureBody", d.cultureBody);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <FadeDown>
              <p className="eyebrow">{t.nav.careers.toUpperCase()}</p>
            </FadeDown>
            <FadeDown delay={0.06}>
              <h1>{heroTitle}</h1>
            </FadeDown>
            <FadeUp delay={0.12}>
              <p className="hero__text">{heroDesc}</p>
            </FadeUp>
            <FadeUp delay={0.2} className="hero__cta">
              <a href="#opportunities" className="btn btn--primary btn--lg">
                {heroCta1}
              </a>
              <a href="#culture" className="btn btn--outline btn--lg">
                {heroCta2}
              </a>
            </FadeUp>
          </div>
          {page?.heroImageUrl && (
            <FadeLeft delay={0.1}>
              <div className="hero__art-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.heroImageUrl}
                  alt=""
                  className="hero__art"
                  style={{ borderRadius: "var(--radius-xl)" }}
                />
              </div>
            </FadeLeft>
          )}
        </div>
      </section>

      {/* ── About / Mission / Vision ── */}
      <section className="container section">
        <FadeUp className="info-section-head">
          <p className="eyebrow cats-eyebrow">{c.aboutEyebrow}</p>
          <h2>{introHeading}</h2>
        </FadeUp>
        <div className="career-split">
          <FadeRight>
            <div className="career-split__media">
              {page?.introImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={page.introImageUrl} alt="" />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, var(--blue-soft), var(--surface-2))",
                  }}
                />
              )}
            </div>
          </FadeRight>
          <FadeLeft delay={0.08}>
            <p className="prose">{introBody}</p>
          </FadeLeft>
        </div>
        <div className="career-mv-grid">
          <FadeUp className="career-mv-card">
            <h3>{c.missionLabel}</h3>
            <p>{mission}</p>
          </FadeUp>
          <FadeUp delay={0.06} className="career-mv-card">
            <h3>{c.visionLabel}</h3>
            <p>{vision}</p>
          </FadeUp>
        </div>
      </section>

      {/* ── Benefits ── */}
      {benefits.length > 0 && (
        <section className="info-alt-section">
          <div className="container">
            <FadeUp className="info-section-head">
              <p className="eyebrow cats-eyebrow">{c.benefitsEyebrow}</p>
              <h2>{c.benefitsTitle}</h2>
            </FadeUp>
            <div className="icard-grid">
              {benefits.map((b, i) => (
                <FadeUp key={b.id} delay={(i % 4) * 0.06} className="icard">
                  {b.icon && <div className="icard__emoji">{b.icon}</div>}
                  <h3 className="icard__title">
                    {pick(b as unknown as Record<string, string | null>, "title", "")}
                  </h3>
                  <p className="icard__desc">
                    {pick(b as unknown as Record<string, string | null>, "desc", "")}
                  </p>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Expertise ── */}
      {expertise.length > 0 && (
        <section className="container section">
          <FadeUp className="info-section-head">
            <p className="eyebrow cats-eyebrow">{c.expertiseEyebrow}</p>
            <h2>{c.expertiseTitle}</h2>
          </FadeUp>
          <div className="icard-grid">
            {expertise.map((e, i) => (
              <FadeUp key={e.id} delay={(i % 4) * 0.06} className="icard">
                {e.icon && <div className="icard__emoji">{e.icon}</div>}
                <h3 className="icard__title">
                  {pick(e as unknown as Record<string, string | null>, "title", "")}
                </h3>
                <p className="icard__desc">
                  {pick(e as unknown as Record<string, string | null>, "desc", "")}
                </p>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ── Life / Culture / Gallery ── */}
      <section id="culture" className="info-alt-section">
        <div className="container">
          <FadeUp className="info-section-head">
            <p className="eyebrow cats-eyebrow">{c.galleryEyebrow}</p>
            <h2>{cultureHeading}</h2>
            <p className="info-lead">{cultureBody}</p>
          </FadeUp>
          {gallery.length > 0 && (
            <div className="career-gallery">
              {gallery.map((g, i) => {
                const caption = pick(g as unknown as Record<string, string | null>, "caption", "");
                return (
                  <FadeUp key={g.id} delay={(i % 6) * 0.05} className="career-gallery__item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.imageUrl} alt={caption || ""} loading="lazy" />
                    {caption && <span className="career-gallery__caption">{caption}</span>}
                  </FadeUp>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Opportunities ── */}
      <section id="opportunities" className="container section">
        <FadeUp className="info-section-head">
          <p className="eyebrow cats-eyebrow">{c.opportunitiesEyebrow}</p>
          <h2>{c.opportunitiesTitle}</h2>
        </FadeUp>
        {opportunities.length === 0 ? (
          <p className="muted">{c.noOpportunities}</p>
        ) : (
          <div className="job-list">
            {opportunities.map((o, i) => {
              const title = pick(o as unknown as Record<string, string | null>, "title", "");
              const type = pick(o as unknown as Record<string, string | null>, "type", "");
              const desc = pick(o as unknown as Record<string, string | null>, "desc", "");
              const meta = [o.department, o.location, type].filter(Boolean).join(" · ");
              return (
                <FadeUp key={o.id} delay={i * 0.06} className="job-card">
                  <div className="job-card__head">
                    <div>
                      <h3 className="job-card__title">{title}</h3>
                      {meta && <p className="job-card__meta">{meta}</p>}
                    </div>
                    <Link
                      href={`/${lang}/careers?position=${encodeURIComponent(title)}#apply`}
                      className="btn btn--primary"
                    >
                      {c.applyNow}
                    </Link>
                  </div>
                  {desc && <p className="job-card__desc">{desc}</p>}
                </FadeUp>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Application Form ── */}
      <section id="apply" className="container section">
        <FadeUp className="info-section-head">
          <p className="eyebrow cats-eyebrow">{c.applyEyebrow}</p>
          <h2>{c.applyTitle}</h2>
          <p className="info-lead">{c.applySubtitle}</p>
        </FadeUp>
        <CareerApplicationForm t={t} />
      </section>
    </>
  );
}
