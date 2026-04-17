const express = require('express');
const router = express.Router();
const axios = require('axios');
const Startup = require('../models/Startup');
const { protect } = require('../middleware/auth');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Helper — call Groq API (free, fast, no billing needed)
async function callGemini(prompt) {
  const res = await axios.post(
    GROQ_URL,
    {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    },
    { 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      }, 
      timeout: 30000 
    }
  );
  return res.data.choices[0].message.content;
}

// @POST /api/genai/analyze-pitch
// Analyze a pitch deck text / description with Gemini
router.post('/analyze-pitch', protect, async (req, res) => {
  try {
    const { startupName, description, sector, fundingRequired, teamSize, stage } = req.body;
    const prompt = `
You are an expert startup pitch analyst and venture capitalist with 20 years of experience.

Analyze this startup pitch and give detailed, actionable feedback:

Startup: ${startupName}
Sector: ${sector}
Stage: ${stage}
Funding Required: $${Number(fundingRequired).toLocaleString()}
Team Size: ${teamSize}
Pitch/Description: ${description}

Provide your analysis in this EXACT format:

## Overall Score: [X/10]

## Strengths
- [strength 1]
- [strength 2]
- [strength 3]

## Weaknesses
- [weakness 1]
- [weakness 2]

## What Investors Want to See
- [point 1]
- [point 2]
- [point 3]

## Market Opportunity Assessment
[2-3 sentences]

## Fundability Rating: [Low/Medium/High]

## Top 3 Recommendations
1. [recommendation]
2. [recommendation]
3. [recommendation]

## One-Line Verdict
[Single punchy sentence]
`;
    const result = await callGemini(prompt);
    res.json({ analysis: result, startupName });
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI analysis failed. Check your GEMINI_API_KEY.' });
  }
});

// @POST /api/genai/investor-report
// Generate a full investor report for a startup
router.post('/investor-report', protect, async (req, res) => {
  try {
    const { startupId } = req.body;
    const startup = await Startup.findById(startupId).populate('founder', 'name bio location');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const prompt = `
You are a senior investment analyst at a top-tier VC firm. 
Generate a professional investor report (investment memo) for this startup:

Company: ${startup.name}
Tagline: ${startup.tagline || 'N/A'}
Sector: ${startup.sector}
Stage: ${startup.stage}
Description: ${startup.description}
Funding Required: $${startup.fundingRequired?.toLocaleString()}
Team Size: ${startup.teamSize}
Founder Experience: ${startup.founderExperience || 'N/A'} years
Location: ${startup.location || 'N/A'}
Market Size: $${startup.marketSize?.toLocaleString() || 'N/A'}
Revenue: $${startup.revenue?.toLocaleString() || '0'}
AI Success Score: ${startup.aiScore}%
Competition Level: ${startup.competitionLevel}

Write a professional investment memo with these sections:

# Investment Memo — ${startup.name}

## Executive Summary
[3-4 sentences covering what the company does and why it's interesting]

## The Problem
[What problem does this solve? How big is it?]

## The Solution
[How does this startup solve it uniquely?]

## Market Opportunity
[TAM/SAM/SOM analysis, market trends]

## Business Model
[How does it make money?]

## Competitive Landscape
[Key competitors and differentiation]

## Team Assessment
[Based on team size and experience provided]

## Financial Overview
- Funding Required: $${startup.fundingRequired?.toLocaleString()}
- Use of Funds: [suggested breakdown]
- Revenue Stage: ${startup.revenue > 0 ? 'Revenue generating' : 'Pre-revenue'}

## Risk Factors
- [risk 1]
- [risk 2]
- [risk 3]

## Investment Thesis
[Why should an investor invest now?]

## Verdict: [STRONG BUY / BUY / WATCH / PASS]
[Final recommendation with reasoning]
`;
    const result = await callGemini(prompt);
    res.json({ report: result, startup: { name: startup.name, sector: startup.sector, aiScore: startup.aiScore } });
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Report generation failed. Check your GEMINI_API_KEY.' });
  }
});

// @POST /api/genai/summarize-profile
// Summarize a startup profile in a compelling investor-friendly way
router.post('/summarize-profile', protect, async (req, res) => {
  try {
    const { startupId } = req.body;
    const startup = await Startup.findById(startupId).populate('founder', 'name bio');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const prompt = `
You are a startup storyteller who writes compelling one-pagers for investors.

Transform this startup data into a punchy, investor-friendly profile summary:

Company: ${startup.name}
Sector: ${startup.sector}
Stage: ${startup.stage}  
Description: ${startup.description}
Funding: $${startup.fundingRequired?.toLocaleString()}
Team: ${startup.teamSize} people
AI Score: ${startup.aiScore}%

Write in this format:

## 🚀 ${startup.name}

**The One-Liner:**
[Single sentence that makes investors lean in]

**The Problem They Solve:**
[2 sentences, make it feel urgent]

**Why Now:**
[1-2 sentences on market timing]

**The Opportunity:**
[2 sentences on market size and potential]

**Why They'll Win:**
[2-3 bullet points on their edge]

**The Ask:**
$${startup.fundingRequired?.toLocaleString()} | ${startup.stage} | ${startup.sector}

**Investor Fit:**
[Who should invest in this and why]

**Excitement Level:** [🔥 Hot / ⚡ Interesting / 👀 Watch]
`;
    const result = await callGemini(prompt);
    res.json({ summary: result, startup: { name: startup.name, sector: startup.sector } });
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Summary generation failed. Check your GEMINI_API_KEY.' });
  }
});

// @POST /api/genai/market-analysis
// Generate market analysis for a sector
router.post('/market-analysis', protect, async (req, res) => {
  try {
    const { sector } = req.body;
    const prompt = `
You are a market research analyst specializing in startup ecosystems.

Write a concise market analysis for the ${sector} sector from an investor's perspective:

## ${sector.toUpperCase()} Market Analysis

## Market Overview
[3-4 sentences on the current state]

## Key Trends in 2024-2025
- [trend 1]
- [trend 2]  
- [trend 3]

## Investment Activity
[2-3 sentences on VC activity in this space]

## Top Players to Watch
- [company/type 1]
- [company/type 2]
- [company/type 3]

## Opportunities for Startups
- [opportunity 1]
- [opportunity 2]

## Risks & Challenges
- [risk 1]
- [risk 2]

## Investor Sentiment: [Bullish 🐂 / Neutral 😐 / Bearish 🐻]

## Bottom Line
[2 sentences on whether to invest in this sector now]
`;
    const result = await callGemini(prompt);
    res.json({ analysis: result, sector });
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Market analysis failed. Check your GEMINI_API_KEY.' });
  }
});

// @POST /api/genai/quick-feedback
// Quick AI feedback without a startup ID (for the submit flow)
router.post('/quick-feedback', protect, async (req, res) => {
  try {
    const { description, sector, stage } = req.body;
    const prompt = `
You are a startup advisor. Give quick, honest feedback on this startup description in 3-4 sentences. 
Be specific and actionable. End with one improvement suggestion.

Sector: ${sector}
Stage: ${stage}
Description: ${description}
`;
    const result = await callGemini(prompt);
    res.json({ feedback: result });
  } catch (err) {
    res.status(500).json({ message: 'Feedback failed. Check your GEMINI_API_KEY.' });
  }
});

module.exports = router;
