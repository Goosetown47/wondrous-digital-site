/**
 * Shared mock type definitions for tests
 * 
 * These types provide properly typed mocks for common dependencies
 * like Supabase and Stripe, avoiding the need for `any` in tests.
 */

import type Stripe from 'stripe';
import { vi } from 'vitest';

/**
 * Deep partial type utility - makes all properties optional recursively
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Mock function type that matches vitest's mock function
 */
export type MockFunction = ReturnType<typeof vi.fn>;

/**
 * Supabase query builder mock type
 */
export interface MockSupabaseQueryBuilder {
  select: MockFunction;
  insert: MockFunction;
  update: MockFunction;
  delete: MockFunction;
  upsert: MockFunction;
  eq: MockFunction;
  neq: MockFunction;
  gt: MockFunction;
  gte: MockFunction;
  lt: MockFunction;
  lte: MockFunction;
  like: MockFunction;
  ilike: MockFunction;
  is: MockFunction;
  in: MockFunction;
  contains: MockFunction;
  containedBy: MockFunction;
  range: MockFunction;
  order: MockFunction;
  limit: MockFunction;
  single: MockFunction;
  maybeSingle: MockFunction;
  or: MockFunction;
  filter: MockFunction;
  match: MockFunction;
}

/**
 * Supabase auth mock type
 */
export interface MockSupabaseAuth {
  getUser: MockFunction;
  getSession: MockFunction;
  signIn: MockFunction;
  signOut: MockFunction;
  signUp: MockFunction;
  updateUser: MockFunction;
  setSession: MockFunction;
  refreshSession: MockFunction;
  onAuthStateChange: MockFunction;
}

/**
 * Mock Supabase client type with chainable methods
 */
export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
  from: MockFunction;
  rpc: MockFunction;
  storage: {
    from: MockFunction;
  };
  functions: {
    invoke: MockFunction;
  };
  // Chainable query methods (can be called directly on client)
  select?: MockFunction;
  insert?: MockFunction;
  update?: MockFunction;
  delete?: MockFunction;
  upsert?: MockFunction;
  eq?: MockFunction;
  neq?: MockFunction;
  gt?: MockFunction;
  gte?: MockFunction;
  lt?: MockFunction;
  lte?: MockFunction;
  like?: MockFunction;
  ilike?: MockFunction;
  is?: MockFunction;
  in?: MockFunction;
  or?: MockFunction;
  filter?: MockFunction;
  match?: MockFunction;
  single?: MockFunction;
  maybeSingle?: MockFunction;
}

/**
 * Stripe subscription mock type
 */
export interface MockStripeSubscription extends DeepPartial<Stripe.Subscription> {
  id: string;
  status: Stripe.Subscription.Status;
  customer: string;
  items: {
    data: Array<DeepPartial<Stripe.SubscriptionItem>>;
  };
}

/**
 * Stripe invoice mock type
 */
export interface MockStripeInvoice extends DeepPartial<Stripe.Invoice> {
  id: string;
  customer: string;
  subscription: string | null;
  status: Stripe.Invoice.Status;
  total: number;
  currency: string;
}

/**
 * Stripe customer mock type
 */
export interface MockStripeCustomer extends DeepPartial<Stripe.Customer> {
  id: string;
  email: string | null;
  name: string | null;
}

/**
 * Mock Stripe client type
 */
export interface MockStripeClient {
  subscriptions: {
    retrieve: MockFunction;
    update: MockFunction;
    cancel: MockFunction;
    create: MockFunction;
    list: MockFunction;
  };
  invoices: {
    retrieve: MockFunction;
    list: MockFunction;
    pay: MockFunction;
    createPreview: MockFunction;
  };
  customers: {
    retrieve: MockFunction;
    update: MockFunction;
    create: MockFunction;
    list: MockFunction;
  };
  checkout: {
    sessions: {
      create: MockFunction;
      retrieve: MockFunction;
      list: MockFunction;
    };
  };
  billingPortal: {
    sessions: {
      create: MockFunction;
    };
  };
  prices: {
    retrieve: MockFunction;
    list: MockFunction;
  };
  products: {
    retrieve: MockFunction;
    list: MockFunction;
  };
  paymentMethods: {
    retrieve: MockFunction;
    attach: MockFunction;
    detach: MockFunction;
    list: MockFunction;
  };
  setupIntents: {
    create: MockFunction;
    retrieve: MockFunction;
  };
  webhookEndpoints: {
    create: MockFunction;
    update: MockFunction;
    del: MockFunction;
    list: MockFunction;
  };
  subscriptionSchedules: {
    create: MockFunction;
    retrieve: MockFunction;
    update: MockFunction;
    release: MockFunction;
    cancel: MockFunction;
    list: MockFunction;
  };
}

