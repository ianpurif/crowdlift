#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Vec,
};

const INSTANCE_TTL_THRESHOLD: u32 = 120_000;
const INSTANCE_TTL_EXTEND_TO: u32 = 535_000;
const DATA_TTL_THRESHOLD: u32 = 120_000;
const DATA_TTL_EXTEND_TO: u32 = 535_000;
const MAX_PAGE_SIZE: u32 = 50;
const MAX_TITLE_LENGTH: u32 = 80;
const MAX_DESCRIPTION_LENGTH: u32 = 1_200;
const MAX_CATEGORY_LENGTH: u32 = 32;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub id: u64,
    pub creator: Address,
    pub token: Address,
    pub title: String,
    pub description: String,
    pub category: String,
    pub goal: i128,
    pub raised: i128,
    pub active: bool,
    pub created_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    NextId,
    Campaign(u64),
    CreatorCampaigns(Address),
    Contribution(u64, Address),
}

#[contract]
pub struct CampaignRegistry;

#[contractimpl]
impl CampaignRegistry {
    pub fn create_campaign(
        env: Env,
        creator: Address,
        token: Address,
        title: String,
        description: String,
        category: String,
        goal: i128,
    ) -> Campaign {
        creator.require_auth();
        validate_campaign(&title, &description, &category, goal);

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        let campaign = Campaign {
            id,
            creator: creator.clone(),
            token,
            title,
            description,
            category,
            goal,
            raised: 0,
            active: true,
            created_ledger: env.ledger().sequence(),
        };

        let campaign_key = DataKey::Campaign(id);
        env.storage().persistent().set(&campaign_key, &campaign);
        extend_persistent(&env, &campaign_key);

        let creator_key = DataKey::CreatorCampaigns(creator.clone());
        let mut ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&creator_key)
            .unwrap_or(Vec::new(&env));
        ids.push_back(id);
        env.storage().persistent().set(&creator_key, &ids);
        extend_persistent(&env, &creator_key);

        env.storage().instance().set(&DataKey::NextId, &(id + 1));
        extend_instance(&env);
        env.events()
            .publish((symbol_short!("created"), creator, id), campaign.clone());
        campaign
    }

    pub fn update_campaign(
        env: Env,
        creator: Address,
        id: u64,
        title: String,
        description: String,
        category: String,
        goal: i128,
    ) -> Campaign {
        creator.require_auth();
        validate_campaign(&title, &description, &category, goal);

        let key = DataKey::Campaign(id);
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&key)
            .expect("campaign not found");
        assert!(campaign.creator == creator, "creator only");
        assert!(goal >= campaign.raised, "goal below amount raised");

        campaign.title = title;
        campaign.description = description;
        campaign.category = category;
        campaign.goal = goal;
        env.storage().persistent().set(&key, &campaign);
        extend_persistent(&env, &key);
        extend_instance(&env);
        env.events()
            .publish((symbol_short!("updated"), creator, id), campaign.clone());
        campaign
    }

    pub fn set_active(env: Env, creator: Address, id: u64, active: bool) -> Campaign {
        creator.require_auth();
        let key = DataKey::Campaign(id);
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&key)
            .expect("campaign not found");
        assert!(campaign.creator == creator, "creator only");
        campaign.active = active;
        env.storage().persistent().set(&key, &campaign);
        extend_persistent(&env, &key);
        extend_instance(&env);
        env.events()
            .publish((symbol_short!("status"), creator, id), active);
        campaign
    }

    pub fn contribute(env: Env, donor: Address, id: u64, amount: i128) -> Campaign {
        donor.require_auth();
        assert!(amount > 0, "amount must be positive");

        let campaign_key = DataKey::Campaign(id);
        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&campaign_key)
            .expect("campaign not found");
        assert!(campaign.active, "campaign is paused");

        token::Client::new(&env, &campaign.token).transfer(&donor, &campaign.creator, &amount);
        campaign.raised = campaign
            .raised
            .checked_add(amount)
            .expect("raised overflow");
        env.storage().persistent().set(&campaign_key, &campaign);
        extend_persistent(&env, &campaign_key);

        let contribution_key = DataKey::Contribution(id, donor.clone());
        let previous: i128 = env
            .storage()
            .persistent()
            .get(&contribution_key)
            .unwrap_or(0);
        let updated = previous.checked_add(amount).expect("contribution overflow");
        env.storage().persistent().set(&contribution_key, &updated);
        extend_persistent(&env, &contribution_key);
        extend_instance(&env);

        env.events().publish(
            (symbol_short!("funded"), id, donor),
            (amount, campaign.raised),
        );
        campaign
    }

    pub fn get_campaign(env: Env, id: u64) -> Option<Campaign> {
        env.storage().persistent().get(&DataKey::Campaign(id))
    }

    pub fn list_campaigns(env: Env, offset: u64, limit: u32) -> Vec<Campaign> {
        let mut campaigns = Vec::new(&env);
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        let mut id = if offset < 1 { 1 } else { offset };
        let page_size = if limit > MAX_PAGE_SIZE {
            MAX_PAGE_SIZE
        } else {
            limit
        };
        while id < next_id && campaigns.len() < page_size {
            if let Some(campaign) = env.storage().persistent().get(&DataKey::Campaign(id)) {
                campaigns.push_back(campaign);
            }
            id += 1;
        }
        campaigns
    }

    pub fn get_campaign_count(env: Env) -> u64 {
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        next_id - 1
    }

    pub fn get_creator_campaigns(env: Env, creator: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::CreatorCampaigns(creator))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_contribution(env: Env, id: u64, donor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(id, donor))
            .unwrap_or(0)
    }
}

fn validate_campaign(title: &String, description: &String, category: &String, goal: i128) {
    assert!(goal > 0, "goal must be positive");
    assert!(
        title.len() > 0 && title.len() <= MAX_TITLE_LENGTH,
        "invalid title"
    );
    assert!(
        description.len() > 0 && description.len() <= MAX_DESCRIPTION_LENGTH,
        "invalid description"
    );
    assert!(
        category.len() > 0 && category.len() <= MAX_CATEGORY_LENGTH,
        "invalid category"
    );
}

fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND_TO);
}

fn extend_persistent(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, DATA_TTL_THRESHOLD, DATA_TTL_EXTEND_TO);
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn creates_updates_and_indexes_campaigns() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CampaignRegistry, ());
        let client = CampaignRegistryClient::new(&env, &contract_id);
        let creator = Address::generate(&env);
        let token = Address::generate(&env);

        let created = client.create_campaign(
            &creator,
            &token,
            &String::from_str(&env, "Neighborhood library"),
            &String::from_str(&env, "A shared reading space for the community."),
            &String::from_str(&env, "Community"),
            &1_000_000_000,
        );

        assert_eq!(created.id, 1);
        assert_eq!(created.creator, creator);
        assert!(created.active);
        assert_eq!(client.get_campaign_count(), 1);
        assert_eq!(
            client.get_creator_campaigns(&creator),
            Vec::from_array(&env, [1])
        );
        assert_eq!(client.list_campaigns(&1, &10).len(), 1);

        let updated = client.update_campaign(
            &creator,
            &1,
            &String::from_str(&env, "Neighborhood learning library"),
            &String::from_str(&env, "A shared reading and learning space."),
            &String::from_str(&env, "Education"),
            &1_500_000_000,
        );
        assert_eq!(updated.goal, 1_500_000_000);
        assert_eq!(updated.category, String::from_str(&env, "Education"));
        assert!(!client.set_active(&creator, &1, &false).active);
    }
}
