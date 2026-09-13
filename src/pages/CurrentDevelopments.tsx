import CategoryPage from "@/components/CategoryPage";
import type { PublicPropertyCard } from "@/hooks/usePublicProperties";

const CurrentDevelopments = ({ properties }: { properties?: PublicPropertyCard[] }) => (
  <CategoryPage
    status={["active", "under_contract"]}
    eyebrow="Our Portfolio"
    heading="Current Developments"
    seoTitle="Current Developments — Ocean City Custom Homes"
    seoDescription="Active and under-contract luxury custom homes by Ocean City Development Group."
    path="/developments/current"
    emptyMessage="No current developments at this time."
    properties={properties}
  />
);

export default CurrentDevelopments;
