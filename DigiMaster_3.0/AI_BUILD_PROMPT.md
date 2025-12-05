# DIGIMASTER 3.0 - MASTER PROMPT FOR GEMINI 3 PRO / FARA 7B
# Copy this entire prompt and use it with your AI model to build the missing features

---

You are the **Lead Full-Stack Engineer** for DigiMaster 3.0, an AI-powered marketing automation platform built to compete with GoHighLevel ($297/mo) and HubSpot ($800/mo) at a fraction of the price ($29/mo).

---

## PROJECT CONTEXT

**Location:** `d:\AI_Apps\DigiMaster_3.0`

**Current Tech Stack:**
- Frontend: React 19, Vite 6, TypeScript
- Styling: Tailwind CSS (custom "Star Base" theme)
- State Management: React hooks (useState, useEffect)
- AI: Google Gemini 2.5 Flash (via @google/genai SDK)
- Icons: Lucide React
- Charts: Recharts
- Current Port: 3001 (local), deployed to Surge

**Existing Components:**
1. `App.tsx` - Main app shell with sidebar navigation
2. `components/QuantumPromptanator.tsx` - AI chat interface (working)
3. `components/Taskanator.tsx` - AI task breakdown (working)
4. `components/EveBuilder.tsx` - Voice-guided business setup (working)
5. `components/Dashboard.tsx` - Analytics dashboard (placeholder data)
6. `components/ModuleCard.tsx` - Reusable card component
7. `services/geminiService.ts` - Gemini API integration

**What's Working:** AI features, UI/UX, navigation, voice integration
**What's Missing:** Email marketing, funnel builder, SMS automation, real analytics

---

## YOUR MISSION

Build the **4 CRITICAL FEATURES** that will make DigiMaster competitive with ClickFunnels and GoHighLevel:

### PRIORITY 1: EMAIL MARKETING SYSTEM
### PRIORITY 2: FUNNEL/LANDING PAGE BUILDER  
### PRIORITY 3: SMS AUTOMATION
### PRIORITY 4: REAL ANALYTICS DASHBOARD

---

## DETAILED SPECIFICATIONS

---

### FEATURE 1: EMAIL MARKETING SYSTEM

**File to Create:** `components/EmailStudio.tsx`

**Requirements:**
1. **Contact Management**
   - Display list of contacts (name, email, phone, tags)
   - Add contact manually (form with validation)
   - Import contacts from CSV
   - Delete/edit contacts
   - Tag system for segmentation

2. **Email Composer**
   - Rich text editor (use TipTap or Draft.js)
   - Subject line input
   - From name/email
   - Preview mode (desktop/mobile)
   - **AI Content Generation Button** - Uses Quantum Promptanator to generate email based on user prompt
   - Merge tags: {{firstName}}, {{email}}, {{companyName}}

3. **Campaign Management**
   - Create new campaign
   - Select contact list/tags
   - Schedule send time OR send immediately
   - Campaign status (Draft, Scheduled, Sent)
   - Duplicate/delete campaigns

4. **Analytics**
   - Total sent, opened, clicked, unsubscribed
   - Open rate percentage
   - Click rate percentage
   - Recent campaigns table with stats

**Data Structure (TypeScript):**
```typescript
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags: string[];
  source: string;
  createdAt: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  content: string; // HTML string
  recipients: string[]; // Array of contact IDs or tag names
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: number;
  sentAt?: number;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
}
```

**Backend Integration (Simulated for MVP):**
- For MVP: Use `localStorage` to store contacts and campaigns
- For production: Integrate with Resend API or SendGrid
- Provide clear TODO comments for where API calls go

**UI Design:**
- Follow the "Star Base" aesthetic (dark background, neon accents, glassmorphism)
- Use existing color palette: `neon-cyan`, `neon-purple`, `neon-pink`
- 3-column layout: Sidebar (contacts list) | Main (composer/campaigns) | Right (preview/stats)

---

### FEATURE 2: FUNNEL/LANDING PAGE BUILDER

**File to Create:** `components/FunnelBuilder.tsx`

**Requirements:**
1. **Template Library**
   - 3 pre-built templates:
     - "Lead Magnet" (email capture)
     - "Sales Page" (product/service sales)
     - "Webinar Registration"
   - Each template has: Hero, Features, Form, Footer sections
   - Click to select and customize

2. **Page Editor**
   - Section-based editor (not full drag-drop for MVP)
   - Edit text inline (double-click to edit)
   - Upload images (use placeholder URLs for MVP)
   - Customize colors (brand colors picker)
   - Form builder:
     - Add fields (Name, Email, Phone, Custom)
     - Field validation settings
     - Submit button text
     - Success message

3. **Funnel Management**
   - Create new funnel
   - Name funnel
   - Select template
   - Publish funnel (generates unique URL)
   - View funnel stats (views, conversions)
   - Duplicate/delete funnels

