#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env, log};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Goal,
    TotalRaised,
    Token,
    Donor(Address),
}

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    /// Initialize the campaign with an admin, a fundraising goal (in stroops), and native token address.
    pub fn initialize(env: Env, admin: Address, goal: i128, token: Address) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        assert!(goal > 0, "goal must be positive");

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Goal, &goal);
        env.storage().instance().set(&DataKey::TotalRaised, &0i128);
        env.storage().instance().set(&DataKey::Token, &token);

        log!(&env, "Campaign initialized with goal: {}", goal);
    }

    /// Donate XLM to the campaign. Amount is in stroops (1 XLM = 10_000_000 stroops).
    pub fn donate(env: Env, donor: Address, amount: i128) {
        // Require the donor to authorize this call
        donor.require_auth();

        assert!(amount > 0, "amount must be positive");
        assert!(
            env.storage().instance().has(&DataKey::Admin),
            "not initialized"
        );

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();

        // Perform token transfer from donor to admin (campaign creator)
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&donor, &admin, &amount);

        // Update total raised
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRaised)
            .unwrap_or(0);
        let new_total = total + amount;
        env.storage().instance().set(&DataKey::TotalRaised, &new_total);

        // Update donor's contribution
        let key = DataKey::Donor(donor.clone());
        let prev: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(prev + amount));

        // Emit donation event
        env.events().publish(
            (symbol_short!("donate"),),
            (donor, amount, new_total),
        );

        log!(&env, "Donation received: {}, total: {}", amount, new_total);
    }

    /// Read the campaign goal.
    pub fn get_goal(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Goal)
            .unwrap_or(0)
    }

    /// Read the total amount raised.
    pub fn get_total_raised(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRaised)
            .unwrap_or(0)
    }

    /// Read a donor's total contribution.
    pub fn get_contribution(env: Env, donor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Donor(donor))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register(CrowdfundContract, ());
        let client = CrowdfundContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let token = Address::generate(&env);

        client.initialize(&admin, &1_000_000_000i128, &token);

        assert_eq!(client.get_goal(), 1_000_000_000i128);
        assert_eq!(client.get_total_raised(), 0i128);
    }
}
