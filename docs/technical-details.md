# Technical Details

## Architecture Decisions

[!Architecture Sketch](./images/architecture-sketch.png)

### Modular Monolith

The architecture follows a modular monolith approach using Next.js.
This leverages server-side type safety while maintaining a clear separation of concerns.
I abstracted core business domains (such as pricing) into separate modules, decoupled from the API and frontend.
This ensures business logic is testable in isolation and not bound to the HTTP transport layer.

### Contract-First API

The backend service (Node.js + Express) implements an API contract modeled with `ts-rest`.
This guarantees end-to-end type safety and results in a structured, predictable RESTful API.

### Mocked Async Processing

To simulate the behavior of a real C++ geometry engine, the file service is designed to accept an upload and eventually transition the record to a `done` state with populated geometry properties.
This mimics an asynchronous background job pattern.
The frontend is built to handle this by polling the file detail endpoint until processing completes or times out.

### Data Modeling

I modeled the material configuration as a distinct database table rather than hardcoding values.
This flexibility allows for easy price adjustments and supports the future development of an admin dashboard.

### Platform Choice

I chose to use Supabase for relational data and file storage, as it offers great convenience and good integration with Next.js.
Additionally, Supabase offers a fully local development environment, which increases development speed.

The services are automatically deployed to Vercel on every push to the `main` branch.
I chose Vercel as they offer easy integration with GitHub and offer seamless deployment of Next.js application.
Additionally, Vercel allows deployment of a Node.js express backend as serveless function, making it ideal to deploy front- and backend on a single platform.

## Quote/Order Relationship & Price Snapshotting

A critical requirement was ensuring that future price or material changes do not retroactively affect active quotes or past orders.
I implemented the suggested snapshot Pattern to solve this:

1.  When a quote is generated, it does not link to a material.
    Instead, all specific pricing variables active at that moment (material price, discounts, etc.) are copied directly into the `Quote` record.
2.  Orders reference a specific quote.
    This makes the quote the immutable "contract" regarding price and deliverables.
3.  An Order can only be created from a quote in the `ready` state (meaning a material was selected and a price calculated).
    Once an Order is placed and paid, the quote transitions to `ordered`, preventing duplicate orders.

I opted not to snapshot lead times within the quote, as manufacturing capacity changes frequently.
Instead, an estimated delivery date is calculated and displayed at the moment of ordering.

## Integrating a Real Geometry Service

In a production environment, geometry processing is likely CPU-intensive and unpredictable.
I would architect this as an asynchronous event-driven system:

1.  The client requests a pre-signed URL to upload files directly to Object Storage (e.g., Supabase Storage, S3), bypassing the API server to save bandwidth.
2.  Upon upload completion, an event is pushed to a reliable message queue (e.g., Supabase Queues, Kafka, SQS).
    This decouples ingestion from processing.
3.  A dedicated, auto-scaling worker service consumes the queue and runs the C++ geometry engine.
4.  The frontend utilizes polling or WebSockets to listen for the `ready` status.
    In production, this would be augmented with email notifications or an overview dashboard for very long-running jobs.

Such a system inherently has a high degree of resilience:

- The queue handles transient failures automatically by retrying messages a couple of times
- Repeatedly failing jobs are moved to a DLQ for engineering inspection to prevent queue blockage

## Possible Extensions

With additional time, I would focus on production readiness and User Experience, with security being the top priority.

### Security & Multi-tenancy

I would implement a robust authentication solution (e.g., Supabase Auth, Clerk, Auth.js).
The system must move from a single context to a multi-tenant model, scoping Files, Quotes, and Orders to specific Organizations or Users via Row Level Security (RLS).

### User Experience

The current UI is functional but bootstrapped.
Integrating a comprehensive component library like `shadcn/ui` would improve visual consistency and accessibility.
Integrating a client-side WebGL viewer (e.g., `three.js` with a STEP loader) would allow users to verify their geometry visually, building trust that their files were successfully transmitted.

### Observability

I would integrate structured logging and Application Performance Monitoring (APM) tools (e.g., Datadog, Sentry).
Tracing requests across the Frontend, Backend, and Async Workers is essential for debugging production issues.

### Testing Strategy

I would add automated Playwright E2E tests to cover the "Upload → Quote → Order" critical path to prevent regressions.
Unit test coverage would also be expanded as business logic complexity increases.

## Questions Before Production

Before finalizing the production build, I would among others clarify the following questions:

- Are there specific encryption requirements for the CAD files? Do we need to support Customer Managed Keys (CMK) or specific retention policies?
- Are there specific audit trail requirements or industry certifications (e.g., ISO 27001) we need to adhere to?
- What are the expected concurrency levels? Should we design for burst auto-scaling, or would a fully serverless architecture be more cost-effective?
- The current model assumes a 1:1 relationship between File and Order.
  Do we need to support a "Shopping Cart" model where multiple distinct parts are grouped into a single Purchase Order?
- How is the confirmed order handed off to the shop floor? Is there an existing interface we need to integrate with via API or Event Bus?

## Current Limitations

### Security & Access Control

The application currently does not enforce authentication or authorization.
Consequently, any user can list all uploaded files and retrieve all quotes and orders.
While the frontend restricts uploads to `.step` and `.stp` extensions, the backend lacks deep file validation (e.g., header analysis) to ensure the integrity and safety of the binary data.

### Asynchronous Processing on Serverless (Vercel)

The backend is deployed as a serverless function on Vercel.
Because serverless functions typically freeze or terminate execution immediately after a response is sent, the mocked "delayed" background processing does not function in the deployed environment as it does locally.

- Locally: The application successfully simulates an asynchronous delay, and the frontend polls until the status updates.
- Deployed: The geometry data is written just after creating the `File` record.
  To the frontend this looks like a synchronous request to extract the geometry data.

### Test Coverage

Testing is currently scoped to the most critical business logic: the pricing logic.
End-to-end (E2E) frontend tests and integration tests for the API endpoints are not yet implemented.
