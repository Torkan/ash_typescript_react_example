# Invoice/Credit Note System - Initial Design

## Overview

This document outlines the design for a simplistic invoice/credit note system built with the Ash framework. The system will support multi-tenant architecture where each user has access only to their own data, with PDF export capabilities and state management.

## Domain Architecture

### Domains

1. **Accounts** (existing)
   - Handles user authentication and management
   - Already implemented with Ash Authentication

2. **Invoicing** (new)
   - Core business logic for invoices, credit notes, customers, and companies
   - All resources will be multi-tenant using user_id as the tenant attribute

## Resource Design

### 1. Company Resource
**Purpose:** Store the sender company details that will appear on invoices/credit notes

```elixir
# lib/ash_typescript_react_example/invoicing/company.ex
attributes:
  - id (uuid, primary key)
  - user_id (uuid, tenant attribute)
  - name (string, required)
  - address_line_1 (string, required)
  - address_line_2 (string, optional)
  - city (string, required)
  - postal_code (string, required)
  - country (string, required)
  - vat_number (string, optional)
  - email (string, optional)
  - phone (string, optional)
  - is_default (boolean, default: false) # Allow multiple companies per user
```

**Rationale:** Companies are stored as separate entities to allow users to have multiple companies and to capture company details at the time of invoice creation (immutability principle).

### 2. Customer Resource
**Purpose:** Store recipient details for invoices/credit notes

```elixir
# lib/ash_typescript_react_example/invoicing/customer.ex
attributes:
  - id (uuid, primary key)
  - user_id (uuid, tenant attribute)
  - name (string, required)
  - address_line_1 (string, required)
  - address_line_2 (string, optional)
  - city (string, required)
  - postal_code (string, required)
  - country (string, required)
  - vat_number (string, optional)
  - email (string, optional)
  - phone (string, optional)
  - is_active (boolean, default: true)
```

**Rationale:** Separate customer management allows for reuse across multiple invoices and maintains a customer database.

### 3. Invoice Resource
**Purpose:** Main invoice entity with state management

```elixir
# lib/ash_typescript_react_example/invoicing/invoice.ex
attributes:
  - id (uuid, primary key)
  - user_id (uuid, tenant attribute)
  - serial_number (string, optional) # Only set when finalized
  - state (atom, required, default: :draft) # :draft, :finalized, :cancelled
  - issue_date (date, required)
  - due_date (date, required)
  -
  # Company details (captured at creation time for immutability)
  - company_name (string, required)
  - company_address_line_1 (string, required)
  - company_address_line_2 (string, optional)
  - company_city (string, required)
  - company_postal_code (string, required)
  - company_country (string, required)
  - company_vat_number (string, optional)
  - company_email (string, optional)
  - company_phone (string, optional)


  # Currency
  - currency (string, required, default: "NOK")

calculations:
  # Financial totals (calculated from invoice lines)
  - subtotal_amount (decimal) # sum of all line_total from invoice_lines
  - tax_amount (decimal)      # sum of all tax_amount from invoice_lines  
  - total_amount (decimal)    # subtotal_amount + tax_amount

relationships:
  - belongs_to :user (Accounts.User)
  - has_many :invoice_lines (InvoiceLine)
```

**Rationale:** Company and customer details are duplicated to ensure immutability - if company/customer details change later, historical invoices remain accurate.

### 4. Credit Note Resource
**Purpose:** Credit note entity (mirrors invoice structure)

```elixir
# lib/ash_typescript_react_example/invoicing/credit_note.ex
# Similar structure to Invoice but for credit notes
# May reference an original invoice_id for credit notes that are corrections
attributes:
  # Same as Invoice plus:
  - original_invoice_id (uuid, optional) # Reference to original invoice if this is a correction
  - credit_reason (string, required) # Reason for the credit note
```

**Rationale:** Separate resource allows for different business logic while maintaining similar structure.

### 5. Invoice Line Resource
**Purpose:** Individual line items for invoices

```elixir
# lib/ash_typescript_react_example/invoicing/invoice_line.ex
attributes:
  - id (uuid, primary key)
  - invoice_id (uuid, required)
  - line_number (integer, required) # For ordering
  - description (string, required)
  - quantity (decimal, required, default: 1)
  - unit_price (decimal, required)
  - tax_rate (decimal, required, default: 0) # Tax percentage (e.g., 25.0 for 25%)

calculations:
  - line_total (decimal)          # quantity * unit_price
  - tax_amount (decimal)          # line_total * (tax_rate / 100)
  - line_total_with_tax (decimal) # line_total + tax_amount

relationships:
  - belongs_to :invoice (Invoice)
```

