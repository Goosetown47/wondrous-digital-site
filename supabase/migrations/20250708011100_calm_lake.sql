/*
  # Setup User Roles and Test Data

  1. Updates
    - Set default role for existing users
    - Create admin user
    - Add Wondrous Digital as a customer
    - Add test customer
    - Add sample blog posts for test customer

  2. Purpose
    - Initialize multi-tenant structure
    - Create test data for development
*/

-- 1. Set default role for existing users
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- 2. Create admin user (or update if exists)
-- First check if the user exists in auth.users
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Look for the admin email in auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'tyler.lahaie@wondrousdigital.com';
    
    -- If admin exists in auth but not in public.users, add them
    IF admin_user_id IS NOT NULL THEN
        -- Check if they exist in public.users
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = admin_user_id) THEN
            -- Add to public.users as admin
            INSERT INTO users (id, email, role, customer_id)
            VALUES (admin_user_id, 'tyler.lahaie@wondrousdigital.com', 'admin', NULL);
        ELSE
            -- Update existing user to admin
            UPDATE users
            SET role = 'admin', customer_id = NULL
            WHERE id = admin_user_id;
        END IF;
    END IF;
END
$$;

-- 3. Create Wondrous Digital customer record
INSERT INTO customers (business_name, contact_email, domain, is_active)
SELECT 'Wondrous Digital', 'hello@wondrousdigital.com', 'wondrousdigital.com', true
WHERE NOT EXISTS (
    SELECT 1 FROM customers WHERE business_name = 'Wondrous Digital'
);

-- 4. Create sample test customer
INSERT INTO customers (business_name, contact_email, domain, is_active)
SELECT 'Test Business', 'test@example.com', 'testbusiness.com', true
WHERE NOT EXISTS (
    SELECT 1 FROM customers WHERE business_name = 'Test Business'
);

-- 5. Add sample blog posts for test customer
-- Get the customer ID for the test business
DO $$
DECLARE
    test_customer_id uuid;
