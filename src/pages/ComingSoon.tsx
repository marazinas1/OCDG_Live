import CategoryPage from "@/components/CategoryPage";
import type { PublicPropertyCard } from "@/hooks/usePublicProperties";

const ComingSoon = ({ properties }: { properties?: PublicPropertyCard[] | undefined }) => (
  <CategoryPage
    status="coming_soon"
    eyebrow="On the Horizon"
    heading="Coming Soon"
    seoTitle="Coming Soon — Ocean City Development Group"
    seoDescription="Upcoming custom luxury home developments in Ocean City, NJ."
    path="/developments/coming-soon"
    emptyMessage="No upcoming developments yet."
    properties={properties}
  />
);

export default ComingSoon;