### 6. Credit Note Line Resource
**Purpose:** Individual line items for credit notes

```elixir
# lib/ash_typescript_react_example/invoicing/credit_note_line.ex
# Similar structure to InvoiceLine
```

### 7. Sequence Number Resource
**Purpose:** Manage serial number sequences per user

```elixir
# lib/ash_typescript_react_example/invoicing/sequence_number.ex
attributes:
  - id (uuid, primary key)
  - user_id (uuid, required, unique per document_type)
  - document_type (atom, required) # :invoice or :credit_note
  - next_number (integer, required, default: 1)

relationships:
  - belongs_to :user (Accounts.User)
```

**Rationale:** Separate resource ensures atomic increment of sequence numbers and prevents race conditions.

## Ash Calculations for Derived Fields

All financial totals and computed fields will use Ash calculations instead of stored attributes:

### Benefits:
- **Data Consistency:** Calculations are always accurate and up-to-date
- **Simplified Logic:** No need to manually update totals when lines change
- **Atomic Updates:** Changes to line items automatically reflect in totals
- **Performance:** Can be loaded efficiently with proper calculation optimizations
- **Maintainability:** Business logic centralized in resource definitions

### Implementation Examples:

**Invoice Line Calculations:**
```elixir
# In invoice_line.ex
calculations do
  calculate :line_total, :decimal, expr(quantity * unit_price)
  calculate :tax_amount, :decimal, expr(line_total * (tax_rate / 100))
  calculate :line_total_with_tax, :decimal, expr(line_total + tax_amount)
end
```

**Invoice Totals Calculations:**
```elixir
# In invoice.ex  
calculations do
  calculate :subtotal_amount, :decimal do
    calculation fn query, _context ->
      from line in InvoiceLine,
        where: line.invoice_id == parent_as(:invoice).id,
        select: sum(line.quantity * line.unit_price)
    end
  end
  
  calculate :tax_amount, :decimal do
    calculation fn query, _context ->
      from line in InvoiceLine,
        where: line.invoice_id == parent_as(:invoice).id,  
        select: sum(line.quantity * line.unit_price * (line.tax_rate / 100))
    end
  end
  
  calculate :total_amount, :decimal, expr(subtotal_amount + tax_amount)
end
```

## State Machine Design

### States and Transitions

**States:**
- `:draft` - Initial state, editable
- `:finalized` - **Completely immutable terminal state**, has serial number, ready for PDF export
- `:cancelled` - Terminal state (only reachable from draft)

**Transitions:**
- `draft -> finalized` (finalize action)
- `draft -> cancelled` (cancel action)
- **No transitions from `:finalized`** - once finalized, the document is permanent

**State Machine Implementation:**
```elixir
# In Invoice and CreditNote resources
state_machine do
  initial_state :draft

  state :draft do
    transition :finalize, to: :finalized, after_transition: &assign_serial_number/3
    transition :cancel, to: :cancelled
  end

  state :finalized # terminal state - completely immutable

  state :cancelled # terminal state
end
```

**Rationale for Immutable Finalized State:**
- Finalized documents have legal and tax implications
- Serial numbers create an audit trail that must not be broken
- If corrections are needed for finalized invoices, the proper business process is:
  1. Create a credit note for the incorrect amount/items
  2. Create a new correct invoice if needed
- This prevents accidental data corruption and maintains document integrity

### Serial Number Assignment

When transitioning to `:finalized` state:
1. Atomically increment the sequence number for the user and document type
2. Assign the serial number to the invoice/credit note
3. Format as "INV-2024-0001" or "CN-2024-0001"

## Multitenancy Implementation

All invoicing resources will use attribute multitenancy:

```elixir
multitenancy do
  strategy :attribute
  attribute :user_id
end
```

This ensures:
- Users can only access their own data
- Database queries are automatically scoped
- No accidental cross-tenant data access

## Actions Design

### Invoice Actions
- `create` - Create draft invoice with company/customer details
- `update` - Update draft invoice (only when in draft state)
- `add_line` - Add invoice line
- `update_line` - Update invoice line (only when invoice in draft state)
- `remove_line` - Remove invoice line (only when invoice in draft state)
- `finalize` - Transition to finalized state + assign serial number
- `cancel` - Transition to cancelled state

