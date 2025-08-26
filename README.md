# Ash TypeScript React Example

A comprehensive demonstration of the **ash_typescript** extension for the Ash Framework. This project showcases how to build type-safe, full-stack applications with Ash resources automatically generating TypeScript types and RPC functions for seamless client-server integration.

## 🚀 Getting Started

1. Run `mix setup`
2. Start with `iex -S mix phx.server`
3. Visit http://localhost:5173
4. Sign in with `test@example.com`
5. Get magic link from `/dev/mailbox`

## 🎯 What This Demo Showcases

### Core ash_typescript Features

#### **Generated TypeScript Types & RPC Functions**
- **File**: `assets/js/ash_rpc.ts` - Automatically generated from Ash resources
- **Features**: Fully typed resource schemas, RPC functions, and validation schemas
- **Benefits**: Compile-time type safety between frontend and backend

#### **Client-Side Data Loading**
- **Page**: Companies (`/companies`) - `assets/js/pages/invoicing/Companies.tsx`
- **Features**: 
  - Client-side data fetching with `listCompanies()` 
  - Loading states and error handling
  - Type-safe field selection with `ListCompaniesFields`

#### **Advanced Pagination**
- **Keyset Pagination**: Invoices (`/invoices`) - `assets/js/pages/invoicing/Invoices.tsx`
  - Efficient cursor-based pagination for large datasets
  - Real-time filtering without page reloads
  - Next/previous navigation with keyset cursors
  
- **Offset Pagination**: Invoices Offset (`/invoices-offset`) - `assets/js/pages/invoicing/InvoicesOffset.tsx`
  - Traditional page-number pagination
  - Total count and page information
  - Jump to specific pages

#### **Real-Time Filtering & Sorting**
- **Both Invoice Pages**: Filter by state (all/draft/finalized/cancelled)
- **Features**: Client-side filtering with server-side queries, URL state preservation

#### **CRUD Operations & Actions**
- **Create**: New Invoice (`/invoices/new`) - Complex form with line items
- **Read**: View Invoice (`/invoices/:id`) - Detailed invoice display  
- **Update**: Edit Invoice (`/invoices/:id/edit`) - Form pre-population and validation
- **Delete**: Delete draft invoices
- **Actions**: Finalize, cancel invoices with typed action calls

#### **Multi-Entity Management**
- **Companies** (`/companies`): Sender company management with default selection
- **Customers** (`/customers`): Customer database with active/inactive states  
- **Credit Notes** (`/credit-notes`): Credit note issuance and management
- **Invoices**: Full invoice lifecycle management

### Advanced Abstractions

#### **useAshRpcForm Hook**
- **File**: `assets/js/lib/useAshRpcForm.tsx`
- **Showcases**: How ash_typescript provides the building blocks for powerful, reusable abstractions
- **Features**:
  - Client-side validation with Zod schemas
  - Server-side validation integration  
  - Debounced validation for real-time feedback
  - Type-safe form handling
  - Error state management
- **Usage**: Edit Invoice form demonstrates the hook in action
- **Cross-Framework**: Pattern easily adaptable to Vue, Svelte, Angular, and other frameworks


### Technical Architecture

#### **Type Safety Throughout**
- Generated TypeScript types from Ash resource definitions
- Compile-time validation of field selections
- Type-safe RPC function calls with proper error handling
- Zod schema integration for client-side validation

#### **Performance Optimizations**
- Selective field loading to minimize data transfer
- Efficient pagination strategies for different use cases
- Client-side caching and state management
- Debounced validation to reduce server calls

#### **Developer Experience**
- Auto-completion for all resource fields and relationships
- Compile-time errors for invalid field access
- Generated validation schemas matching server-side rules

## 🔧 Key Files to Explore

- `assets/js/ash_rpc.ts` - Generated TypeScript definitions
- `assets/js/lib/useAshRpcForm.tsx` - Reusable form abstraction  
- `assets/js/pages/invoicing/Invoices.tsx` - Keyset pagination + filtering
- `assets/js/pages/invoicing/InvoicesOffset.tsx` - Offset pagination
- `assets/js/pages/invoicing/Companies.tsx` - Client-side loading patterns
- `assets/js/pages/invoicing/EditInvoice.tsx` - Complex form with useAshRpcForm

## 🌟 Why ash_typescript?

This demo illustrates how **ash_typescript** bridges the gap between backend and frontend development by:

1. **Eliminating Type Mismatches**: Auto-generated types ensure frontend and backend stay in sync
2. **Reducing Boilerplate**: No manual API client code - everything generated from your Ash resources  
3. **Enabling Rich Abstractions**: Like `useAshRpcForm` - building blocks for framework-specific patterns
4. **Developer Productivity**: Full IDE support with auto-completion and compile-time validation
5. **Cross-Framework Flexibility**: The same generated code works with React, Vue, Svelte, and more

The `useAshRpcForm` hook particularly demonstrates how ash_typescript provides the foundation for building powerful, reusable abstractions that can be adapted to any client-side framework, making it easy to create consistent, type-safe user experiences across different technology stacks.
