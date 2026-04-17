const express = require('express');
const router = express.Router();
const axios = require('axios');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const { protect } = require('../middleware/auth');

const GROQ_API_KEY = process.env.GEMINI_API_KEY; // reusing same env var
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─── RAG Helper: Retrieve relevant context from MongoDB ──────────────────────

async function retrieveContext(sector, stage, fundingRequired) {
  try {
    // Find similar startups from DB (RAG retrieval step)
    const similarStartups = await Startup.find({
      sector,
      isPublished: true
    }).select('name sector stage fundingRequired teamSize aiScore trustScore competitionLevel description').limit(5);

    // Find startups at same stage
    const sameStageStartups = await Startup.find({
      stage,
      isPublished: true
    }).select('name sector fundingRequired aiScore').limit(5);

    // Find investors interested in this sector
    const matchingInvestors = await Investor.find({
      sectors: sector
    }).populate('user', 'name').select('firmName investorType minInvestment maxInvestment riskLevel preferredStages').limit(5);

    // Compute averages for context
    const avgFunding = similarStartups.length > 0
      ? similarStartups.reduce((a, s) => a + s.fundingRequired, 0) / similarStartups.length
      : fundingRequired;

    const avgAiScore = similarStartups.length > 0
      ? similarStartups.reduce((a, s) => a + s.aiScore, 0) / similarStartups.length
      : 50;

    const avgTeamSize = similarStartups.length > 0
      ? similarStartups.reduce((a, s) => a + s.teamSize, 0) / similarStartups.length
      : 5;

    // Build RAG context string
    const context = `
=== RETRIEVED CONTEXT FROM VENTUREAI DATABASE (RAG) ===

📊 Similar ${sector} Startups in Database (${similarStartups.length} found):
${similarStartups.map((s, i) => `${i+1}. ${s.name} | Stage: ${s.stage} | Funding: $${(s.fundingRequired/1000).toFixed(0)}K | AI Score: ${Math.round(s.aiScore)}% | Competition: ${s.competitionLevel}`).join('\n') || 'No similar startups found yet'}

📈 Sector Benchmarks (${sector}):
- Average Funding Ask: $${(avgFunding/1000).toFixed(0)}K
- Average AI Success Score: ${Math.round(avgAiScore)}%
- Average Team Size: ${Math.round(avgTeamSize)} people
- Total ${sector} Startups on Platform: ${similarStartups.length}

🎯 Same Stage (${stage}) Startups:
${sameStageStartups.map(s => `- ${s.name} (${s.sector}) asking $${(s.fundingRequired/1000).toFixed(0)}K`).join('\n') || 'None found'}

💼 Investors Interested in ${sector} (${matchingInvestors.length} found):
${matchingInvestors.map(inv => `- ${inv.firmName || 'Angel'} | Type: ${inv.investorType} | Budget: $${(inv.minInvestment/1000).toFixed(0)}K-$${(inv.maxInvestment/1000).toFixed(0)}K`).join('\n') || 'No investors yet'}

=== END OF RETRIEVED CONTEXT ===
`;
    return { context, similarStartups, matchingInvestors, avgFunding, avgAiScore };
  } catch (err) {
    console.error('RAG retrieval error:', err.message);
    return { context: '', similarStartups: [], matchingInvestors: [], avgFunding: fundingRequired, avgAiScore: 50 };
  }
}

// ─── LLM Helper: Call Groq with RAG context ──────────────────────────────────

async function callAI(systemPrompt, userPrompt) {
  const res = await axios.post(
    GROQ_URL,
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      timeout: 30000
    }
  );
  return res.data.choices[0].message.content;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// @POST /api/genai/analyze-pitch  (RAG-powered)
router.post('/analyze-pitch', protect, async (req, res) => {
  try {
    const { startupName, description, sector, fundingRequired, teamSize, stage } = req.body;

    // STEP 1: RAG — Retrieve relevant context from DB
    const { context, avgFunding, avgAiScore } = await retrieveContext(sector, stage, Number(fundingRequired));

    // STEP 2: Build prompt with retrieved context
    const systemPrompt = `You are an expert startup pitch analyst and VC with 20 years experience. 
You have access to real startup data from the VentureAI platform database. 
Use this data to give SPECIFIC, DATA-DRIVEN feedback comparing this startup to real benchmarks.
Always reference the actual database numbers in your analysis.`;

    const userPrompt = `
${context}

=== STARTUP TO ANALYZE ===
Startup: ${startupName}
Sector: ${sector}
Stage: ${stage}
Funding Required: $${Number(fundingRequired).toLocaleString()}
Team Size: ${teamSize}
Description: ${description}

Using the real database context above, analyze this pitch:

## Overall Score: [X/10]

## Database Comparison
- Funding vs sector average: [compare to $${(avgFunding/1000).toFixed(0)}K average]
- AI Score benchmark: [compare to ${Math.round(avgAiScore)}% sector average]
- How this startup ranks among similar ones in the database

## Strengths
- [strength 1]
- [strength 2]
- [strength 3]

## Weaknesses
- [weakness 1]
- [weakness 2]

## What Investors on VentureAI Want to See
- [based on investor profiles in database]
- [point 2]
- [point 3]

## Market Opportunity Assessment
[2-3 sentences using sector data from database]

## Fundability Rating: [Low/Medium/High]

## Top 3 Recommendations
1. [specific recommendation]
2. [specific recommendation]  
3. [specific recommendation]

## One-Line Verdict
[Single punchy sentence]`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ analysis: result, startupName, ragContext: { avgFunding, avgAiScore } });

  } catch (err) {
    console.error('AI error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI analysis failed. Check your Groq API key in backend/.env (GEMINI_API_KEY=gsk_...)' });
  }
});

