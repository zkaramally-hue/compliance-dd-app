import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { entityName, entityCountry, entityDetails, industry, concerns } = await request.json()

    const healthcareAddon = industry === 'Healthcare & Pharmaceuticals' ? `

HEALTHCARE EXCLUSION SCREENING (MANDATORY):
- Search HHS-OIG LEIE database for entity and all key personnel
- Check GSA SAM.gov for federal exclusions and debarment
- Search state Medicaid exclusion lists for states of operation
- Check DEA registration status and enforcement actions
- Search FDA Warning Letters and enforcement actions
- Check for Medicare/Medicaid fraud (False Claims Act cases)
- Review HIPAA violations and data breaches
- If entity or personnel appear on LEIE or SAM.gov exclusions, flag as CRITICAL RISK

In Section 16, add Healthcare Program Eligibility Status: Can entity participate in Medicare/Medicaid? Yes/No/Conditional` : ''

    const concernsNote = concerns.length > 0 ? `\n\nCLIENT CONCERNS: Focus particularly on: ${concerns.join(', ')}` : ''

    const prompt = `You are a senior compliance officer conducting background due diligence on ${entityName}${entityCountry ? ` (${entityCountry})` : ''} for a ${industry} client.${entityDetails ? ` Additional details: ${entityDetails}` : ''}${concernsNote}

Generate a comprehensive due diligence report with these sections:

(1) ENTITY IDENTIFICATION - Verify identity, registrations, subsidiaries, affiliates, aliases
(2) PUBLIC LISTING STATUS - Stock exchange, ticker, market cap
(3) US PRESENCE - Offices, citizenship of officers/owners
(4) AFFILIATIONS & OWNERSHIP - Corporate structure and control
(5) SANCTIONS SCREENING - Search OFAC SDN, BIS Entity List, EU, UK, UN, Canada sanctions lists
(6) DEBARMENT - SAM.gov exclusions, World Bank, development banks
(7) LEGAL PROCEEDINGS - Court cases, regulatory penalties, outcomes
(8) ADVERSE MEDIA - Money laundering, corruption, terrorism, sanctions evasion, environmental, labor, human rights, cybersecurity (categorize by risk)
(9) OWNERSHIP & FINANCIAL - UBO (25%+ owners), capital sources, financial stability
(10) KEY PERSONNEL - Officers, executives, owners - sanctions, criminal history, regulatory actions
(11) PEP/SFPF - Government officials, political figures, state connections
(12) FAMILY MEMBERS - Screen immediate family of identified PEPs
(13) DIVERSION RISK - Dual-use technology, military end-use, export controls
(14) GEOPOLITICAL RISK - Political stability, sanctions trajectory, conflict risk, trade environment, corruption (CPI score), economic stability. Provide overall country risk rating (Low/Medium/High/Critical)
(15) SYNTHESIS - Comprehensive summary of all findings
(16) REGULATORY RISK SUMMARY - Export controls, money laundering, corruption risks. Overall risk rating (Low/Medium/High/Critical/Prohibited)${healthcareAddon}

FORMAT: Include EXECUTIVE SUMMARY at top with critical findings and overall risk assessment. Use clear section headers. Highlight CRITICAL RISKS. If data unavailable, state "Data Inconclusive". Cite sources. Use web search extensively.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: prompt
        }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
      })
    })

    const data = await response.json()
    const report = data.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n\n')

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}
