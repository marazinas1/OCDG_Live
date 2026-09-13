import CategoryPage from "@/components/CategoryPage";
import type { PublicPropertyCard } from "@/hooks/usePublicProperties";

const UnderContract = ({ properties }: { properties?: PublicPropertyCard[] }) => (
  <CategoryPage
    status="under_contract"
    eyebrow="Reserved Residences"
    heading="Under Contract"
    seoTitle="Under Contract — Ocean City Development Group"
    seoDescription="Ocean City luxury homes currently under contract by OCDG."
    path="/developments/under-contract"
    emptyMessage="No properties are currently under contract."
    properties={properties}
  />
);

export default UnderContract;
