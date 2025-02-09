const projectsTable = `
  CREATE TABLE forecast.projects (
    id INTEGER PRIMARY KEY,
    company_project_id INTEGER,
    custom_project_id TEXT,
    name TEXT,
    connected_project INTEGER,
    stage TEXT,
    status TEXT,
    status_description TEXT,
    description TEXT,
    priority_level_id INTEGER,
    color TEXT,
    estimation_units TEXT,
    minutes_per_estimation_point INTEGER,
    budget DOUBLE PRECISION,
    billable BOOLEAN,
    budget_type TEXT,
    use_sprints BOOLEAN,
    sprint_length INTEGER,
    start_date DATE,
    end_date DATE,
    task_levels INTEGER,
    client INTEGER,
    rate_card INTEGER,
    remaining_auto_calculated BOOLEAN,
    use_project_allocations BOOLEAN,
    use_baseline BOOLEAN,
    baseline_win_chance DOUBLE PRECISION,
    baseline_target DOUBLE PRECISION,
    labels INTEGER[],
    external_refs JSONB,
    progress DOUBLE PRECISION,
    default_period_periodicity TEXT,
    default_period_length INTEGER,
    default_period_budget_type TEXT,
    default_period_hours_amount DOUBLE PRECISION,
    default_period_price_amount DOUBLE PRECISION,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
`;

const personCostPeriodsTable = `
  CREATE TABLE forecast.person_cost_periods (
    id INTEGER PRIMARY KEY,
    person_id INTEGER,
    start_year INTEGER,
    start_month INTEGER,
    start_day INTEGER,
    cost DECIMAL,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
`;

const expenseItemsTable = `
  CREATE TABLE forecast.expense_items (
    id INTEGER PRIMARY KEY,
    project_id INTEGER,
    name TEXT,
    expense_date DATE,
    cost DECIMAL,
    price DECIMAL,
    quantity DECIMAL,
    approved BOOLEAN,
    billable BOOLEAN,
    notes TEXT,
    person_id INTEGER,
    expense_category INTEGER,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    phase_id INTEGER,
    part_of_fixed_price BOOLEAN
  );
`;

const expenseCategoriesTable = `
  CREATE TABLE forecast.expense_categories (
    id INTEGER PRIMARY KEY,
    name TEXT,
    disabled BOOLEAN,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
`;

const personsTable = `
  CREATE TABLE forecast.persons (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    job_title TEXT,
    user_type TEXT,
    client_id INTEGER,
    holiday_calendar_id INTEGER,
    monday INTEGER,
    tuesday INTEGER,
    wednesday INTEGER,
    thursday INTEGER,
    friday INTEGER,
    saturday INTEGER,
    sunday INTEGER,
    active BOOLEAN,
    default_role INTEGER,
    department_id INTEGER,
    cost DECIMAL,
    language TEXT,
    start_date TEXT,
    end_date TEXT,
    permissions TEXT[],
    is_system_user BOOLEAN,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
`;

const rateCardsTable = `
  CREATE TABLE forecast.rate_cards (
    id INTEGER PRIMARY KEY,
    name TEXT,
    default_rate DECIMAL,
    currency TEXT,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
`;

const timeRegistrationsTable = `
  CREATE TABLE forecast.time_registrations (
    id INTEGER PRIMARY KEY,
    person INTEGER,
    project INTEGER,
    role INTEGER,
    task INTEGER,
    task_project INTEGER,
    non_project_time INTEGER,
    time_registered INTEGER,
    billable_minutes_registered INTEGER,
    date DATE,
    notes TEXT,
    approval_status TEXT,
    invoice_entry INTEGER,
    invoice INTEGER,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  );
`;

const forecastSchema = {
  projectsTable,
  personCostPeriodsTable,
  expenseItemsTable,
  expenseCategoriesTable,
  personsTable,
  rateCardsTable,
  timeRegistrationsTable,
};

export default forecastSchema;
