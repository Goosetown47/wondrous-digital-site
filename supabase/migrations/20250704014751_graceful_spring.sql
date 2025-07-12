/*
  # Add Example Table Post

  1. New Content
    - Add a new blog post with markdown tables to demonstrate table functionality
    - Include properly formatted markdown tables for testing

  2. Purpose
    - Provide content to test table rendering in the blog
    - Demonstrate different types of markdown tables
*/

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
  tags
) VALUES (
  '15 Prompt Ideas Worth Saving',
  'prompt-ideas-worth-saving',
  '# 15 Prompt Ideas Worth Saving

| Scenario (Column A) | Prompt Template (Column B) |
|---------------------|----------------------------|
| New-job estimate follow-up | "Draft a polite follow-up asking [CUSTOMER_NAME] if they have questions about estimate #[ESTIMATE_NUM] for [SERVICE]. Keep it friendly, not pushy." |
| Appointment reminder (24 hrs) | "Write a casual text reminding [CUSTOMER_NAME] of their [SERVICE] tomorrow at [TIME]. Include reschedule link." |
| Review request | "Create a cheerful text asking [CUSTOMER_NAME] for a Google review about today''s [SERVICE]. Mention how reviews help local businesses." |
| Post-job thank-you | "See example above." |
| Unpaid invoice nudge | "Write a firm-but-friendly email reminding [CUSTOMER_NAME] that invoice #[INVOICE_NUM] is 7 days past due." |
| Seasonal promo | "Draft a short Facebook post announcing our [SPRING] maintenance special: [OFFER]. Aim for upbeat and 2 emojis max." |
| FAQ reply | "Answer this customer question in 2 lines: ''Why does my faucet keep leaking?'' Add a call-to-action to book inspection." |
| Service explanation | "Explain the [HYDROJETTING] process to a homeowner in 100 words, sixth-grade reading level." |
| Social-media caption | "Write a playful Instagram caption for a before-and-after photo of a cleaned drain. Include one plumbing pun." |
| Staff spotlight | "Introduce our technician [TECH_NAME] in a LinkedIn post. Highlight 3 fun facts and their favorite local restaurant." |
| Holiday hours notice | "Craft a text alerting customers to our Thanksgiving closing dates. Keep it warm and grateful." |
| Warranty expiring | "Inform [CUSTOMER_NAME] their [PRODUCT] warranty ends on [DATE]. Offer inspection booking link." |
| Referral ask | "Write an email thanking [CUSTOMER_NAME] and asking if they know a neighbor who needs [SERVICE]. Friendly, no pressure." |
| Blog outline starter | "Outline a 600-word blog post: ''Top 5 causes of low water pressure in older homes''." |
| Meet-the-owner bio blurb | "Write a 75-word bio for owner [YOUR_NAME] highlighting 20 years'' experience and community involvement." |

## Sample Table Formatting 2

| Feature | Basic Plan | Pro Plan | Enterprise |
|---------|:----------:|:--------:|:----------:|
| Users | 1 | 10 | Unlimited |
| Storage | 5 GB | 100 GB | 1 TB |
| Support | Email | Email + Chat | 24/7 Priority |
| Custom Domain | No | Yes | Yes |
| Price | $9.99/mo | $29.99/mo | Contact Us |

## Sample Table With Alignment

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|-------------:|
| Content | Content | Content |
| Left | Center | Right |
| Text | Text | Text |

## Nested List Example

* Top level item 1
  * Nested item 1.1
  * Nested item 1.2
    * Deep nested item 1.2.1
    * Deep nested item 1.2.2
* Top level item 2
  * Nested item 2.1
* Top level item 3

## Mixed List Example

1. First ordered item
2. Second ordered item
   * Unordered sub-item
   * Another unordered sub-item
3. Third ordered item
   1. Ordered sub-item
   2. Another ordered sub-item
      * Even deeper unordered item

This post demonstrates different markdown formatting examples including tables and nested lists.',
  'A collection of 15 useful prompt templates for business communications, from customer follow-ups to social media posts, presented in an easy-to-reference format.',
  'Marketing Team',
  'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  '2024-12-20 09:00:00-05',
  'https://images.pexels.com/photos/6476808/pexels-photo-6476808.jpeg?auto=compress&cs=tinysrgb&w=800',
  4,
  ARRAY['Marketing', 'Content Creation', 'Templates']
);