/**
 * Helper to create a mock Supabase query builder with chaining
 */
export function createMockQueryBuilder(
  returnValue: { data?: unknown; error?: unknown } = { data: null, error: null }
): MockSupabaseQueryBuilder {
  const mock: MockSupabaseQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(returnValue),
    maybeSingle: vi.fn().mockResolvedValue(returnValue),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
  };

  // Make all methods return the mock for chaining, except single/maybeSingle
  Object.keys(mock).forEach(key => {
    if (key !== 'single' && key !== 'maybeSingle') {
      const method = mock[key as keyof typeof mock];
      if (typeof method === 'function' && 'mockReturnValue' in method) {
        (method as MockFunction).mockReturnValue(mock);
      }
    }
  });

  return mock;
}

/**
 * Helper to create a mock Supabase client
 */
export function createMockSupabaseClient(
  overrides: DeepPartial<MockSupabaseClient> = {}
): MockSupabaseClient {
  const queryBuilder = createMockQueryBuilder();
  
  const defaultMock: MockSupabaseClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      updateUser: vi.fn(),
      setSession: vi.fn(),
      refreshSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => queryBuilder),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    // Add chainable methods directly to the client for tests that need them
    select: queryBuilder.select,
    insert: queryBuilder.insert,
    update: queryBuilder.update,
    delete: queryBuilder.delete,
    upsert: queryBuilder.upsert,
    eq: queryBuilder.eq,
    neq: queryBuilder.neq,
    gt: queryBuilder.gt,
    gte: queryBuilder.gte,
    lt: queryBuilder.lt,
    lte: queryBuilder.lte,
    like: queryBuilder.like,
    ilike: queryBuilder.ilike,
    is: queryBuilder.is,
    in: queryBuilder.in,
    or: queryBuilder.or,
    filter: queryBuilder.filter,
    match: queryBuilder.match,
    single: queryBuilder.single,
    maybeSingle: queryBuilder.maybeSingle,
  };

  // Deep merge overrides
  return mergeDeep(defaultMock, overrides) as MockSupabaseClient;
}

/**
 * Helper to create a mock Stripe client
 */
export function createMockStripeClient(
  overrides: DeepPartial<MockStripeClient> = {}
): MockStripeClient {
  const defaultMock: MockStripeClient = {
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
    },
    invoices: {
      retrieve: vi.fn(),
      list: vi.fn(),
      pay: vi.fn(),
      createPreview: vi.fn(),
    },
    customers: {
      retrieve: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
        list: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    prices: {
      retrieve: vi.fn(),
      list: vi.fn(),
    },
    products: {
      retrieve: vi.fn(),
      list: vi.fn(),
    },
    paymentMethods: {
      retrieve: vi.fn(),
      attach: vi.fn(),
      detach: vi.fn(),
      list: vi.fn(),
    },
    setupIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    webhookEndpoints: {
      create: vi.fn(),
      update: vi.fn(),
      del: vi.fn(),
      list: vi.fn(),
    },
    subscriptionSchedules: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      release: vi.fn(),
      cancel: vi.fn(),
      list: vi.fn(),
    },
  };

  return mergeDeep(defaultMock, overrides) as MockStripeClient;
}

/**
 * Deep merge utility function
 */
function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          (output as Record<string, unknown>)[key] = mergeDeep(target[key as keyof T], source[key] as DeepPartial<T[keyof T]>);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}