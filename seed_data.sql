-- ==========================================
-- Seed data for RabbitryPedigree Pro
-- ==========================================

-- Populate ARBA Breed Standards
-- Weight limits stored in ounces (16 oz = 1 lb)
INSERT INTO arba_breed_standards (id, breed_name, class_type, buck_jr_min_oz, buck_jr_max_oz, buck_sr_min_oz, buck_sr_max_oz, doe_jr_min_oz, doe_jr_max_oz, doe_sr_min_oz, doe_sr_max_oz, buck_int_min_oz, buck_int_max_oz, doe_int_min_oz, doe_int_max_oz) VALUES
-- 1. Holland Lop (4-class breed, senior weight limit 4.0 lbs / 64 oz)
('breed-holland-lop', 'Holland Lop', '4-class', 0, 48, 32, 64, 0, 48, 32, 64, NULL, NULL, NULL, NULL),

-- 2. Netherland Dwarf (4-class breed, senior weight limit 2.5 lbs / 40 oz)
('breed-netherland-dwarf', 'Netherland Dwarf', '4-class', 0, 32, 16, 40, 0, 32, 16, 40, NULL, NULL, NULL, NULL),

-- 3. Flemish Giant (6-class breed, seniors: buck 13+ lbs / 208 oz; doe 14+ lbs / 224 oz, no max limit)
('breed-flemish-giant', 'Flemish Giant', '6-class', 0, 160, 208, 9999, 0, 176, 224, 9999, 144, 192, 160, 208),

-- 4. New Zealand (6-class breed, seniors: buck 9-11 lbs / 144-176 oz; doe 10-12 lbs / 160-192 oz)
('breed-new-zealand', 'New Zealand', '6-class', 0, 128, 144, 176, 0, 144, 160, 192, 112, 144, 128, 160);

-- Populate ARBA Breed Disqualifications
INSERT INTO arba_breed_disqualifications (id, breed_id, disqualification_type, rule_description) VALUES
('dq-hl-1', 'breed-holland-lop', 'structural', 'Dewlap is a disqualification in Holland Lops.'),
('dq-hl-2', 'breed-holland-lop', 'eyes', 'Eyes of a color other than brown are a disqualification (except blue-eyed white).'),
('dq-nd-1', 'breed-netherland-dwarf', 'structural', 'Dewlap is a disqualification in Netherland Dwarfs.'),
('dq-fg-1', 'breed-flemish-giant', 'body_type', 'Flat back or lack of arch in the hindquarters is a severe fault/disqualification.'),
('dq-nz-1', 'breed-new-zealand', 'color', 'White spots on colored varieties are a disqualification.');

-- Populate Sample Users (Multi-user demo)
INSERT INTO users (id, email, role, parent_user_id) VALUES
('user-owner', 'jason.owner@rabbitrypedigreepro.com', 'owner', NULL),
('user-child', 'timmy.youth@rabbitrypedigreepro.com', 'owner', 'user-owner'); -- COPPA child sub-account

-- Populate Sample Rabbitries
INSERT INTO rabbitries (id, owner_id, name, prefix, contact_phone, contact_email, theme_color) VALUES
('rabbitry-grandview', 'user-owner', 'Grandview Rabbitry', 'Grandview''s', '555-0199', 'contact@grandviewrabbits.com', 'forest_green');

-- Populate Sample Rabbits (Sire, Dam, and Offspring)
INSERT INTO rabbits (id, rabbitry_id, tattoo_number, name, breed_id, variety, sex, date_of_birth, current_weight_oz, status, registration_number, grand_champion_number, sire_id, dam_id, hutch_location, notes) VALUES
-- Sire (Buck)
('rabbit-sire-blue', 'rabbitry-grandview', 'S01', 'Blue Thunder', 'breed-holland-lop', 'Blue', 'buck', '2025-01-10', 60, 'active', 'REG-12345', 'GC-5544', NULL, NULL, 'A-01', 'Proven sire, extremely calm disposition.'),

-- Dam (Doe)
('rabbit-dam-broken', 'rabbitry-grandview', 'D01', 'Clover Blossom', 'breed-holland-lop', 'Broken Blue', 'doe', '2025-02-15', 62, 'active', 'REG-12346', NULL, NULL, NULL, 'A-02', 'Excellent mothering instincts, large litters.'),

-- Offspring (Junior Doe)
('rabbit-offspring-jr', 'rabbitry-grandview', 'L43-1', 'Blue Pearl', 'breed-holland-lop', 'Blue', 'doe', '2026-03-01', 38, 'active', NULL, NULL, 'rabbit-sire-blue', 'rabbit-dam-broken', 'B-04', 'Promising junior doe showing great crown definition.');

-- Populate Breeding Events
INSERT INTO breedings (id, rabbitry_id, buck_id, doe_id, breed_date, palpate_date, palpate_result, nest_box_date, kindle_date, status) VALUES
('breeding-event-1', 'rabbitry-grandview', 'rabbit-sire-blue', 'rabbit-dam-broken', '2026-05-01', '2026-05-13', 1, '2026-05-28', '2026-06-01', 'kindled');

-- Populate Litters
INSERT INTO litters (id, breeding_id, rabbitry_id, kits_born_alive, kits_born_dead, kits_weaned, notes) VALUES
('litter-record-1', 'breeding-event-1', 'rabbitry-grandview', 6, 1, 5, 'Kits are thriving. Active and nursing well.');

-- Populate Health Log Entries
INSERT INTO health_logs (id, rabbit_id, treatment_date, treatment_type, description, administered_by, next_due_date) VALUES
('hl-1', 'rabbit-sire-blue', '2026-04-10', 'vaccination', 'RHDV2 annual booster vaccination.', 'Dr. Ellie Miller, DVM', '2027-04-10');

-- Populate Ledger Transactions
INSERT INTO ledger_transactions (id, rabbitry_id, transaction_date, type, amount, category, rabbit_id, notes) VALUES
('lt-1', 'rabbitry-grandview', '2026-06-01', 'income', 150.00, 'sale', 'rabbit-offspring-jr', 'Sold Blue Pearl to local 4-H exhibitor.'),
('lt-2', 'rabbitry-grandview', '2026-06-05', 'expense', 45.50, 'feed', NULL, 'Purchased two bags of premium alfalfa rabbit pellets.');
