-- ========================================================
-- RabbitryPedigree Pro - Secure Cloud Sync Schema & Seed Data
-- Database Engine: PostgreSQL or SQLCipher/SQLite
-- Security Policy: Defense-in-depth, encrypted fields at-rest
-- HIPAA Disclaimer: Storing human medical data is strictly prohibited.
-- ========================================================

-- 1. Breeders & Users Profile Table
CREATE TABLE IF NOT EXISTS breeders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    rabbitry_name VARCHAR(100) DEFAULT 'Grandview Rabbitry',
    role VARCHAR(20) DEFAULT 'owner', -- 'owner', 'assistant', 'registrar', 'youth'
    password VARCHAR(255) NOT NULL,
    logo VARCHAR(10) DEFAULT '🐇',
    theme VARCHAR(20) DEFAULT 'dark',
    is_youth BOOLEAN DEFAULT FALSE,
    parent_name VARCHAR(100),
    parent_email VARCHAR(100),
    parental_consent_verified BOOLEAN DEFAULT FALSE,
    agree_hipaa BOOLEAN DEFAULT FALSE,
    account_number VARCHAR(20) UNIQUE
);

-- 2. Rabbits Inventory Table
CREATE TABLE IF NOT EXISTS rabbits (
    id VARCHAR(50) PRIMARY KEY,
    breeder_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    tattoo_number VARCHAR(30) NOT NULL,
    breed VARCHAR(50) NOT NULL,
    variety VARCHAR(50) NOT NULL,
    sex VARCHAR(10) NOT NULL, -- 'buck' or 'doe'
    dob VARCHAR(255) NOT NULL, -- AES ENCRYPTED AT REST (stores birthdate)
    weight_oz INTEGER DEFAULT 0,
    sire_id VARCHAR(50),
    dam_id VARCHAR(50),
    location VARCHAR(50), -- Cage mapping coordinates e.g. 'A-1-2'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'pedigree_only'
    notes TEXT, -- AES ENCRYPTED AT REST (stores veterinary details)
    registration_number VARCHAR(50),
    gc_number VARCHAR(50),
    inbreeding_coeff NUMERIC(5,4) DEFAULT 0.0000,
    color_carrier TEXT,
    winnings_bob INTEGER DEFAULT 0,
    winnings_bov INTEGER DEFAULT 0,
    winnings_bos INTEGER DEFAULT 0,
    winnings_bosv INTEGER DEFAULT 0,
    winnings_bis INTEGER DEFAULT 0,
    winnings_other INTEGER DEFAULT 0,
    show_class VARCHAR(20) DEFAULT 'Auto',
    FOREIGN KEY (breeder_id) REFERENCES breeders(id)
);

-- 3. Medical & Veterinary Records Table
CREATE TABLE IF NOT EXISTS medical (
    id VARCHAR(50) PRIMARY KEY,
    breeder_id VARCHAR(50) NOT NULL,
    rabbit_id VARCHAR(50) NOT NULL,
    date VARCHAR(20) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'Vaccination', 'Deworming', 'Illness', 'Checkup'
    treatment VARCHAR(255) NOT NULL, -- AES ENCRYPTED AT REST
    notes TEXT, -- AES ENCRYPTED AT REST
    cost NUMERIC(10,2) DEFAULT 0.00,
    fda_withdrawal_days INTEGER DEFAULT 0,
    fda_approval_status VARCHAR(100) DEFAULT 'Approved',
    FOREIGN KEY (breeder_id) REFERENCES breeders(id),
    FOREIGN KEY (rabbit_id) REFERENCES rabbits(id) ON DELETE CASCADE
);

-- 4. Financial Ledger Table
CREATE TABLE IF NOT EXISTS ledger (
    id VARCHAR(50) PRIMARY KEY,
    breeder_id VARCHAR(50) NOT NULL,
    date VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
    amount VARCHAR(255) NOT NULL, -- AES ENCRYPTED AT REST
    category VARCHAR(50) NOT NULL, -- 'sale', 'feed', 'medical', 'equipment', 'show'
    rabbit_id VARCHAR(50),
    notes TEXT, -- AES ENCRYPTED AT REST
    FOREIGN KEY (breeder_id) REFERENCES breeders(id)
);

