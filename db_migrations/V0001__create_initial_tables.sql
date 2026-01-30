CREATE TABLE IF NOT EXISTS t_p55832570_click_ad_revenue.users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    total_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p55832570_click_ad_revenue.withdrawals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    card_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_p55832570_click_ad_revenue.users(user_id)
);

CREATE TABLE IF NOT EXISTS t_p55832570_click_ad_revenue.clicks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    ad_id VARCHAR(100) NOT NULL,
    reward DECIMAL(10, 2) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_p55832570_click_ad_revenue.users(user_id)
);

CREATE TABLE IF NOT EXISTS t_p55832570_click_ad_revenue.ads (
    id SERIAL PRIMARY KEY,
    ad_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward DECIMAL(10, 2) NOT NULL,
    target_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 30,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_user_id ON t_p55832570_click_ad_revenue.users(user_id);
CREATE INDEX idx_withdrawals_user_id ON t_p55832570_click_ad_revenue.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON t_p55832570_click_ad_revenue.withdrawals(status);
CREATE INDEX idx_clicks_user_id ON t_p55832570_click_ad_revenue.clicks(user_id);
CREATE INDEX idx_ads_active ON t_p55832570_click_ad_revenue.ads(is_active);
