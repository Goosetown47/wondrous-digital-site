I’m not happy with how fragmented our flow has become or what the process is like. I want us to step back and redesign this process.

I have created two flow charts for us to reference. 

**COLD PROSPECTS**

"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\ColdProspect_SignUpFlow.png”

**WARM PROSPECTS**

"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\WarmCustomer_SignUpFlow.png”

The industry standard is **sign up first, then pay**. This is the dominant pattern for several important reasons:

**Why signup comes first:**

1. **Lower friction** - Asking for payment immediately creates a psychological barrier. Users want to feel invested in your product before pulling out their credit card.
2. **Trust building** - Creating an account lets users explore the interface, see what they're getting, and build confidence before committing financially.
3. **Data collection** - You can capture email addresses even if they don't convert immediately, allowing for follow-up marketing and abandoned cart recovery.
4. **Compliance** - Many payment processors require you to have user consent and contact information before processing payments.

**Common flows:**

- **SaaS**: Sign up → Choose plan → Enter payment → Activate

We need a cohesive, trust building process for each customer type, not one that is all over the place and inconsistent. This is our VERY FIRST TOUCH to build trust with customers who will be paying a lot of money. We have to wow them.

We need to build a stepper type experience for customers that hand holds them along the way.

- They need to know where they are in the process, easily.
- They need to know how many steps there are and what is required vs. nice to have.
- The process needs to “carry forward” the CORRECT information from start to finish for the user. We need to confirm that information along the way.
- There is messaging along the way to reassure them and have a little fun.

We will create the SAME process for both cold and warm customers. The only difference is the way they come into the funnel. One is from an email invitation. The other will be from the marketing site. Both will need to choose an email address, set the password, confirm it and then continue through the process.

The Steps:

1. Welcome & Create Login Credentials
2. Confirm your email and login
3. Fill out account information
4. Fill out personal information
5. Pick a plan and pay, see confirmation
6. To Dashboard

I created wireframes for you to see what I mean:

1. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-1.png”
2. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-2.png”
3. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-3.png”
4. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-4.png”
5. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-5a.png”
6. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-5b.png”
7. "\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\UI\SignUpFlow-5c.png”

I want to follow these design pretty closely. 

If you need a stepper component, I found one here:
https://v0.app/chat/shadcn-ui-stepper-XZVvYHpAWRh
Use firecrawl if you can't access it regularly.