-- 5. Digital Signatures & Ownership Transfer Log
CREATE TABLE IF NOT EXISTS transfers (
    id VARCHAR(50) PRIMARY KEY,
    breeder_id VARCHAR(50) NOT NULL,
    rabbit_id VARCHAR(50) NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    buyer_email VARCHAR(100),
    price NUMERIC(10,2) DEFAULT 0.00,
    date VARCHAR(20) NOT NULL,
    certificate_id VARCHAR(50) UNIQUE,
    hash VARCHAR(64) UNIQUE,
    FOREIGN KEY (breeder_id) REFERENCES breeders(id)
);

-- 6. Immutable Security Audit Logging Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    target_table VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    checksum VARCHAR(64) NOT NULL
);

-- Indices for rapid query performance & role boundaries
CREATE INDEX idx_rabbits_breeder ON rabbits(breeder_id);
CREATE INDEX idx_ledger_breeder ON ledger(breeder_id);
CREATE INDEX idx_medical_rabbit ON medical(rabbit_id);

-- ========================================================
-- REALISTIC SEED DATA (REPRESENTING MOBILE BARN ENVIRONMENT)
-- Includes encrypted fields mocks, 3-gen pedigree tree, youth age division.
-- ========================================================

-- Seed Breeder (Primary Admin Owner)
INSERT INTO breeders (id, name, email, username, phone, rabbitry_name, role, password, logo, theme, agree_hipaa, account_number)
VALUES (
    'ab-owner-1', 
    'Jason Miller', 
    'jason.miller@rabbitrypro.com', 
    'jasonm', 
    '555-0199', 
    'Sterling Pedigrees', 
    'owner', 
    'pbkdf2_sha256_mock_hash_jason', 
    '🌾', 
    'cyber', 
    1, 
    'RAB-7721'
);

-- Seed Youth Breeder (Requires Parental Consent check)
INSERT INTO breeders (id, name, email, username, phone, rabbitry_name, role, password, logo, theme, is_youth, parent_name, parent_email, parental_consent_verified, agree_hipaa, account_number)
VALUES (
    'ab-youth-2', 
    'Tommy Miller', 
    'tommy.miller@rabbitrypro.com', 
    'tommym', 
    '555-0144', 
    'Tommy Junior Lops', 
    'youth', 
    'pbkdf2_sha256_mock_hash_tommy', 
    '🥕', 
    'forest', 
    1, 
    'Jason Miller', 
    'jason.miller@rabbitrypro.com', 
    0, -- Parental Consent pending block
    1, 
    'RAB-9912'
);

-- Seed 3-Generation Pedigree Rabbits (Paternal & Paternal Lineage)
-- Note: 'dob' and 'notes' values are stored as encrypted ciphers.
-- E.g. 'U2FsdGVkX19xUytwZk...=' represents AES-256 encrypted texts.

-- Great Grand-Sire (Paternal Side - Gen 3)
INSERT INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, weight_oz, sire_id, dam_id, location, status, notes)
VALUES (
    'r-gen3-sire-1', 
    'ab-owner-1', 
    'Blue Thunder III', 
    'BT-03', 
    'Holland Lop', 
    'Blue', 
    'buck', 
    'U2FsdGVkX187c3E2MWRzMDQ= (Decrypted: 2021-04-12)', 
    62, 
    NULL, 
    NULL, 
    NULL, 
    'pedigree_only', 
    'U2FsdGVkX18zdHVkZW50cz= (Decrypted: Champion Buck)'
);

-- Great Grand-Dam (Paternal Side - Gen 3)
INSERT INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, weight_oz, sire_id, dam_id, location, status, notes)
VALUES (
    'r-gen3-dam-1', 
    'ab-owner-1', 
    'Lilac Mist', 
    'LM-09', 
    'Holland Lop', 
    'Broken Blue', 
    'doe', 
    'U2FsdGVkX183c3E2MWRzMDQ= (Decrypted: 2021-05-18)', 
    60, 
    NULL, 
    NULL, 
    NULL, 
    'pedigree_only', 
    'U2FsdGVkX18zdHVkZW50cz= (Decrypted: Grand Champion line)'
);

