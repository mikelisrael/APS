import CommunityDetailClient from "./components/community-detail-client";

interface CommunityDetailPageProps {
  params: {
    id: string;
  };
}

const CommunityDetailPage = ({ params }: CommunityDetailPageProps) => {
  return <CommunityDetailClient communityId={params.id} />;
};

export default CommunityDetailPage;