4. **Form Submissions**
   - Capture form data
   - Auto-add to Contacts in Email Studio
   - Tag with funnel name
   - Show recent submissions

**Data Structure:**
```typescript
interface Funnel {
  id: string;
  name: string;
  template: 'leadMagnet' | 'salesPage' | 'webinar';
  slug: string; // URL slug
  sections: FunnelSection[];
  brandColors: {
    primary: string;
    secondary: string;
  };
  form: FormConfig;
  publishedAt?: number;
  stats: {
    views: number;
    submissions: number;
    conversionRate: number;
  };
}

interface FunnelSection {
  id: string;
  type: 'hero' | 'features' | 'form' | 'footer';
  content: {
    headline?: string;
    subheadline?: string;
    bodyText?: string;
    imageUrl?: string;
    buttonText?: string;
  };
}

interface FormConfig {
  fields: FormField[];
  submitButtonText: string;
  successMessage: string;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea';
  label: string;
  placeholder: string;
  required: boolean;
}
```

**Templates (Pre-defined JSON):**
Create 3 starter templates with placeholder content that users can customize.

**AI Enhancement:**
- "Generate Funnel Content" button that uses Quantum Promptanator
- Prompt: "Create compelling copy for a {template type} funnel for a {user's business type}"
- AI generates all section content in one shot

---

### FEATURE 3: SMS AUTOMATION

**File to Create:** `components/SMSAutomation.tsx`

**Requirements:**
1. **Send SMS Campaign**
   - Select contacts (from Email Studio contact list)
   - Compose message (160 character counter)
   - Personalization: {{firstName}}, {{companyName}}
   - Send immediately or schedule

2. **Automation Sequences**
   - Create trigger-based flows:
     - "New Contact Added" → Send welcome SMS
     - "Form Submitted" → Send thank you + next steps
   - Delay between messages (e.g., 1 day, 3 days, 1 week)
   - Up to 5 messages per sequence

3. **SMS Analytics**
   - Total SMS sent
   - Delivery rate
   - Click-through rate (if links included)
   - Cost calculator (show estimated cost based on Twilio pricing)

**Data Structure:**
```typescript
interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  recipients: string[]; // Contact IDs
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: number;
  sentAt?: number;
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number; // If message has links
  };
}

interface SMSAutomation {
  id: string;
  name: string;
  trigger: 'contact_added' | 'form_submitted' | 'tag_added';
  messages: SMSMessage[];
  active: boolean;
}

interface SMSMessage {
  id: string;
  content: string;
  delayDays: number; // Send X days after trigger
}
```

**Backend Integration:**
- For MVP: Simulate sending (console.log)
- For production: Integrate Twilio API
- Show cost estimate: $0.0075 per message (Twilio pricing)

---

### FEATURE 4: REAL ANALYTICS DASHBOARD

**File to Update:** `components/Dashboard.tsx`

**Requirements:**
1. **Overview Cards**
   - Total Contacts (from Email Studio)
   - Active Campaigns (Email + SMS)
   - Total Funnels
   - This Month's Conversions

2. **Performance Charts**
   - Email performance over time (line chart - opens/clicks by day)
   - Funnel conversion rates (bar chart - by funnel)
   - SMS delivery rates (pie chart - sent/delivered/failed)

3. **Recent Activity Feed**
   - Latest form submissions
   - Recent email opens
   - New contacts added
   - Timestamp + contact name

4. **AI Insights Panel**
   - Use Gemini to analyze dashboard data
   - Generate 3-5 actionable insights:
     - "Your Tuesday emails have 30% higher open rates"
     - "Contacts with 'Webinar' tag convert 2x better"
     - "Try A/B testing subject lines - your current open rate is 18%"
   - Button to "Regenerate Insights"

**Data Aggregation:**
- Pull from Email Studio's campaigns
- Pull from Funnel Builder's stats
- Pull from SMS Automation stats
- Calculate totals and trends

**AI Insight Generation:**
```typescript
// In geminiService.ts
export const generateDashboardInsights = async (data: {
  emailStats: any;
  funnelStats: any;
  smsStats: any;
  contacts: Contact[];
}): Promise<string[]> => {
  const prompt = `Analyze this marketing data and provide 3-5 actionable insights...`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}
```

---

## INTEGRATION REQUIREMENTS

### 1. Update `App.tsx`
Add new navigation items:
```typescript
case AppMode.EMAIL_STUDIO:
  return <EmailStudio />;
case AppMode.FUNNEL_BUILDER:
  return <FunnelBuilder />;
case AppMode.SMS_AUTOMATION:
  return <SMSAutomation />;
```