### Credit Note Actions
- Similar to invoice actions
- `create_from_invoice` - Create credit note from existing invoice

## PDF Generation Strategy

**Browser Print-to-PDF:**
1. Create print-optimized React components for invoice/credit note display
2. Use CSS `@media print` styles to format documents for printing/PDF export
3. Leverage browser's native print functionality (`window.print()`)
4. Users can save as PDF using browser's "Save as PDF" option

**Benefits:**
- Zero dependencies - no PDF libraries needed
- Perfect rendering consistency (what you see is what you get)
- Native browser optimization for print/PDF output
- Users familiar with standard browser print workflow
- Automatic handling of page breaks, margins, and scaling
- Works offline once page is loaded

**Implementation:**
- Design print-specific CSS styles with `@media print` queries
- Hide navigation, buttons, and non-essential UI elements when printing
- Ensure proper page breaks and formatting for invoice layout
- Use semantic HTML structure for accessibility and print optimization

## Database Considerations

### Indexes & Constraints

Using Ash Postgres data layer configuration in each resource:

**Invoice Resource:**
```elixir
postgres do
  table "invoices"
  
  custom_indexes do
    # Performance indexes
    index [:user_id]
    index [:state] 
    index [:serial_number]
    index [:issue_date]
    
    # Unique constraint for serial numbers per user (only when not null)
    index [:serial_number, :user_id], unique: true, where: "serial_number IS NOT NULL"
  end
end
```

**Customer Resource:**
```elixir
postgres do
  table "customers"
  
  custom_indexes do
    index [:user_id]
    index [:user_id, :is_active]
  end
end
```

**Company Resource:**
```elixir
postgres do
  table "companies"
  
  custom_indexes do
    index [:user_id]
    index [:user_id, :is_default]
  end
end
```

**Invoice Line Resource:**
```elixir
postgres do
  table "invoice_lines"
  
  custom_indexes do
    index [:invoice_id]
    index [:invoice_id, :line_number], unique: true
  end
end
```

**Sequence Number Resource:**
```elixir  
postgres do
  table "sequence_numbers"
  
  custom_indexes do
    # Unique constraint per user and document type
    index [:user_id, :document_type], unique: true
  end
end
```

### Constraints
- Serial numbers must be unique per user
- Only finalized invoices/credit notes have serial numbers
- Invoice lines must belong to an invoice owned by the same user

## Implementation Phases

### Phase 1: Core Resources
1. Set up Invoicing domain
2. Implement Company, Customer resources
3. Add basic CRUD operations
4. Set up multitenancy

### Phase 2: Invoice/Credit Note Resources
1. Implement Invoice and CreditNote resources
2. Add InvoiceLine and CreditNoteLine resources
3. Implement state machine
4. Add serial number assignment

### Phase 3: Frontend Integration
1. Create React components for invoice management
2. Implement forms for creating/editing invoices
3. Implement customer/company management UI
4. Add print functionality with optimized CSS for PDF export
5. Design print-friendly invoice/credit note display components

## Security Considerations

1. **Multitenancy Enforcement:** All queries must be scoped by user_id
2. **State Validation:** Only allow valid state transitions
3. **Immutability:** Prevent editing of finalized documents
4. **Serial Number Integrity:** Ensure no duplicate or missing numbers
5. **Access Control:** Users can only access their own data

## Future Considerations

1. **Email Integration:** Add email sending capabilities
2. **Templates:** Custom invoice templates
3. **Recurring Invoices:** Automatic invoice generation
4. **Payments:** Payment tracking and integration
5. **Reporting:** Financial reports and analytics
6. **API Access:** REST/GraphQL API for third-party integrations

This design provides a solid foundation for the invoice/credit note system while maintaining flexibility for future enhancements.

## Implementation Task List

The following is a comprehensive task breakdown for implementing the invoice/credit note system, organized in a logical sequence that builds complexity gradually and ensures each phase provides a stable foundation for the next.

### Phase 1: Foundation Setup (Tasks 1-3)
**Goal:** Establish core dependencies and domain structure

1. **Add ash_state_machine dependency to mix.exs** - Required for invoice/credit note state management
2. **Create Invoicing domain module with AshTypescript.Rpc extension** - Core domain with RPC capabilities for frontend integration
3. **Set up domain registry in application.ex** - Ensure domain is properly registered

