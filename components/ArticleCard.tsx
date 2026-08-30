/* eslint-disable @next/next/no-img-element -- vinext's next/image shim breaks React hooks during hydration. */
import type { ArticleSummary } from "@/lib/articles";

type ArticleCardProps = {
  article: ArticleSummary;
  headingLevel?: "h2" | "h3";
  showImage?: boolean;
};

export function ArticleCard({ article, headingLevel = "h3", showImage = true }: ArticleCardProps) {
  const Heading = headingLevel;

  return (
    <article className="article-card-row">
      <a
        className={showImage ? "article-card-link" : "article-card-link article-card-link--text"}
        href={`/posts/${article.slug}`}
      >
        {showImage ? (
          <span className="article-card-image" aria-hidden="true">
            {article.coverImage ? <img alt="" loading="lazy" src={article.coverImage} /> : <span />}
          </span>
        ) : null}
        <div className="article-card-copy">
          <div className="article-card-meta">
            <time>{article.updated}</time>
          </div>
          <Heading>{article.title}</Heading>
          <span className="article-card-summary">{article.dek}</span>
          {article.tags.length ? (
            <div className="article-card-tags" aria-label="Topics">
              {article.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
        </div>
      </a>
    </article>
  );
}