BEGIN
    -- Get the customer ID for Test Business
    SELECT id INTO test_customer_id FROM customers WHERE business_name = 'Test Business' LIMIT 1;
    
    -- Only proceed if we found the test customer
    IF test_customer_id IS NOT NULL THEN
        -- Insert first sample blog post if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'the-5-minute-rule') THEN
            INSERT INTO posts (
                title,
                slug,
                content,
                excerpt,
                author_name,
                author_avatar,
                published_at,
                featured_image,
                read_time,
                tags,
                customer_id
            ) VALUES (
                'The 5-Minute Rule for Business Decisions',
                'the-5-minute-rule',
                '# The 5-Minute Rule for Business Decisions

If you''re struggling with decision fatigue in your business, the 5-minute rule might be just what you need. This simple principle can help you prioritize decisions, reduce stress, and maintain focus on what truly matters.

## What is the 5-Minute Rule?

The 5-minute rule states: **If a decision takes less than 5 minutes to make, make it immediately.**

This principle helps you:
- Clear small decisions quickly
- Save mental energy for bigger issues
- Reduce decision backlog
- Move your business forward faster

## Why It Works

### 1. Prevents Decision Paralysis

When running a business, you face hundreds of decisions daily. Without a system, you can become overwhelmed and freeze up, unable to move forward on anything.

### 2. Reduces the "Open Loop" Problem

Every unmade decision is an open loop in your mind, consuming mental bandwidth in the background. The 5-minute rule closes these loops quickly.

### 3. Creates Momentum

Small wins create momentum. Making quick decisions builds confidence and creates forward motion in your business.

## How to Implement the 5-Minute Rule

1. **Ask yourself**: "Can I make this decision in under 5 minutes?"
2. **If yes**: Make it immediately
3. **If no**: Schedule dedicated time to gather information and make the decision

## When to Break the Rule

Not all quick decisions are good ones. Break the rule when:
- The decision has long-term, significant consequences
- The decision is irreversible
- You need specific data you don''t currently have
- The decision affects multiple stakeholders who should be consulted

## Real-World Examples

- **Website color update?** 5-minute decision. Pick a color and move on.
- **Which CRM to use for the next 3 years?** Not a 5-minute decision. Research required.
- **Respond to a routine customer email?** 5-minute decision. Handle it now.
- **Hire a new team member?** Not a 5-minute decision. Take your time.

## Bottom Line

The 5-minute rule won''t solve all your business challenges, but it will clear the small decisions that clog your day and drain your mental energy. Try it for a week and see how it transforms your productivity and clarity.',
                'Learn how to implement the 5-minute decision rule to reduce overwhelm and make faster progress in your business by quickly handling small decisions.',
                'Test Author',
                'https://images.pexels.com/photos/3760809/pexels-photo-3760809.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
                '2025-01-05 09:15:00-05',
                'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800',
                5,
                ARRAY['Productivity', 'Business Tips', 'Decision Making'],
                test_customer_id
            );
        END IF;
        
        -- Insert second sample blog post if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'nightshift-website') THEN
            INSERT INTO posts (
                title,
                slug,
                content,
                excerpt,
                author_name,
                author_avatar,
                published_at,
                featured_image,
                read_time,
                tags,
                customer_id
            ) VALUES (
                'Why Your Business Needs a Night-Shift Website',
                'nightshift-website',
                '# Why Your Business Needs a Night-Shift Website

Your website is your most hardworking employee, but is it truly working 24/7? Most business websites are passive brochures rather than active salespeople, especially after business hours. Here''s why your website should be working the night shift and how to make it happen.

## The 24/7 Customer Reality

Today''s customers don''t shop 9-to-5. Consider these statistics:
- 70% of consumers research purchases outside business hours
- 35% of service inquiries happen between 10pm and 6am
- 60% of customers will go to a competitor if they can''t get information immediately

When your physical location is closed, your website becomes your business''s face, voice, and sales team all in one.

## What Makes a Night-Shift Website?

A true night-shift website doesn''t just exist after hours—it actively engages, qualifies, and converts visitors when you''re unavailable. Here''s what it needs:

### 1. 24/7 Lead Capture Systems

Standard contact forms are passive. They collect information but provide no immediate value to the visitor. Night-shift websites use:

- **Interactive quote calculators** that give instant estimates
- **Appointment self-scheduling** with real-time availability
- **Pre-qualification tools** that help customers understand if they''re a good fit

### 2. Automated Instant Response

When someone reaches out at 2am, they shouldn''t wait until 9am for acknowledgment:

- **Automated SMS confirmation** with expected response times
- **Personalized immediate email responses** with helpful next steps
- **Chatbot initial triage** to collect key information overnight

### 3. Customer Self-Service Options

Let customers help themselves when you''re unavailable:

- **Knowledge base** with searchable FAQs
- **Video tutorials** for common questions
- **Customer portal** for existing clients to access their information

### 4. After-Hours Value Delivery

Provide immediate value even when you''re sleeping:

- **Downloadable resources** in exchange for contact information
- **Automated service diagnostics** to help identify problems
- **Instant access** to introductory digital products

## Real Business Results

Businesses that implement night-shift website strategies see:

- 35% increase in qualified leads
- 28% higher conversion rates
- 47% faster sales cycles
- 65% improved customer satisfaction

## Getting Started: Three Steps

1. **Audit your current after-hours performance**
   Track how many visitors you get outside business hours and what actions they can take

2. **Implement progressive automation**
   Start with basic automated responses, then add self-service options

3. **Measure and optimize**
   Track how your night-shift improvements affect lead quality, quantity, and conversion

## Conclusion

In today''s 24/7 economy, your website needs to do more than just exist after hours—it needs to actively engage, help, and convert visitors whenever they arrive. The businesses that recognize this shift and adapt accordingly will have a significant competitive advantage.

Don''t let your website clock out when you do. Put it on the night shift and watch your business grow while you sleep.',
                'Discover how to transform your website from a passive brochure to a 24/7 sales machine that captures leads and provides customer service even when you''re sleeping.',
                'Test Author',
                'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
                '2025-01-10 14:30:00-05',
                'https://images.pexels.com/photos/230659/pexels-photo-230659.jpeg?auto=compress&cs=tinysrgb&w=800',
                6,
                ARRAY['Websites', 'Automation', 'Lead Generation', 'Customer Service'],
                test_customer_id
            );
        END IF;
    END IF;
END
$$;