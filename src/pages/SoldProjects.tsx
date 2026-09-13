import CategoryPage from "@/components/CategoryPage";
import PastDevelopmentsSection from "@/components/PastDevelopmentsSection";
import type { PublicPropertyCard } from "@/hooks/usePublicProperties";

const SoldProjects = ({
  properties,
  pastDevelopments,
}: {
  properties?: PublicPropertyCard[] | undefined;
  pastDevelopments?: PublicPropertyCard[] | undefined;
}) => (
  <CategoryPage
    status="sold"
    eyebrow="Our Legacy"
    heading="Sold"
    seoTitle="Sold Portfolio — Ocean City Custom Homes"
    seoDescription="Completed and sold luxury custom homes built by Ocean City Development Group."
    path="/developments/sold"
    emptyMessage="No sold homes yet."
    properties={properties}
  >
    <PastDevelopmentsSection items={pastDevelopments} />
  </CategoryPage>
);

export default SoldProjects;
