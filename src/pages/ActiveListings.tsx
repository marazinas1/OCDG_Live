import CategoryPage from "@/components/CategoryPage";
import type { PublicPropertyCard } from "@/hooks/usePublicProperties";

const ActiveListings = ({ properties }: { properties?: PublicPropertyCard[] }) => (
  <CategoryPage
    status="active"
    eyebrow="Our Portfolio"
    heading="Active Listings"
    seoTitle="Active Listings — Ocean City Luxury Homes"
    seoDescription="Custom luxury homes currently for sale in Ocean City, NJ by OCDG."
    path="/developments/active-listings"
    emptyMessage="No active listings at this time."
    properties={properties}
  />
);

export default ActiveListings;
