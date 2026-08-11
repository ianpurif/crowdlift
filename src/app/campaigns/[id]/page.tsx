import CampaignDetailClient from "@/components/CampaignDetailClient";

export default async function CampaignPage({ params }: PageProps<"/campaigns/[id]">) {
  const { id } = await params;
  return <CampaignDetailClient campaignId={id} />;
}