-- Grand-Sire (Paternal Side - Gen 2)
INSERT INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, weight_oz, sire_id, dam_id, location, status, notes)
VALUES (
    'r-gen2-sire-1', 
    'ab-owner-1', 
    'Silver Cloud', 
    'SC-40', 
    'Holland Lop', 
    'Blue', 
    'buck', 
    'U2FsdGVkX187c3E2MWRzMDQ= (Decrypted: 2023-01-20)', 
    64, 
    'r-gen3-sire-1', 
    'r-gen3-dam-1', 
    NULL, 
    'pedigree_only', 
    'U2FsdGVkX18zdHVkZW50cz= (Decrypted: Best of Variety winner)'
);

-- Grand-Dam (Paternal Side - Gen 2)
INSERT INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, weight_oz, sire_id, dam_id, location, status, notes)
VALUES (
    'r-gen2-dam-1', 
    'ab-owner-1', 
    'Misty Shadow', 
    'MS-12', 
    'Holland Lop', 
    'Sable Point', 
    'doe', 
    'U2FsdGVkX183c3E2MWRzMDQ= (Decrypted: 2023-02-14)', 
    63, 
    NULL, 
    NULL, 
    NULL, 
    'pedigree_only', 
    'U2FsdGVkX18zdHVkZW50cz= (Decrypted: Excellent maternal health)'
);

-- Sire (Direct Father - Gen 1)
INSERT INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, weight_oz, sire_id, dam_id, location, status, notes)
VALUES (
    'r-sire-parent', 
    'ab-owner-1', 
    'Stormy Shadow', 
    'SS-90', 
    'Holland Lop', 
    'Blue', 
    'buck', 
    'U2FsdGVkX187c3E2MWRzMDQ= (Decrypted: 2024-06-02)', 
    61, 
    'r-gen2-sire-1', 
    'r-gen2-dam-1', 
    'A-1-2', 
    'active', 
    'U2FsdGVkX18zdHVkZW50cz= (Decrypted: High vitality buck, show class winner)'
);

-- Active Junior Doe (Offspring)
INSERT INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, weight_oz, sire_id, dam_id, location, status, notes)
VALUES (
    'r-offspring-doe-1', 
    'ab-owner-1', 
    'Sapphire Gem', 
    'SG-01', 
    'Holland Lop', 
    'Blue', 
    'doe', 
    'U2FsdGVkX187c3E2MWRzMDQ= (Decrypted: 2026-02-10)', 
    38, 
    'r-sire-parent', 
    NULL, -- Maternal side omitted for brevity
    'A-1-1', 
    'active', 
    'U2FsdGVkX18zdHVkZW50cz= (Decrypted: Healthy junior show prospect)'
);

-- Seed Veterinary Medical Entries (Encrypted Treatments & Notes)
INSERT INTO medical (id, breeder_id, rabbit_id, date, type, treatment, notes, cost, fda_withdrawal_days, fda_approval_status)
VALUES (
    'med-01', 
    'ab-owner-1', 
    'r-offspring-doe-1', 
    '2026-05-12', 
    'Vaccination', 
    'U2FsdGVkX182cHVtM3drcg== (Decrypted: RHDV2 Vaccine)', 
    'U2FsdGVkX181d3RmcWlzcw== (Decrypted: Direct vaccine injection in left shoulder. No adverse reactions observed.)', 
    35.00, 
    0, 
    'FDA Approved for Rabbits'
);

-- Seed Financial Ledger Transactions (Encrypted Amount & Notes)
INSERT INTO ledger (id, breeder_id, date, type, amount, category, rabbit_id, notes)
VALUES (
    'lt-seed-01', 
    'ab-owner-1', 
    '2026-06-01', 
    'income', 
    'U2FsdGVkX182NWRzYg== (Decrypted: 150.00)', 
    'sale', 
    'r-gen2-sire-1', 
    'U2FsdGVkX181OWRmZ2g= (Decrypted: Sold breeder Silver Cloud to buyer Tom Jenkins (Cert TX-1002))'
);

-- Seed Audit Logs
INSERT INTO audit_logs (id, action, target_table, record_id, user_id, checksum)
VALUES (
    'audit-seed-01', 
    'INSERT', 
    'rabbits', 
    'r-offspring-doe-1', 
    'ab-owner-1', 
    '1a98db8d1209b552d0fa19a9b736b48a'
);