### Phase 2: Core Resources (Tasks 4-10)
**Goal:** Build fundamental data structures with multitenancy and TypeScript integration

4. **Create Company resource with multitenancy and AshTypescript.Resource** - Sender company details with clean TypeScript types
5. **Create Customer resource with multitenancy and AshTypescript.Resource** - Recipient customer details with clean TypeScript types
6. **Create SequenceNumber resource with AshTypescript.Resource** - Atomic serial number generation
7. **Create Invoice resource with basic attributes and AshTypescript.Resource** - Main invoice entity with state management
8. **Create InvoiceLine resource with AshTypescript.Resource** - Individual invoice line items
9. **Create CreditNote resource with AshTypescript.Resource** - Credit note entity mirroring invoice structure
10. **Create CreditNoteLine resource with AshTypescript.Resource** - Individual credit note line items

### Phase 3: Business Logic Implementation (Tasks 11-14)
**Goal:** Implement complex calculations and business workflows

11. **Implement Ash calculations for invoice/credit note totals** - Financial calculations using Ash framework
12. **Implement state machine for Invoice resource** - Draft → Finalized → Cancelled workflow
13. **Implement state machine for CreditNote resource** - State management for credit notes
14. **Create serial number assignment logic** - Atomic sequence number generation on finalization

### Phase 4: Database Layer (Tasks 15-16)
**Goal:** Optimize database performance and establish schema

15. **Add Postgres indexes and constraints** - Performance optimization and data integrity
16. **Generate and run database migrations** - Persist schema changes to database

### Phase 5: AshTypescript Integration (Tasks 17-18)
**Goal:** Establish type-safe frontend-backend communication

17. **Configure RPC actions in domain for all resources** - Expose resource actions via RPC
18. **Generate TypeScript types with mix ash_typescript.codegen** - Create type-safe client functions

### Phase 6: Development & Testing (Tasks 19-21)
**Goal:** Validate system functionality before frontend development

19. **Create seed data for development** - Test data for consistent development environment
20. **Test basic resource operations via IEx** - Verify backend functionality works correctly
21. **Test RPC actions via generated TypeScript functions** - Validate frontend-backend integration

### Phase 7: Frontend Core Implementation (Tasks 22-25)
**Goal:** Build user interface components using type-safe RPC functions

22. **Create React components for Company management** - CRUD operations for company entities
23. **Create React components for Customer management** - CRUD operations for customer entities
24. **Create React components for Invoice creation/editing** - Complex invoice management UI
25. **Create React components for Credit Note creation/editing** - Credit note management UI

### Phase 8: Advanced Features & Polish (Tasks 26-30)
**Goal:** Complete business workflows and professional presentation

26. **Implement state transition UI (finalize/cancel buttons)** - Business workflow controls
27. **Create print-optimized invoice display component** - Professional document presentation
28. **Add CSS @media print styles for PDF generation** - Browser print-to-PDF optimization
29. **Implement error handling and validation displays** - User-friendly error management
30. **Add comprehensive testing** - Ensure system reliability and maintainability

## Strategic Implementation Notes

### Critical Dependencies
- **SequenceNumber → Invoice/CreditNote**: Serial numbers needed for finalization
- **Resources → Calculations**: All line items must exist before total calculations
- **Calculations → State Machine**: Totals needed for validation during state transitions
- **State Machine → Frontend**: UI must understand possible transitions
- **Backend Stability → Frontend**: RPC functions must be reliable before UI development

### Key Milestones
- **After Task 18**: Complete backend with type-safe frontend interface
- **After Task 21**: Full-stack functionality verified and working
- **After Task 25**: Complete user interface for all core operations
- **After Task 30**: Production-ready invoicing system

### AshTypescript Integration Strategy
Each resource will include:
```elixir
extensions: [AshPostgres.DataLayer, AshTypescript.Resource]

typescript do
  type_name "CleanTypeName"  # Professional TypeScript type names
end
```

The domain will expose selected actions:
```elixir
use Ash.Domain, extensions: [AshTypescript.Rpc]

rpc do
  resource Invoice do
    rpc_action :list_invoices, :read
    rpc_action :create_invoice, :create
    rpc_action :finalize_invoice, :finalize
    # ... other actions
  end
end
```

This approach ensures **type-safe end-to-end integration** where backend resource definitions directly drive frontend TypeScript interfaces, eliminating traditional API design complexity while maintaining full type safety and automatic synchronization.
