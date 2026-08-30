import type { ArticleSummary } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { ProfileCarousel } from "@/components/ProfileCarousel";
import { SiteHeader } from "@/components/SiteHeader";
import { TypewriterLine } from "@/components/TypewriterLine";

export function BlogHome({ articles }: { articles: ArticleSummary[] }) {
  const latestArticles = articles.slice(0, 3);

  return (
    <>
      <SiteHeader active="home" />

      <main className="curated-home page-frame">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <h1 id="home-title">Hi, I&apos;m <span className="home-script-name">ylt</span><span className="home-wave" aria-hidden="true">👋</span></h1>
            <p className="home-hero-role">Java Backend Engineer</p>
            <p className="home-hero-focus">Working across <TypewriterLine /></p>
            <div className="home-hero-actions">
              <a className="home-primary-link" href="/about">About <span aria-hidden="true">→</span></a>
              <a href="/posts">Blog <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <div className="home-profile" aria-label="ylt 个人标识">
            <span className="home-profile-ring" aria-hidden="true" />
            <div className="home-profile-avatar-frame">
              <ProfileCarousel />
            </div>
          </div>
        </section>

        <section className="home-latest" aria-labelledby="latest-title">
          <header className="home-section-heading">
            <h2 id="latest-title">Latest Updates</h2>
            <a href="/posts">View All <span aria-hidden="true">→</span></a>
          </header>

          {latestArticles.length ? (
            <div className="home-latest-list">
              {latestArticles.map((article) => (
                <ArticleCard article={article} key={article.slug} showImage={false} />
              ))}
            </div>
          ) : (
            <div className="home-latest-empty">New posts will appear here in publishing order.</div>
          )}
        </section>

      </main>
    </>
  );
}
