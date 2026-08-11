import ManageCampaignClient from "@/components/ManageCampaignClient";

export default async function ManageCampaignPage({ params }: PageProps<"/dashboard/campaigns/[id]">) {
  const { id } = await params;
  return <ManageCampaignClient id={Number(id)} />;
}
