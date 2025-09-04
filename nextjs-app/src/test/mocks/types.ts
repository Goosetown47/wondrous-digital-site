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
  admin?: {
    getUserById: MockFunction;
    updateUserById: MockFunction;
    deleteUser: MockFunction;
    listUsers: MockFunction;
  };
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
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    gt: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
    lte: vi.fn(),
    like: vi.fn(),
    ilike: vi.fn(),
    is: vi.fn(),
    in: vi.fn(),
    contains: vi.fn(),
    containedBy: vi.fn(),
    range: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn().mockResolvedValue(returnValue),
    maybeSingle: vi.fn().mockResolvedValue(returnValue),
    or: vi.fn(),
    filter: vi.fn(),
    match: vi.fn(),
  };

  // Make all methods return the mock for chaining
  Object.keys(mock).forEach(key => {
    const method = mock[key as keyof typeof mock];
    if (typeof method === 'function' && 'mockReturnValue' in method) {
      if (key === 'single' || key === 'maybeSingle') {
        // Keep these as promise-returning
        return;
      }
      // All other methods return the mock for chaining
      (method as MockFunction).mockReturnValue(mock);
    }
  });

  // Make the whole mock also thenable so it acts as a Promise when awaited
  // This allows patterns like: const { data, error } = await supabase.from().select().eq()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mock as any).then = (onFulfilled: any) => Promise.resolve(returnValue).then(onFulfilled);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mock as any).catch = (onRejected: any) => Promise.resolve(returnValue).catch(onRejected);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mock as any).finally = (onFinally: any) => Promise.resolve(returnValue).finally(onFinally);

  return mock;
}

/**
 * Helper to create a mock Supabase client
 */
export function createMockSupabaseClient(
  overrides: DeepPartial<MockSupabaseClient> = {}
): MockSupabaseClient {
  // Create a new query builder for each from() call
  const createQueryBuilderInstance = () => {
    const builder = createMockQueryBuilder();
    // Ensure select returns a promise when called without chaining
    const originalSelect = builder.select;
    builder.select = vi.fn().mockImplementation((...args) => {
      // If it's being used in a chain, return the builder
      // Otherwise return a resolved promise
      const result = originalSelect.apply(builder, args);
      // Add then/catch to make it thenable when needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.then = (onFulfilled: any) => Promise.resolve({ data: null, error: null }).then(onFulfilled);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.catch = (onRejected: any) => Promise.resolve({ data: null, error: null }).catch(onRejected);
      return result;
    });
    return builder;
  };
  
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
      admin: {
        getUserById: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        updateUserById: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn(),
      },
    },
    from: vi.fn(() => createQueryBuilderInstance()),
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
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    gt: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
    lte: vi.fn(),
    like: vi.fn(),
    ilike: vi.fn(),
    is: vi.fn(),
    in: vi.fn(),
    or: vi.fn(),
    filter: vi.fn(),
    match: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
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
      // eslint-disable-next-line security/detect-object-injection
      if (isObject(source[key])) {
        if (!(key in target))
          // eslint-disable-next-line security/detect-object-injection
          Object.assign(output, { [key]: source[key] });
        else
          // eslint-disable-next-line security/detect-object-injection
          (output as Record<string, unknown>)[key] = mergeDeep(target[key as keyof T], source[key] as DeepPartial<T[keyof T]>);
      } else {
        // eslint-disable-next-line security/detect-object-injection
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}