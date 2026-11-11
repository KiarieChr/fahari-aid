-- =============================================================================
-- ACCOUNTING SYSTEM MIGRATION
-- Database: jen
-- Creates: Chart of Accounts, Journal Entries, Audit Trail, Payroll v2
-- Alters: budget_details (add account_id), budget (add financial_year_id, fund_id)
-- =============================================================================

-- -------------------------------------------------------
-- 1. CHART OF ACCOUNTS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(150) NOT NULL,
    account_type ENUM('Asset','Liability','Equity','Revenue','Expense') NOT NULL,
    parent_id INT NULL,
    fund_id INT NULL,
    is_active TINYINT(1) DEFAULT 1,
    description TEXT NULL,
    normal_balance ENUM('Debit','Credit') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES account(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 2. PAYMENT METHOD → ACCOUNT MAPPING
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_account_map (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_method_id INT NOT NULL,
    account_id INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 3. ACCOUNTING FINANCIAL YEARS (separate from the old financial_year table)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounting_period (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed TINYINT(1) DEFAULT 0,
    closed_by INT NULL,
    closed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 4. JOURNAL ENTRIES (General Ledger header)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    reference_no VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    source_type ENUM('income','expense','contribution','pledge','pledge_redeem','payroll','transfer','adjustment','opening_balance') NOT NULL,
    source_id INT NULL,
    accounting_period_id INT NULL,
    is_posted TINYINT(1) DEFAULT 1,
    is_reversed TINYINT(1) DEFAULT 0,
    reversed_by_id INT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accounting_period_id) REFERENCES accounting_period(id),
    FOREIGN KEY (reversed_by_id) REFERENCES journal_entry(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 5. JOURNAL ENTRY LINES (the double-entry debits/credits)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entry_line (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id INT NOT NULL,
    account_id INT NOT NULL,
    debit DECIMAL(15,2) DEFAULT 0.00,
    credit DECIMAL(15,2) DEFAULT 0.00,
    description VARCHAR(255) NULL,
    fund_id INT NULL,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 6. AUDIT LOG
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('create','update','delete','post','reverse','close') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_table (table_name, record_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 7. PAYROLL v2 TABLES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_run (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    description VARCHAR(255) NULL,
    status ENUM('draft','approved','paid') DEFAULT 'draft',
    total_gross DECIMAL(15,2) DEFAULT 0.00,
    total_deductions DECIMAL(15,2) DEFAULT 0.00,
    total_net DECIMAL(15,2) DEFAULT 0.00,
    journal_entry_id INT NULL,
    created_by INT NOT NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payroll_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_run_id INT NOT NULL,
    member_id INT NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    basic_salary DECIMAL(15,2) DEFAULT 0.00,
    allowances DECIMAL(15,2) DEFAULT 0.00,
    deductions DECIMAL(15,2) DEFAULT 0.00,
    net_pay DECIMAL(15,2) DEFAULT 0.00,
    payment_method VARCHAR(50) NULL,
    bank_name VARCHAR(100) NULL,
    account_number VARCHAR(50) NULL,
    notes TEXT NULL,
    FOREIGN KEY (payroll_run_id) REFERENCES payroll_run(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- 8. ALTER EXISTING TABLES — add accounting links
-- -------------------------------------------------------
-- budget_details: link line items to accounts
ALTER TABLE budget_details ADD COLUMN account_id INT NULL AFTER category;

-- budget: link to accounting period and fund
ALTER TABLE budget ADD COLUMN accounting_period_id INT NULL AFTER is_active;
ALTER TABLE budget ADD COLUMN fund_id INT NULL AFTER accounting_period_id;

-- income: add journal_entry_id for linkage
ALTER TABLE income ADD COLUMN journal_entry_id INT NULL;
ALTER TABLE income ADD COLUMN fund_id INT NULL;

-- expense: add journal_entry_id for linkage
ALTER TABLE expense ADD COLUMN journal_entry_id INT NULL;
ALTER TABLE expense ADD COLUMN fund_id INT NULL;

-- contribution: add journal_entry_id for linkage
ALTER TABLE contribution ADD COLUMN journal_entry_id INT NULL;

-- pledges_redeem: add journal_entry_id
ALTER TABLE pledges_redeem ADD COLUMN journal_entry_id INT NULL;

-- -------------------------------------------------------
-- 9. INDEXES for performance
-- -------------------------------------------------------
CREATE INDEX idx_je_date ON journal_entry(entry_date);
CREATE INDEX idx_je_source ON journal_entry(source_type, source_id);
CREATE INDEX idx_je_period ON journal_entry(accounting_period_id);
CREATE INDEX idx_jel_account ON journal_entry_line(account_id);
CREATE INDEX idx_jel_fund ON journal_entry_line(fund_id);
CREATE INDEX idx_account_type ON account(account_type);
CREATE INDEX idx_account_code ON account(account_code);

-- -------------------------------------------------------
-- 10. SEED: Chart of Accounts (Church-specific)
-- -------------------------------------------------------
INSERT INTO account (account_code, account_name, account_type, parent_id, description, normal_balance) VALUES
-- ASSETS (1xxx) - Debit balance
('1000', 'Cash on Hand',           'Asset', NULL, 'Physical cash held by the church', 'Debit'),
('1010', 'Bank Account - Main',    'Asset', NULL, 'Primary bank account', 'Debit'),
('1020', 'M-Pesa Float',           'Asset', NULL, 'Mobile money account (Till 3548432)', 'Debit'),
('1030', 'Online Payments',        'Asset', NULL, 'Online payment gateway balance', 'Debit'),
('1100', 'Pledges Receivable',     'Asset', NULL, 'Outstanding pledges from members', 'Debit'),
('1200', 'Prepaid Expenses',       'Asset', NULL, 'Expenses paid in advance', 'Debit'),

-- LIABILITIES (2xxx) - Credit balance
('2000', 'Accounts Payable',       'Liability', NULL, 'Amounts owed to suppliers/vendors', 'Credit'),
('2010', 'Salaries Payable',       'Liability', NULL, 'Accrued salaries pending payment', 'Credit'),
('2020', 'Taxes Payable',          'Liability', NULL, 'Tax obligations', 'Credit'),

-- EQUITY (3xxx) - Credit balance
('3000', 'General Fund Balance',   'Equity', NULL, 'Unrestricted net assets', 'Credit'),
('3010', 'Building Fund Balance',  'Equity', NULL, 'Restricted for building projects', 'Credit'),
('3020', 'Missions Fund Balance',  'Equity', NULL, 'Restricted for missions', 'Credit'),
('3030', 'Youth Fund Balance',     'Equity', NULL, 'Restricted for youth programs', 'Credit'),
('3100', 'Retained Surplus',       'Equity', NULL, 'Accumulated surplus from prior years', 'Credit'),

-- REVENUE (4xxx) - Credit balance
('4000', 'Tithes',                 'Revenue', NULL, 'Member tithes', 'Credit'),
('4010', 'Offerings',              'Revenue', NULL, 'Sunday and special offerings', 'Credit'),
('4020', 'Donations',              'Revenue', NULL, 'General donations received', 'Credit'),
('4030', 'Pledges Revenue',        'Revenue', NULL, 'Revenue recognized from pledge redemptions', 'Credit'),
('4040', 'Event Registration Fees','Revenue', NULL, 'Fees collected from event registrations', 'Credit'),
('4050', 'Welfare Offerings',      'Revenue', NULL, 'Offerings designated for welfare', 'Credit'),
('4060', 'Partnership Income',     'Revenue', NULL, 'Partnership and sponsorship income', 'Credit'),
('4070', 'Interest Income',        'Revenue', NULL, 'Bank interest earned', 'Credit'),
('4080', 'Other Income',           'Revenue', NULL, 'Miscellaneous income', 'Credit'),

-- EXPENSES (5xxx) - Debit balance
('5000', 'Ministry Expenses',      'Expense', NULL, 'General ministry operations', 'Debit'),
('5010', 'Rent & Utilities',       'Expense', NULL, 'Rent, electricity, water, internet', 'Debit'),
('5020', 'Salaries & Wages',       'Expense', NULL, 'Staff compensation', 'Debit'),
('5030', 'Event Expenses',         'Expense', NULL, 'Costs for church events and conferences', 'Debit'),
('5040', 'Transport & Travel',     'Expense', NULL, 'Travel and transport costs', 'Debit'),
('5050', 'Office & Supplies',      'Expense', NULL, 'Office supplies and stationery', 'Debit'),
('5060', 'Communication',          'Expense', NULL, 'Phone, internet, mail expenses', 'Debit'),
('5070', 'Cleaning & Maintenance', 'Expense', NULL, 'Cleaning supplies and facility maintenance', 'Debit'),
('5080', 'Missions & Outreach',    'Expense', NULL, 'Missions support and outreach programs', 'Debit'),
('5090', 'Benevolence & Welfare',  'Expense', NULL, 'Financial assistance to members in need', 'Debit'),
('5100', 'Equipment & Assets',     'Expense', NULL, 'Equipment purchases and maintenance', 'Debit'),
('5110', 'Professional Services',  'Expense', NULL, 'Legal, audit, consulting fees', 'Debit'),
('5120', 'Bank Charges',           'Expense', NULL, 'Bank fees and transaction charges', 'Debit'),
('5130', 'Depreciation',           'Expense', NULL, 'Asset depreciation', 'Debit'),
('5140', 'Other Expenses',         'Expense', NULL, 'Miscellaneous expenses', 'Debit');

-- -------------------------------------------------------
-- 11. SEED: Payment Method → Account Mapping
-- -------------------------------------------------------
-- Map existing payment methods to asset accounts
-- paymentmethod id=3 (cash, active) → 1000 Cash on Hand
-- paymentmethod id=8 (online payment, active) → 1030 Online Payments
INSERT INTO payment_account_map (payment_method_id, account_id)
SELECT 3, id FROM account WHERE account_code = '1000';
INSERT INTO payment_account_map (payment_method_id, account_id)
SELECT 8, id FROM account WHERE account_code = '1030';

-- -------------------------------------------------------
-- 12. SEED: First Accounting Period
-- -------------------------------------------------------
INSERT INTO accounting_period (name, start_date, end_date)
VALUES ('FY 2025-2026', '2025-01-01', '2025-12-31');

INSERT INTO accounting_period (name, start_date, end_date)
VALUES ('FY 2026-2027', '2026-01-01', '2026-12-31');
