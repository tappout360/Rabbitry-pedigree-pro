-- ==========================================
-- Schema definition for RabbitryPedigree Pro
-- Target Engines: SQLite (local offline) & PostgreSQL (cloud sync)
-- ==========================================

-- Enable UUID extension (PostgreSQL only - SQLite uses text-based UUIDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (GDPR & COPPA compliant)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- UUIDv4 or UUIDv7 string representation
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner', -- 'owner', 'assistant', 'registrar'
    parent_user_id TEXT, -- COPPA linkage for youth profiles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Rabbitries Table
CREATE TABLE rabbitries (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    prefix TEXT, -- E.g., "Grandview's"
    contact_phone TEXT,
    contact_email TEXT,
    logo_url TEXT,
    theme_color TEXT DEFAULT 'forest_green',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. ARBA Breed Standards Table
CREATE TABLE arba_breed_standards (
    id TEXT PRIMARY KEY,
    breed_name TEXT UNIQUE NOT NULL,
    class_type TEXT NOT NULL CHECK (class_type IN ('4-class', '6-class')),
    
    -- Buck Weights (stored in ounces)
    buck_jr_min_oz INTEGER DEFAULT 0,
    buck_jr_max_oz INTEGER DEFAULT 0,
    buck_int_min_oz INTEGER, -- Nullable, only for 6-class
    buck_int_max_oz INTEGER, -- Nullable, only for 6-class
    buck_sr_min_oz INTEGER DEFAULT 0,
    buck_sr_max_oz INTEGER, -- Nullable, some giant breeds have no max
    
    -- Doe Weights (stored in ounces)
    doe_jr_min_oz INTEGER DEFAULT 0,
    doe_jr_max_oz INTEGER DEFAULT 0,
    doe_int_min_oz INTEGER, -- Nullable, only for 6-class
    doe_int_max_oz INTEGER, -- Nullable, only for 6-class
    doe_sr_min_oz INTEGER DEFAULT 0,
    doe_sr_max_oz INTEGER, -- Nullable, some giant breeds have no max
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ARBA Breed Disqualifications Table
CREATE TABLE arba_breed_disqualifications (
    id TEXT PRIMARY KEY,
    breed_id TEXT NOT NULL,
    disqualification_type TEXT NOT NULL, -- 'color', 'pattern', 'eyes', 'structural', 'body_type'
    rule_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(breed_id) REFERENCES arba_breed_standards(id) ON DELETE CASCADE
);

-- 5. Rabbits Table
CREATE TABLE rabbits (
    id TEXT PRIMARY KEY,
    rabbitry_id TEXT NOT NULL,
    tattoo_number TEXT NOT NULL, -- unique within rabbitry
    name TEXT NOT NULL,
    breed_id TEXT NOT NULL,
    variety TEXT NOT NULL,
    sex TEXT NOT NULL CHECK (sex IN ('buck', 'doe')),
    date_of_birth TEXT NOT NULL, -- ISO Date representation: YYYY-MM-DD
    current_weight_oz INTEGER, -- weight stored in ounces
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'sold', 'deceased', 'registered'
    registration_number TEXT,
    grand_champion_number TEXT,
    sire_id TEXT,
    dam_id TEXT,
    hutch_location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rabbitry_id) REFERENCES rabbitries(id) ON DELETE CASCADE,
    FOREIGN KEY(breed_id) REFERENCES arba_breed_standards(id) ON DELETE RESTRICT,
    FOREIGN KEY(sire_id) REFERENCES rabbits(id) ON DELETE SET NULL,
    FOREIGN KEY(dam_id) REFERENCES rabbits(id) ON DELETE SET NULL,
    CONSTRAINT unique_tattoo_per_rabbitry UNIQUE (rabbitry_id, tattoo_number)
);

-- 6. Breeding Events Table
CREATE TABLE breedings (
    id TEXT PRIMARY KEY,
    rabbitry_id TEXT NOT NULL,
    buck_id TEXT NOT NULL,
    doe_id TEXT NOT NULL,
    breed_date TEXT NOT NULL, -- YYYY-MM-DD
    palpate_date TEXT,
    palpate_result BOOLEAN,
    nest_box_date TEXT,
    kindle_date TEXT,
    status TEXT NOT NULL DEFAULT 'bred', -- 'bred', 'palpated_positive', 'palpated_negative', 'kindled', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rabbitry_id) REFERENCES rabbitries(id) ON DELETE CASCADE,
    FOREIGN KEY(buck_id) REFERENCES rabbits(id) ON DELETE RESTRICT,
    FOREIGN KEY(doe_id) REFERENCES rabbits(id) ON DELETE RESTRICT
);

-- 7. Litters Table
CREATE TABLE litters (
    id TEXT PRIMARY KEY,
    breeding_id TEXT NOT NULL,
    rabbitry_id TEXT NOT NULL,
    kits_born_alive INTEGER DEFAULT 0,
    kits_born_dead INTEGER DEFAULT 0,
    kits_weaned INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(breeding_id) REFERENCES breedings(id) ON DELETE CASCADE,
    FOREIGN KEY(rabbitry_id) REFERENCES rabbitries(id) ON DELETE CASCADE
);

-- 8. Health & Treatments Logs
CREATE TABLE health_logs (
    id TEXT PRIMARY KEY,
    rabbit_id TEXT NOT NULL,
    treatment_date TEXT NOT NULL, -- YYYY-MM-DD
    treatment_type TEXT NOT NULL, -- 'vaccination', 'deworming', 'illness', 'injury'
    description TEXT NOT NULL,
    administered_by TEXT,
    next_due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rabbit_id) REFERENCES rabbits(id) ON DELETE CASCADE
);

-- 9. Ledger Transactions Table
CREATE TABLE ledger_transactions (
    id TEXT PRIMARY KEY,
    rabbitry_id TEXT NOT NULL,
    transaction_date TEXT NOT NULL, -- YYYY-MM-DD
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount REAL NOT NULL,
    category TEXT NOT NULL, -- 'sale', 'feed', 'equipment', 'medical', 'show_fee'
    rabbit_id TEXT, -- Optional link to sale of specific rabbit
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(rabbitry_id) REFERENCES rabbitries(id) ON DELETE CASCADE,
    FOREIGN KEY(rabbit_id) REFERENCES rabbits(id) ON DELETE SET NULL
);

-- 10. Sync Log Queue Table (For Offline-First Synchronization)
CREATE TABLE sync_queue (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    payload TEXT, -- JSON-stringified representation of change
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Performance Indexes
-- ==========================================
CREATE INDEX idx_rabbits_rabbitry_id ON rabbits(rabbitry_id);
CREATE INDEX idx_rabbits_sire_id ON rabbits(sire_id);
CREATE INDEX idx_rabbits_dam_id ON rabbits(dam_id);
CREATE INDEX idx_breedings_doe_id ON breedings(doe_id);
CREATE INDEX idx_health_logs_rabbit_id ON health_logs(rabbit_id);
CREATE INDEX idx_ledger_transactions_rabbitry_id ON ledger_transactions(rabbitry_id);
