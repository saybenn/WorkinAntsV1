// /components/profile/ProfileHeader.jsx
import { dt } from "@/lib/format";
import StarRating from "@/components/ui/StarRating";
import Link from "next/link";

export default function ProfileHeader({
  profile, // { id, handle, fullName, avatarUrl, location, createdAt, roleSet }
  provider, // { id, displayName, city, state, country, rating, tier } | null
  skills = [], // [{ tag, verified }]
  metrics = {}, // { avgReview, reviewCount }
  isOwner = false,
  onShare,
  onFavorite,
  isFav = false,
}) {
  const name =
    profile.fullName || provider?.displayName || `@${profile.handle}`;
  const loc =
    profile.location ||
    [provider?.city, provider?.state, provider?.country]
      .filter(Boolean)
      .join(", ");

  return (
    <section className="max-w-3xl mx-auto px-4 py-4 md:py-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--bg-900)] shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xl text-[var(--ink-700)]">
              @
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold truncate">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-700)]">
            {provider ? (
              <span className="px-2 py-0.5 rounded-full border border-[var(--border)]">
                Provider
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full border border-[var(--border)]">
                {profile.roleSet?.[0] ?? "Member"}
              </span>
            )}
            {provider?.tier && (
              <span className="px-2 py-0.5 rounded-full border border-[var(--border)]">
                {provider.tier}
              </span>
            )}
            {loc && (
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span className="truncate">{loc}</span>
              </span>
            )}
            <span>• Member since {dt(profile.createdAt)}</span>
          </div>
          {/* one-liner: category or skills */}
          <div className="mt-1 text-[var(--ink-700)] text-sm truncate">
            {skills.length
              ? `Skills: ${skills
                  .slice(0, 3)
                  .map((s) => s.tag)
                  .join(" · ")}`
              : "Delivering quality solutions"}
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div className="mt-3 flex items-center gap-2">
        {provider && (
          <Link
            href={`/u/${profile.handle}?tab=services`}
            className="px-4 py-2 rounded-xl bg-[var(--green-500)] text-[var(--bg-950)] font-medium"
          >
            Book
          </Link>
        )}
        <button
          onClick={onShare}
          className="px-3 py-2 rounded-xl border border-[var(--border)]"
        >
          Share Profile
        </button>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <StarRating value={metrics.avgReview || provider?.rating || 0} />
            <span className="text-[var(--ink-700)]">
              {(metrics.avgReview || provider?.rating || 0).toFixed(1)}
              {metrics.reviewCount ? ` (${metrics.reviewCount})` : ""}
            </span>
          </div>
          <button
            onClick={onFavorite}
            aria-pressed={isFav}
            className={
              "px-2 py-2 rounded-lg border " +
              (isFav ? "bg-white/10" : "border-[var(--border)]")
            }
            title={isFav ? "Unfavorite" : "Favorite"}
          >
            ☆
          </button>
        </div>
      </div>
    </section>
  );
}
