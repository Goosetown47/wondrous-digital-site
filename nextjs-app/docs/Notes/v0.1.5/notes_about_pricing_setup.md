**Should the pricing page be at /pricing (public) or /billing
(authenticated)?**

- This is a good question. I do want a public pricing page that we can use to advertise our costs. I would be willing to have people PAY in advance if they’re certain they want to work with us. So if we have both customers who we’ve talked to and they verbally sign up with us, go to this page as the post invitation step, and we have cold customers visiting our page visit it to purchase and get put into our processing and setup queue, I think that’s fine.
- How we organize this (2 or 1 pages) I’m not sure. Given the above what do you think is best?

**For new users from invitations: Should they go to /invitation →
/pricing → checkout?**

- Yes, this makes sense.

**3 Flows:** 

- Site Visitor decides to buy (Only PRO, SCALE, MAX plans available for purchase, not free or basic right now) (This serves as a gate for serious customers only)
    - Visit site → Pricing → Purchase → Confirmation → Added to Onboarding Queue (Cold Customer) → Dashboard with custom “Next Steps” messaging (Work on this in a different sprint)
- Warm prospect decides to buy
    - We set up the account → Invite the customer → Pricing → Purchase → Added to Onboarding Queue (Warm Customer) → Dashboard with custom “Next Steps” messaging (Work on this in a different sprint)
- Existing customer wants to change
    - Manage Billing (can see billing history, current plan) → Change Plan or Cancel button pressed → Pricing (shows current plan) or Cancel (Shows current plan, asks if they want to convert to Basic or Free) pages → Follow through steps

**Should we hide the FREE and BASIC tiers (since they're not
advertised)?**

- Yes, only show our 3 main packages, alongside the PERFORM addon underneath. If they select the addon on top of a plan, it would create 2 new line items in the purchase (one for the monthly addon fee ($459/month) and (One time $750 setup fee) with the normal subscription and set up fee.
    - E.g.,
        - Line Item: PRO Subscription: $397/mo
        - Line Item: Marketing Platform Setup: $1500
        - Line Item: PERFORM Addon Subscription: $459/mo
        - Line Item: SEO Platform Setup: $750
        - Total Today: $2,706.00
- Also we will offer a 10% discount if they pay for a year up front.
    - E.g.,
        - Line Item: 1 Year PRO Subscription: $4287.60 (You saved $476)
        - Line Item: Marketing Platform Setup: $1500
        - Total Today: $5,787.60
- We will offer a 10% yearly paid up front discount. The block I am sharing has a nice toggle switch which shows the prices.

**For the pricing page buttons:**

- **New users (from invitation): "Get Started" → Stripe Checkout**
- **Existing FREE/BASIC users: "Upgrade" → Stripe Checkout**
- **Existing PRO+ users on their current plan: "Current Plan" (disabled)**
- **Existing users on lower tier: "Upgrade" → Stripe subscription update**
- **Is this the right approach?**

This looks correct to me. We also need:

- Existing users on their current plan: “Purchase PERFORM addon” - which adds to their existing plan → Stripe checkout

**Should the addon be purchasable immediately with a plan, or only
after they have PRO+?**

- **Price: $459/month (confirmed?)**

They can purchase the addon at any point, from new cold customer, to warm invited customer to existing customer.

**Should it show as a toggle/checkbox on the pricing cards, or
separate section below?**

- Maybe a section below with an “Add PERFORM addon” button which adds the 2 things as line items to Stripe Checkout.

**To implement the ShadcnBlocks components, I'll need either:**

- The component code copy/pasted here, OR
- You could download them and place them in a folder, OR
- Access credentials (though I understand if you prefer not to share
those)

There are a couple things:

I’ve downloaded the components and put them into this folder (you can move them)

They’ve got these npx buttons that give the following code. I’m not sure if this works for you?

**Pricing Block**

npx shadcn@canary add "https://www.shadcnblocks.com/r/pricing28?token=eyJhbGciOiJIUzI1NiIsImtpZCI6IjVxdW9IOXJ2ZFdVMlJMNTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3Rva2plaXhxeXhjbWRhamFnaWttLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2ZjI0ODVhYS1iYjMwLTQyZjgtOGU4Ny0zNjlmNzgwMzUwODUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1MzczOTUzLCJpYXQiOjE3NTUzNzAzNTMsImVtYWlsIjoidHlsZXIubGFoYWllQHdvbmRyb3VzLmdnIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InR5bGVyLmxhaGFpZUB3b25kcm91cy5nZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjZmMjQ4NWFhLWJiMzAtNDJmOC04ZTg3LTM2OWY3ODAzNTA4NSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU1MzcwMzUzfV0sInNlc3Npb25faWQiOiIxNDc0MWM2Mi02ZWMzLTQ2ZWYtOWZhNy1lZmQ3NGEyNGZmZGEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.1enx7NZ4S4AoKZQfk41OQIH8xJoxlcAmr5ihpa-eiUI"

**Addon Block**

npx shadcn@canary add "https://www.shadcnblocks.com/r/pricing13?token=eyJhbGciOiJIUzI1NiIsImtpZCI6IjVxdW9IOXJ2ZFdVMlJMNTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3Rva2plaXhxeXhjbWRhamFnaWttLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2ZjI0ODVhYS1iYjMwLTQyZjgtOGU4Ny0zNjlmNzgwMzUwODUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1MzczOTUzLCJpYXQiOjE3NTUzNzAzNTMsImVtYWlsIjoidHlsZXIubGFoYWllQHdvbmRyb3VzLmdnIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InR5bGVyLmxhaGFpZUB3b25kcm91cy5nZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjZmMjQ4NWFhLWJiMzAtNDJmOC04ZTg3LTM2OWY3ODAzNTA4NSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU1MzcwMzUzfV0sInNlc3Npb25faWQiOiIxNDc0MWM2Mi02ZWMzLTQ2ZWYtOWZhNy1lZmQ3NGEyNGZmZGEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.1enx7NZ4S4AoKZQfk41OQIH8xJoxlcAmr5ihpa-eiUI"

If that doesn’t work you can use Firecrawl to get the code or I can give you the login info.

**For each tier's feature list, should I use:**

- **The features from the tier_features table we just created?**
- **Or do you have specific marketing copy you want to use?**

Let’s start out with the features I listed in the table, as a rough draft. I will come back with a whole list with categories and icons later. 

We will also work on the page copy and layout a bit once we have something working that we can refine.

**For existing customers viewing the page:**

- **Show a "Manage Subscription" button that goes to Stripe Customer
Portal?**
- **Show usage stats (current projects/users vs limits)?**
- **Show next billing date and amount?**

From the billing management page, yea I think we show a “Manage Subscription” button which goes to the pricing page where they can make a decision about what they want to do (upgrade, downgrade, addon) → Then to stripe to pay.

Billing should show past payments, next billing date, amount, status on if things have been paid, as well as a cancel subscription button. No dark patterns! Make it easy and clear for anyone who wants to cancel to easily cancel, no questions asked.

I don’t think we can show usage stats yet (Maybe that’s available via the GoHighLevel API, but that’s not an MVP feature).

So its:

Billing → Pricing → Stripe Payment

Billing → Cancel Overview → Cancel Subscription → Confirmed → Next Steps Overview (If they’ve paid for the month, at the end of the month their account will transform into a FREE account. What does that mean, etc.)