// @POST /api/genai/investor-report  (RAG-powered)
router.post('/investor-report', protect, async (req, res) => {
  try {
    const { startupId } = req.body;
    const startup = await Startup.findById(startupId).populate('founder', 'name bio location');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    // RAG: Retrieve context
    const { context, similarStartups, matchingInvestors } = await retrieveContext(startup.sector, startup.stage, startup.fundingRequired);

    const systemPrompt = `You are a senior investment analyst at a top-tier VC firm.
You have access to real market data from the VentureAI platform.
Generate data-driven investment memos that reference actual platform statistics.`;

    const userPrompt = `
${context}

=== STARTUP FOR INVESTMENT MEMO ===
Company: ${startup.name}
Tagline: ${startup.tagline || 'N/A'}
Sector: ${startup.sector}
Stage: ${startup.stage}
Description: ${startup.description}
Funding Required: $${startup.fundingRequired?.toLocaleString()}
Team Size: ${startup.teamSize}
Founder Experience: ${startup.founderExperience || 'N/A'} years
Location: ${startup.location || 'N/A'}
Revenue: $${startup.revenue?.toLocaleString() || '0'}
AI Success Score: ${startup.aiScore}%
Competition Level: ${startup.competitionLevel}
Similar Competitors Found: ${similarStartups.length}
Matching Investors Available: ${matchingInvestors.length}

Write a professional investment memo:

# Investment Memo — ${startup.name}

## Executive Summary
[3-4 sentences. Reference that there are ${matchingInvestors.length} matching investors on platform]

## The Problem & Solution
[Problem and how they solve it uniquely]

## Market Opportunity
[Use sector data from the retrieved context. Reference real numbers]

## Competitive Analysis  
[Reference the ${similarStartups.length} similar startups found in database. Name them if available]

## Team Assessment
[Based on ${startup.teamSize} team members and founder experience]

## Financial Overview
- Funding Required: $${startup.fundingRequired?.toLocaleString()}
- Revenue Stage: ${startup.revenue > 0 ? 'Revenue generating ($' + startup.revenue.toLocaleString() + ')' : 'Pre-revenue'}
- Platform AI Score: ${startup.aiScore}% (${startup.aiScore > 70 ? 'Above' : 'Below'} sector average)

## Risk Factors
- [risk 1]
- [risk 2]
- [risk 3]

## Investment Thesis
[Why invest now, referencing platform data]

## Verdict: [STRONG BUY / BUY / WATCH / PASS]
[Final recommendation with data-backed reasoning]`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ report: result, startup: { name: startup.name, sector: startup.sector, aiScore: startup.aiScore } });

  } catch (err) {
    console.error('AI error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Report generation failed. Check your Groq API key.' });
  }
});

// @POST /api/genai/summarize-profile  (RAG-powered)
router.post('/summarize-profile', protect, async (req, res) => {
  try {
    const { startupId } = req.body;
    const startup = await Startup.findById(startupId).populate('founder', 'name bio');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const { context, matchingInvestors } = await retrieveContext(startup.sector, startup.stage, startup.fundingRequired);

    const systemPrompt = `You are a startup storyteller who writes compelling one-pagers for investors.
You have real investor data to match startups with. Make the summary feel personal and data-driven.`;

    const userPrompt = `
${context}

=== STARTUP TO SUMMARIZE ===
Company: ${startup.name}
Sector: ${startup.sector}
Stage: ${startup.stage}
Description: ${startup.description}
Funding: $${startup.fundingRequired?.toLocaleString()}
Team: ${startup.teamSize} people
AI Score: ${startup.aiScore}%
Founder: ${startup.founder?.name || 'N/A'}

Write a compelling investor one-pager:

## 🚀 ${startup.name}

**The One-Liner:**
[Single sentence that makes investors lean in]

**The Problem They Solve:**
[2 sentences, make it feel urgent]

**Why Now:**
[1-2 sentences on market timing, reference sector trends from context]

**The Opportunity:**
[Use real numbers from retrieved context]

**Why They'll Win:**
- [edge 1]
- [edge 2]
- [edge 3]

**Platform Intelligence:**
- AI Success Score: ${startup.aiScore}% 
- ${matchingInvestors.length} matching investors on VentureAI
- Competition Level: ${startup.competitionLevel}

**The Ask:**
$${startup.fundingRequired?.toLocaleString()} | ${startup.stage} | ${startup.sector}

**Best Investor Fit:**
[Reference types of investors from the retrieved context]

**Excitement Level:** [🔥 Hot / ⚡ Interesting / 👀 Watch]`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ summary: result, startup: { name: startup.name, sector: startup.sector } });

  } catch (err) {
    console.error('AI error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Summary generation failed. Check your Groq API key.' });
  }
});

