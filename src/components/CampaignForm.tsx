"use client";

import type { CampaignDraft } from "@/types";

const categories = ["Community", "Education", "Environment", "Health", "Open source", "Creative", "Emergency", "Other"];

interface CampaignFormProps {
  value: CampaignDraft;
  onChange: (value: CampaignDraft) => void;
  disabled?: boolean;
  idPrefix: string;
}

export default function CampaignForm({ value, onChange, disabled = false, idPrefix }: CampaignFormProps) {
  const update = <K extends keyof CampaignDraft>(key: K, next: CampaignDraft[K]) => onChange({ ...value, [key]: next });
  return (
    <div className="campaign-form-fields">
      <label htmlFor={`${idPrefix}-title`}><span>Campaign title</span><input className="field" id={`${idPrefix}-title`} value={value.title} onChange={(event) => update("title", event.target.value)} maxLength={80} required disabled={disabled} placeholder="A clear, specific title" /><small>{value.title.length}/80</small></label>
      <label htmlFor={`${idPrefix}-category`}><span>Category</span><select className="field" id={`${idPrefix}-category`} value={value.category} onChange={(event) => update("category", event.target.value)} disabled={disabled}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label htmlFor={`${idPrefix}-description`} className="form-span"><span>Campaign story</span><textarea className="field" id={`${idPrefix}-description`} value={value.description} onChange={(event) => update("description", event.target.value)} maxLength={1200} required disabled={disabled} rows={8} placeholder="Explain what you are funding, why it matters, and how support will be used." /><small>{value.description.length}/1200</small></label>
      <label htmlFor={`${idPrefix}-goal`} className="form-span"><span>Funding goal</span><span className="goal-input"><input className="field" id={`${idPrefix}-goal`} type="number" min="0.0000001" step="any" value={value.goalXlm || ""} onChange={(event) => update("goalXlm", Number(event.target.value))} required disabled={disabled} placeholder="0" /><strong>XLM</strong></span><small>The goal can be updated later, but never below the amount already raised.</small></label>
    </div>
  );
}
