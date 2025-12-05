# 🚀 DigiMaster - All-in-One Digital Marketing Platform

> A complete GoHighLevel competitor built for local businesses. Manage websites, CRM, campaigns, and digital marketing all in one powerful platform.

![Built with Next.js](https://img.shields.io/badge/Next.js-13-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🏠 **Landing Page**
- Professional marketing site
- Feature showcase
- Pricing tiers (Free, Pro $97/mo, Agency $297/mo)
- Customer testimonials
- Mobile responsive

### 🔐 **Authentication**
- Email/password signup and login
- Secure password hashing (bcrypt)
- Protected routes
- Session management
- Password reset flow

### 📊 **Dashboard**
- Real-time statistics
- Contact count
- Campaign performance
- Website metrics
- AI conversation tracking
- Quick actions panel
- Onboarding checklist

### 👥 **CRM (Contacts)**
- Add/edit/delete contacts
- Tag management
- Search and filter
- Contact notes
- Email, phone, company tracking
- Import/export ready
- Bulk operations

### 📧 **Campaigns**
- Email campaigns
- SMS campaigns (Pro feature)
- Campaign analytics (opens, clicks, sends)
- Draft/scheduled/sent status
- Campaign templates
- A/B testing (coming soon)

### 🌐 **Website Builder**
- 4 professional templates
- Template customization
- Multi-page websites
- Custom domain support (Pro)
- Publish/unpublish
- Mobile responsive

### 🤖 **Eve AI Assistant**
- AI-powered chat interface
- Marketing insights
- Content generation
- Campaign drafting
- Analytics interpretation
- Conversation history

### ⚙️ **Settings**
- Profile management
- Billing & upgrades
- Integration hub
- API keys (Agency)
- Team management (Agency)

## 🛠️ Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + bcrypt
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account
- Environment variables configured

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd digimaster
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

The database tables are already configured in Supabase:
- ✅ users
- ✅ contacts
- ✅ campaigns
- ✅ websites
- ✅ chat_messages

All with Row Level Security (RLS) enabled.

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
digimaster/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── contacts/page.tsx   # CRM
│   │   ├── campaigns/page.tsx  # Campaigns
│   │   ├── websites/page.tsx   # Website builder
│   │   ├── ai/page.tsx         # Eve AI
│   │   └── settings/page.tsx   # Settings
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── dashboard-layout.tsx    # Dashboard shell
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── auth.ts                # Auth functions
│   ├── auth-context.tsx       # Auth provider
│   └── utils.ts               # Utilities
├── DEPLOYMENT.md              # Deployment guide
├── USER_GUIDE.md              # User documentation
└── README.md                  # This file
```

## 🎯 Usage

### For End Users

1. **Sign Up**: Create a free account at digimaster.com
2. **Add Contacts**: Import or manually add your contacts
3. **Create Campaigns**: Launch email/SMS campaigns
4. **Build Websites**: Choose a template and customize
5. **Use AI**: Chat with Eve for marketing help
6. **Upgrade**: Scale with Pro or Agency plans

See [USER_GUIDE.md](USER_GUIDE.md) for detailed instructions.

### For Developers

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
```

## 🌐 Deployment

### Deploy to Vercel

```bash
vercel login
vercel
vercel --prod
```

### Configure Domain

1. Add domain in Vercel: digimaster.com
2. Update DNS records
3. Configure SSL
4. Update Supabase CORS settings

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

## 📊 Database Schema

### Users Table
```sql
- id: uuid (primary key)
- email: text (unique)
- name: text
- password_hash: text
- plan: text (free/pro/agency)
- avatar_url: text
- created_at: timestamp
```

### Contacts Table
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- name: text
- email: text
- phone: text
- company: text
- tags: text[]
- notes: text
- created_at: timestamp
```

### Campaigns Table
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- name: text
- type: text (email/sms)
- message: text
- status: text (draft/scheduled/sent)
- sent_count: integer
- open_count: integer
- click_count: integer
- created_at: timestamp
- sent_at: timestamp
```

### Websites Table
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- name: text
- template: text
- custom_domain: text
- published: boolean
- content: jsonb
- created_at: timestamp
```

### Chat Messages Table
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- role: text (user/assistant)
- content: text
- created_at: timestamp
```

## 🔒 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Password hashing with bcrypt
- ✅ HTTPS enforced in production
- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection

## 💰 Pricing Plans

### Free Plan
- 100 contacts
- 1 website
- Basic campaigns
- Eve AI Assistant
- Email support

### Pro Plan - $97/month
- Unlimited contacts
- Unlimited websites
- Email & SMS campaigns
- Custom domains
- Priority support

### Agency Plan - $297/month
- Everything in Pro
- 10 team members
- White-label options
- API access
- Dedicated support

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - How to deploy to production
- [User Guide](USER_GUIDE.md) - Complete user documentation
- [API Reference](API.md) - Coming soon
- [Contributing](CONTRIBUTING.md) - Coming soon

## 🐛 Known Issues

- Email/SMS sending is mocked (integration pending)
- Payment processing placeholder (Stripe integration pending)
- CSV import/export coming soon
- Real AI integration pending (currently uses mock responses)

## 🗺️ Roadmap

### Q1 2025
- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] Stripe payment processing
- [ ] Email service integration (SendGrid/Postmark)
- [ ] SMS service integration (Twilio)

### Q2 2025
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced automation workflows
- [ ] Social media integration
- [ ] A/B testing

### Q3 2025
- [ ] White-label options
- [ ] API documentation
- [ ] Webhook support
- [ ] Advanced reporting

### Q4 2025
- [ ] Marketplace for templates
- [ ] Third-party integrations
- [ ] Enterprise features
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

- **Email**: support@digimaster.com
- **Documentation**: See guides in this repo
- **Issues**: Open a GitHub issue
- **Discussions**: GitHub Discussions

## 🌟 Star History

If you find this project useful, please consider giving it a star!

---

**Built with ❤️ for local businesses worldwide**

**Website**: https://digimaster.com
**Version**: 1.0.0
**Last Updated**: October 2025
