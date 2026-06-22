import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/services/profile-service";
import { listCharities } from "@/lib/services/charity-service";
import { CharitySelector } from "@/components/dashboard/charity-selector";
import { MIN_CHARITY_PCT } from "@/lib/config";

export default async function CharityPage() {
  const user = await requireUser();
  const [profile, charities] = await Promise.all([
    getProfile(user.id),
    listCharities(),
  ]);
  return (
    <div className="mx-auto max-w-3xl">
      <CharitySelector
        charities={charities}
        currentCharityId={profile?.charityId ?? null}
        currentPct={profile?.charityPct ?? MIN_CHARITY_PCT}
      />
    </div>
  );
}
