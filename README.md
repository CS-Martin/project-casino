# Casino Intelligence Platform

A comprehensive casino intelligence platform built with Next.js, Convex, and AI-powered promotional offer research. This platform enables automated discovery and tracking of casino promotional offers across multiple states and jurisdictions.

## 🚀 Features

### Core Functionality

- **AI-Powered Casino Discovery**: Automated discovery of licensed casinos across different states
- **Promotional Offer Research**: Real-time research of casino promotional offers using AI and web search
- **Historical Data Tracking**: Complete historical record of all offers for trend analysis
- **Batch Processing**: Efficient processing of large casino datasets
- **State-Based Organization**: Organized by state jurisdictions for regulatory compliance

### Technical Features

- **Real-time Database**: Powered by Convex for real-time updates
- **AI Integration**: OpenAI GPT-4 with web search capabilities
- **Automated Scheduling**: Cron jobs for regular offer research
- **API Endpoints**: RESTful APIs for manual triggers and monitoring
- **Scalable Architecture**: Designed to handle thousands of casinos

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Convex (Real-time database and serverless functions)
- **AI**: OpenAI GPT-4o-mini with web search tools
- **Deployment**: Vercel
- **Validation**: Zod schemas for type safety

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Convex account and project
- OpenAI API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-casino
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Convex
CONVEX_DEPLOYMENT=your-convex-deployment-url

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Next.js
NEXT_PUBLIC_CONVEX_URL=your-convex-url
```

### 4. Initialize Convex

```bash
npx convex dev
```

This will:

- Set up your Convex project
- Generate TypeScript types
- Start the development server

### 5. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
project-casino/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Main page
│   └── features/              # Feature-based organization
│       ├── casino-discovery/  # Casino discovery functionality
│       └── promotional-research/ # Offer research functionality
├── convex/                    # Convex backend
│   ├── casinos/              # Casino-related functions
│   ├── offers/               # Offer-related functions
│   ├── states/               # State management
│   └── crons.ts              # Scheduled jobs
├── public/                   # Static assets
└── README.md
```

## 🔧 Core Components

### Casino Discovery

- **AI Agent**: Discovers licensed casinos using web search
- **State Management**: Organizes casinos by jurisdiction
- **Data Validation**: Ensures data quality and completeness

### Promotional Research

- **Batch Processing**: Processes casinos in configurable batches
- **Priority System**: Prioritizes tracked casinos over untracked ones
- **Historical Tracking**: Preserves all offer data for analysis

### Database Schema

#### Casinos Table

```typescript
{
  name: string
  website?: string
  license_status?: string
  source_url?: string
  state_id: Id<'states'>
  is_tracked: boolean
  last_offer_check?: number
}
```

#### Offers Table

```typescript
{
  offer_name: string
  offer_type?: string
  expected_deposit?: number
  expected_bonus?: number
  description?: string
  terms?: string
  valid_until?: string
  wagering_requirement?: number
  min_deposit?: number
  max_bonus?: number
  casino_id: Id<'casinos'>
  source?: string
  is_deprecated?: boolean
  created_at: number
  updated_at: number
}
```

## 🚀 API Endpoints

### Manual Trigger Endpoints

#### Trigger Offer Research

```bash
POST /api/trigger-offer-research
Content-Type: application/json

{
  "batchSize": 30,
  "casinoIds": ["casino-id-1", "casino-id-2"]
}
```

### Convex Functions

#### Casino Management

- `getAllCasinos`: Retrieve all casinos
- `getCasinosForOfferResearch`: Get casinos for batch processing
- `toggleTrackCasino`: Toggle casino tracking status

#### Offer Management

- `createOffers`: Create new offer records
- `getOfferResearchStatus`: Get research statistics
- `getOfferResearchLogs`: Retrieve research logs

## ⚙️ Configuration

### Batch Processing

- **Default Batch Size**: 30 casinos
- **Priority Logic**: 70% tracked casinos, 30% untracked
- **Research Frequency**: Daily via cron job

### AI Configuration

- **Model**: GPT-4o-mini
- **Tools**: Web search enabled
- **Schema Validation**: Zod schemas for structured output

## 📊 Monitoring and Logging

### Research Status

Monitor offer research progress and statistics:

```typescript
const status = await convex.query(api.offers.index.getOfferResearchStatus);
```

### Research Logs

View detailed research logs:

```typescript
const logs = await convex.query(api.offers.index.getOfferResearchLogs, {
  limit: 50,
  level: 'info',
});
```

## 🔄 Automated Workflows

### Daily Offer Research

- **Schedule**: Runs daily via Convex cron job
- **Process**:
  1. Selects batch of casinos (prioritizing tracked ones)
  2. Researches current promotional offers
  3. Creates new offer records
  4. Updates casino timestamps

### Casino Discovery

- **Trigger**: Manual or scheduled
- **Process**:
  1. AI searches for licensed casinos
  2. Validates and structures data
  3. Creates casino records
  4. Links to appropriate states

## 🧪 Testing

### Manual Testing

```bash
# Test offer research
curl -X POST http://localhost:3000/api/trigger-offer-research \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'

# Test casino discovery
npx convex run casino-discovery:discoverCasinos
```

### Development Testing

```bash
# Run Convex functions locally
npx convex run offers/index:getOfferResearchStatus

# Check database state
npx convex run casinos/index:getAllCasinos
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
CONVEX_DEPLOYMENT=your-production-deployment
OPENAI_API_KEY=your-production-openai-key
NEXT_PUBLIC_CONVEX_URL=your-production-convex-url
```

## 📈 Performance Considerations

### Database Optimization

- **Indexes**: Optimized for common query patterns
- **Batch Processing**: Configurable batch sizes for optimal performance
- **Pagination**: Built-in pagination for large datasets

### AI Usage Optimization

- **Batch Processing**: Reduces API calls
- **Smart Prompting**: Efficient prompts for better results
- **Error Handling**: Robust error handling and retry logic

## 🔒 Security

### API Security

- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Zod schemas validate all inputs
- **Rate Limiting**: Built-in rate limiting for API endpoints

### Data Privacy

- **No PII Storage**: Only casino and offer data stored
- **Source Attribution**: All data sources properly attributed
- **Audit Trail**: Complete audit trail of all operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Zod for data validation
- Write comprehensive comments
- Test all new functionality

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### Convex Connection Issues

```bash
# Reset Convex development environment
npx convex dev --reset
```

#### OpenAI API Issues

- Verify API key is correct
- Check API usage limits
- Ensure proper environment variable setup

#### Database Schema Issues

```bash
# Regenerate Convex types
npx convex dev --once
```

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review Convex documentation
- Check OpenAI API documentation

## 🔮 Roadmap

### Upcoming Features

- [ ] Advanced offer comparison tools
- [ ] Real-time notifications for new offers
- [ ] Multi-state regulatory compliance tracking
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] API rate limiting and caching
- [ ] Advanced AI prompt optimization

### Performance Improvements

- [ ] Database query optimization
- [ ] Caching layer implementation
- [ ] Background job processing
- [ ] Advanced error handling and retry logic

---

Built with ❤️ using Next.js, Convex, and OpenAI