### 2. Update `types.ts`
Add new AppMode values:
```typescript
export enum AppMode {
  DASHBOARD = 'dashboard',
  QUANTUM_PROMPT = 'quantum_prompt',
  TASKANATOR = 'taskanator',
  EVE_BUILDER = 'eve_builder',
  EMAIL_STUDIO = 'email_studio',        // NEW
  FUNNEL_BUILDER = 'funnel_builder',    // NEW
  SMS_AUTOMATION = 'sms_automation',    // NEW
  // ... existing modes
}
```

### 3. Shared Data Store (Simple Context)
Create `contexts/DataContext.tsx`:
```typescript
export const DataContext = createContext({
  contacts: [],
  addContact: (contact: Contact) => {},
  campaigns: [],
  funnels: [],
  // ... etc
});
```

Use `localStorage` for persistence (for MVP).

---

## DESIGN GUIDELINES

**1. Color Palette (Already Defined in Tailwind Config):**
- Background: `space-black` (#020617)
- Panels: `space-panel` (#0f172a)
- Primary Accent: `neon-cyan` (#06b6d4)
- Secondary Accent: `neon-purple` (#a855f7)
- Alert Accent: `neon-pink` (#ec4899)

**2. Typography:**
- Headers: `font-display` (Orbitron)
- Body: `font-sans` (Inter)

**3. Component Patterns:**
- Use glassmorphism: `bg-white/5 backdrop-blur-xl border border-white/10`
- Hover effects: `hover:bg-white/10 transition-all`
- Button states: `bg-neon-cyan hover:bg-cyan-600 disabled:opacity-50`

**4. Icons:**
Use Lucide React icons:
- Email: `Mail`
- Funnel: `Filter`
- SMS: `MessageSquare`
- Analytics: `BarChart3`
- AI: `Zap`, `BrainCircuit`

---

## CODE QUALITY REQUIREMENTS

1. **TypeScript:** All components must be fully typed
2. **Error Handling:** Wrap API calls in try/catch, show user-friendly errors
3. **Loading States:** Show loading spinners during operations
4. **Responsive Design:** Mobile-friendly (Tailwind's responsive classes)
5. **Accessibility:** Proper ARIA labels, keyboard navigation
6. **Comments:** Explain complex logic, mark TODO for future integrations

---

## OUTPUT FORMAT

For each feature you build, provide:

1. **Full Component Code** (ready to paste into file)
2. **Data Types** (TypeScript interfaces)
3. **Integration Instructions** (what to change in App.tsx, etc.)
4. **Test Instructions** (how to verify it works)

**Example Output Structure:**
```
## FEATURE: Email Marketing System

### File: components/EmailStudio.tsx
[Full component code here]

### File: types.ts (additions)
[Type definitions here]

### File: App.tsx (changes)
[Code snippet to add]

### Testing Steps:
1. Navigate to Email Studio
2. Add a test contact
3. Create a campaign
4. Verify it appears in the list
```

---

## PRIORITIES

**Build in this order:**
1. Email Studio (Most critical - 80% of users need this)
2. Funnel Builder (Second most requested)
3. SMS Automation (Nice-to-have, but quick to implement)
4. Analytics Dashboard Update (Polish for demo)

---

## SPECIAL INSTRUCTIONS

1. **AI Integration:** Wherever you add a "content creation" feature, include a button that uses the existing `generateQuantumResponse` function from `geminiService.ts` to AI-generate content.

2. **Reuse Existing Patterns:** Look at `QuantumPromptanator.tsx` and `Taskanator.tsx` to match the coding style, UI patterns, and structure.

3. **Mock Data for MVP:** Use localStorage and mock data for the MVP. Add clear TODO comments like:
   ```typescript
   // TODO: Replace with actual Resend API call
   // const result = await fetch('https://api.resend.com/emails', {...});
   console.log('EMAIL SENT (simulated):', campaign);
   ```

4. **Keep It Working:** Don't break existing components. Test that Quantum Prompt and Taskanator still work after your changes.

---

## SUCCESS CRITERIA

When you're done, DigiMaster should:
✅ Let users create and send email campaigns
✅ Let users build landing pages with forms
✅ Let users send SMS messages
✅ Show real analytics from user activity
✅ Maintain the beautiful "Star Base" UI throughout
✅ Work without errors in development mode (`npm run dev`)

---

## ADDITIONAL CONTEXT

**What Makes DigiMaster Special:**
- Everything is AI-powered (competitors charge $127/mo extra for this)
- 5-minute setup with EVE voice guidance (competitors take weeks)
- Beautiful UI that looks like Tony Stark's lab (competitors look like 2015)
- $29/mo pricing (competitors charge $147-800/mo)

**Your Goal:** Make this SO GOOD that users would rather pay $29/mo for DigiMaster than $297/mo for GoHighLevel.

---

## LET'S BUILD 🚀

Start with **Email Studio**. Build it completely, then move to the next feature. Show me the code when each one is done.

If you need clarification on any requirement, ask before you start coding.

Take a deep breath. You've got this. Let's make DigiMaster the best marketing platform ever built. 💪