// @POST /api/genai/market-analysis  (RAG-powered)
router.post('/market-analysis', protect, async (req, res) => {
  try {
    const { sector } = req.body;

    // RAG: Get all startups in this sector for real data
    const sectorStartups = await Startup.find({ sector, isPublished: true })
      .select('name fundingRequired aiScore stage teamSize competitionLevel').limit(20);

    const sectorInvestors = await Investor.find({ sectors: sector })
      .select('firmName investorType minInvestment maxInvestment riskLevel').limit(10);

    const avgFunding = sectorStartups.length > 0 ? sectorStartups.reduce((a,s) => a + s.fundingRequired, 0) / sectorStartups.length : 0;
    const avgScore = sectorStartups.length > 0 ? sectorStartups.reduce((a,s) => a + s.aiScore, 0) / sectorStartups.length : 0;
    const highCompetition = sectorStartups.filter(s => s.competitionLevel === 'high').length;

    const ragContext = `
=== REAL PLATFORM DATA FOR ${sector.toUpperCase()} ===
Total Startups: ${sectorStartups.length}
Average Funding Ask: $${(avgFunding/1000).toFixed(0)}K
Average AI Success Score: ${Math.round(avgScore)}%
High Competition Startups: ${highCompetition}/${sectorStartups.length}
Active Investors in Sector: ${sectorInvestors.length}

Top Startups by AI Score:
${sectorStartups.sort((a,b) => b.aiScore - a.aiScore).slice(0,3).map(s => `- ${s.name}: ${Math.round(s.aiScore)}% AI score, $${(s.fundingRequired/1000).toFixed(0)}K ask`).join('\n') || 'None yet'}

Investor Budget Range:
${sectorInvestors.map(i => `- ${i.firmName || 'Angel'}: $${(i.minInvestment/1000).toFixed(0)}K-$${(i.maxInvestment/1000).toFixed(0)}K`).join('\n') || 'No investors yet'}
=== END DATA ===`;

    const systemPrompt = `You are a market research analyst with access to real VentureAI platform data.
Always reference the actual numbers from the platform data in your analysis.`;

    const userPrompt = `
${ragContext}

Write a market analysis for the ${sector} sector using the real data above:

## ${sector.toUpperCase()} Market Analysis (VentureAI Intelligence Report)

## Platform Overview
[Use the real numbers above — total startups, avg funding, avg score]

## Key Trends in 2025
- [trend 1]
- [trend 2]
- [trend 3]

## Investment Activity on VentureAI
[Reference real investor data from context]

## Competition Landscape
[Use competition data from platform]

## Opportunities for New Startups
- [opportunity 1]
- [opportunity 2]

## Risks & Challenges
- [risk 1]
- [risk 2]

## Investor Sentiment: [Bullish 🐂 / Neutral 😐 / Bearish 🐻]

## Bottom Line
[Data-driven conclusion using real platform numbers]`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ analysis: result, sector, stats: { total: sectorStartups.length, avgFunding, avgScore, investors: sectorInvestors.length } });

  } catch (err) {
    console.error('AI error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Market analysis failed. Check your Groq API key.' });
  }
});

// @POST /api/genai/quick-feedback
router.post('/quick-feedback', protect, async (req, res) => {
  try {
    const { description, sector, stage } = req.body;
    const { context } = await retrieveContext(sector, stage, 500000);
    const result = await callAI(
      'You are a startup advisor with access to real platform data. Give quick, specific, data-driven feedback.',
      `${context}\n\nGive quick 3-4 sentence feedback on this ${sector} startup at ${stage} stage:\n${description}\nEnd with one specific improvement suggestion based on what similar startups in the database are doing.`
    );
    res.json({ feedback: result });
  } catch (err) {
    res.status(500).json({ message: 'Feedback failed. Check your Groq API key.' });
  }
});

module.exports = router;