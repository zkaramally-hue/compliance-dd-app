import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { entityName, entityCountry, entityDetails, industry, concerns } = await request.json()

    const basePrompt = `You are a senior compliance officer conducting background due diligence on ${entityName}${entityCountry ? ` (${entityCountry})` : ''} for a ${industry} client.${entityDetails ? ` Additional details: ${entityDetails}` : ''}

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
(16) REGULATORY RISK SUMMARY - Export controls, money laundering, corruption risks. Overall risk rating (Low/Medium/High/Critical/Prohibited)

FORMAT: Include EXECUTIVE SUMMARY at top with critical findings and overall risk assessment. Use clear section headers. Highlight CRITICAL RISKS. If data unavailable, state "Data Inconclusive". Cite sources. Use web search extensively.`

    const industryAddons = {
      'Banking & Financial Services': `

CLIENT INDUSTRY: BANKING & FINANCIAL SERVICES

ADDITIONAL FOCUS AREAS FOR BANKING CLIENT:
In your analysis, pay particular attention to:

AML/KYC RED FLAGS:
- Shell company indicators (nominee directors, registered agent addresses, no physical presence)
- High-risk jurisdiction presence (FATF blacklist/greylist countries)
- Complex ownership structures designed to obscure beneficial ownership
- Presence in known tax havens or secrecy jurisdictions
- Inconsistent business activity with stated purpose

FINANCIAL CRIME TYPOLOGIES:
- Trade-based money laundering indicators
- Structuring patterns in transaction history
- Layering through multiple jurisdictions
- Integration through legitimate business facades

SOURCE OF FUNDS/WEALTH:
- Identify and analyze capital sources and funding mechanisms
- Assess legitimacy of wealth accumulation
- Flag unexplained wealth or rapid asset growth

ULTIMATE BENEFICIAL OWNERS (UBO):
- Identify all persons owning 25% or more (regulatory threshold)
- Trace ownership through corporate layers
- Identify any concealment attempts

CORRESPONDENT BANKING RISKS:
- Does entity bank with high-risk financial institutions?
- Banking relationships in high-risk jurisdictions
- Potential exposure to sanctioned banks

REGULATORY ACTIONS:
- SEC enforcement actions (securities violations, broker-dealer issues)
- FinCEN advisories relevant to entity or sector
- Banking regulator actions (OCC, Federal Reserve, FDIC, CFPB)
- International banking regulator actions

In Section 8 (Adverse Media), specifically categorize by:
- Financial crime (fraud, embezzlement, Ponzi schemes)
- Money laundering
- Sanctions evasion
- Tax evasion
- Securities violations
- Banking fraud

In Section 16 (Regulatory Risk Summary), add:
- AML/BSA Compliance Risk Rating
- Customer Due Diligence (CDD) Risk Classification (Low/Medium/High/Prohibited)
- Recommendation on customer acceptance decision`,

      'Defense & Government Contracting': `

CLIENT INDUSTRY: DEFENSE & GOVERNMENT CONTRACTING

ADDITIONAL FOCUS AREAS FOR DEFENSE CONTRACTOR CLIENT:
In your analysis, pay particular attention to:

EXPORT CONTROL COMPLIANCE:
- ITAR violations and export control history
- BIS denied parties screening (Entity List, Denied Persons, Unverified List)
- End-use and end-user concerns under EAR Section 744.21
- Technology transfer risks
- Encryption and cybersecurity export implications

DEFENSE SECURITY:
- Foreign Ownership, Control, or Influence (FOCI) concerns
- Security clearance history (FCL status if publicly available)
- Facility security clearances
- Personnel security concerns

GOVERNMENT CONTRACTING:
- SAM.gov suspension and debarment status
- Past performance on government contracts
- Contract disputes or terminations
- False Claims Act allegations
- Cost accounting violations

CYBERSECURITY:
- CMMC (Cybersecurity Maturity Model Certification) readiness indicators
- Cybersecurity incidents affecting defense information
- NIST 800-171 compliance indicators
- Controlled Unclassified Information (CUI) handling

MILITARY END-USE/END-USER:
- Military applications of entity's products
- Access to controlled technical data
- Presence in countries of diversion concern (China, Russia, Iran, North Korea)
- Dual-use technology implications

In Section 13 (Diversion Risk), emphasize:
- Military/defense applications assessment
- Technology access and transfer risks
- Diversion to countries of concern

In Section 16 (Regulatory Risk Summary), add:
- Defense Industrial Base (DIB) Security Risk Rating
- ITAR/EAR Compliance Risk Assessment
- Government Contracting Eligibility Assessment`,

      'Technology & Software': `

CLIENT INDUSTRY: TECHNOLOGY & SOFTWARE

ADDITIONAL FOCUS AREAS FOR TECHNOLOGY CLIENT:
In your analysis, pay particular attention to:

INTELLECTUAL PROPERTY:
- IP theft history (patents, trade secrets, copyright infringement)
- Patent litigation history
- Trademark disputes
- Technology misappropriation allegations
- Open source license violations

DATA PRIVACY & CYBERSECURITY:
- GDPR enforcement actions (EU)
- CCPA/CPRA violations (California)
- Data breach history and incident response
- Ransomware attacks or cyber incidents
- Privacy regulatory actions (FTC, state AGs)

STATE-SPONSORED CYBER THREATS:
- Connections to state-sponsored hacking groups
- Attribution in threat intelligence reports
- APT (Advanced Persistent Threat) associations
- Industrial espionage allegations

TECHNOLOGY-SPECIFIC SANCTIONS:
- Semiconductor export controls (China focus)
- AI/machine learning restrictions
- Quantum computing controls
- Emerging technology restrictions

FOREIGN INVESTMENT SCREENING:
- CFIUS (Committee on Foreign Investment in US) concerns
- National security implications of technology
- Critical technology assessment
- Foreign ownership restrictions

TECHNOLOGY TRANSFER:
- Export control implications of technology sharing
- Deemed exports concerns
- International traffic in arms (ITAR) for defense tech
- Dual-use technology assessment

In Section 13 (Diversion Risk), emphasize:
- Technology transfer pathways
- Dual-use applications
- End-user verification challenges

In Section 16 (Regulatory Risk Summary), add:
- IP Theft & Trade Secret Risk Rating
- Data Privacy Compliance Risk Assessment
- Technology Transfer & Export Control Risk
- Cybersecurity Risk Profile`,

      'Legal Services': `

CLIENT INDUSTRY: LEGAL SERVICES

ADDITIONAL FOCUS AREAS FOR LAW FIRM CLIENT:
In your analysis, pay particular attention to:

CONFLICT OF INTEREST SCREENING:
- Litigation history involving potential adverse parties
- Past disputes that could create conflicts
- Related entity involvement in ongoing matters
- Regulatory enforcement actions

PROFESSIONAL ETHICS:
- Bar association sanctions or discipline
- Professional malpractice claims
- Ethics violations or complaints
- Attorney trust account issues or misappropriation

REPUTATIONAL RISK:
- High-profile scandals or controversies
- Association with organized crime
- Involvement in notorious legal matters
- Media coverage affecting reputation

CLIENT ACCEPTANCE RISK:
- Money laundering risks affecting attorney-client relationship
- Potential for firm to be used in furtherance of crime or fraud
- Source of funds for legal fees
- Sanctions compliance implications

LITIGATION HISTORY:
- Pattern of aggressive or vexatious litigation
- Sanctions by courts for litigation conduct
- Discovery abuses
- Contempt findings

In Section 8 (Adverse Media), focus on:
- Legal malpractice allegations
- Ethical violations
- Fraud or misrepresentation
- Attorney discipline

In Section 16 (Regulatory Risk Summary), add:
- Client Acceptance Risk Assessment
- Conflicts of Interest Risk
- Reputational Risk to Firm`,

      'Healthcare & Pharmaceuticals': `

CLIENT INDUSTRY: HEALTHCARE & PHARMACEUTICALS

ADDITIONAL FOCUS AREAS FOR HEALTHCARE CLIENT:
In your analysis, pay particular attention to:

HEALTHCARE REGULATORY COMPLIANCE:
- FDA Warning Letters and enforcement actions
- Clinical trial violations or research misconduct
- Drug safety issues or recalls
- Medical device recalls or safety alerts

HEALTHCARE FRAUD:
- Medicare/Medicaid fraud allegations
- False Claims Act cases
- Kickback schemes (Anti-Kickback Statute)
- Stark Law violations

EXCLUSION LISTS:
- HHS-OIG List of Excluded Individuals/Entities (LEIE)
- State Medicaid exclusion lists
- GSA SAM.gov debarment for healthcare fraud

CONTROLLED SUBSTANCES:
- DEA registration status and history
- Controlled substance violations
- Opioid-related litigation or enforcement
- Drug diversion issues

DATA PRIVACY:
- HIPAA violations and breach history
- Protected Health Information (PHI) mishandling
- Business Associate Agreement compliance

PRODUCT LIABILITY:
- Mass tort litigation
- Product liability claims
- Personal injury lawsuits
- Class action involvement

In Section 8 (Adverse Media), focus on:
- Patient safety issues
- Healthcare fraud
- Regulatory violations
- Product liability

In Section 16 (Regulatory Risk Summary), add:
- Healthcare Regulatory Compliance Risk
- Federal Healthcare Program Eligibility
- Patient Safety Risk Assessment`,

      'Energy & Natural Resources': `

CLIENT INDUSTRY: ENERGY & NATURAL RESOURCES

ADDITIONAL FOCUS AREAS FOR ENERGY CLIENT:
In your analysis, pay particular attention to:

ENVIRONMENTAL COMPLIANCE:
- EPA enforcement actions and violations
- Clean Air Act violations
- Clean Water Act violations
- CERCLA/Superfund site liability
- State environmental violations

SAFETY VIOLATIONS:
- MSHA (Mine Safety) citations and violations
- OSHA violations and fatality investigations
- Pipeline safety incidents
- Offshore drilling safety issues

INDIGENOUS RIGHTS & LAND USE:
- Indigenous land rights disputes
- Consultation and consent issues
- Land grab allegations
- Community displacement

CONFLICT MINERALS:
- 3TG sourcing (tin, tantalum, tungsten, gold)
- Conflict region supply chain
- Due diligence on mineral sources
- SEC conflict minerals reporting

ENVIRONMENTAL INCIDENTS:
- Oil spills and chemical releases
- Ecological damage
- Groundwater contamination
- Climate change litigation

RESOURCE NATIONALISM:
- Expropriation or nationalization risk
- Changes to mining/energy concessions
- Local content requirements
- Forced technology transfer

In Section 14 (Geopolitical Risk), emphasize:
- Resource nationalism trends
- Political stability in operating regions
- Regulatory change likelihood

In Section 16 (Regulatory Risk Summary), add:
- Environmental Compliance Risk Rating
- Social License to Operate Assessment
- Indigenous Rights Risk`,

      'Manufacturing & Industrial': `

CLIENT INDUSTRY: MANUFACTURING & INDUSTRIAL

ADDITIONAL FOCUS AREAS FOR MANUFACTURING CLIENT:
In your analysis, pay particular attention to:

SUPPLY CHAIN RISKS:
- Tier 2/3 supplier due diligence issues
- Supply chain disruption history
- Sole-source dependencies
- Geographic concentration risks

LABOR PRACTICES:
- Modern slavery and human trafficking risks
- Child labor allegations
- Forced labor concerns
- Labor rights violations
- Union disputes and strikes

ENVIRONMENTAL, SOCIAL, GOVERNANCE (ESG):
- ESG ratings and scores
- Sustainability commitments and performance
- Carbon emissions and climate commitments
- Waste management practices

PRODUCT QUALITY & SAFETY:
- Product recalls and safety issues
- Quality control problems
- Warranty claim patterns
- Customer complaints (BBB, consumer protection)

WORKPLACE SAFETY:
- OSHA violations and citations
- Workplace fatality investigations
- Industrial accident history
- Safety culture indicators

TRADE COMPLIANCE:
- Customs violations and penalties
- Import/export compliance issues
- Antidumping or countervailing duty cases
- Trade agreement eligibility

In Section 13 (Diversion Risk), emphasize:
- Supply chain integrity
- Product traceability
- Geographic routing risks

In Section 16 (Regulatory Risk Summary), add:
- Supply Chain Risk Assessment
- Labor Practices Risk Rating
- ESG Compliance Risk`,

      'General Commercial/Other': `

CLIENT INDUSTRY: GENERAL COMMERCIAL

ADDITIONAL FOCUS AREAS FOR COMMERCIAL CLIENT:
In your analysis, pay a balanced attention to:

BUSINESS REPUTATION:
- Better Business Bureau (BBB) ratings and complaints
- Consumer protection agency actions
- Glassdoor and employee reviews (workplace culture)
- Customer satisfaction indicators

COMMERCIAL DISPUTES:
- Contract disputes and breach of contract cases
- Commercial arbitration history
- Payment disputes and collection actions
- Vendor/customer relationship issues

TRADEMARK & DOMAIN:
- Trademark disputes and infringement
- Cybersquatting or domain disputes
- Brand protection issues

INSURANCE & LIABILITY:
- Liability insurance claims history
- Directors and Officers (D&O) insurance claims
- Professional liability issues
- General liability concerns

ESG & SUSTAINABILITY:
- Environmental commitments
- Social responsibility initiatives
- Governance structure and practices
- Sustainability reporting

GENERAL DUE DILIGENCE:
- All DBA (Doing Business As) names
- Business continuity and stability
- Customer and supplier concentration
- Market position and competition

In Section 16 (Regulatory Risk Summary), provide:
- Balanced assessment across all risk categories
- Overall commercial relationship risk rating
- Key risk factors to monitor`
    }

    const industryAddon = industryAddons[industry] || industryAddons['General Commercial/Other']

    const concernsNote = concerns.length > 0 
      ? `\n\nCLIENT SPECIFIC CONCERNS: The client has indicated particular interest in: ${concerns.join(', ')}. Pay special attention to these areas in your analysis.`
      : ''

    const fullPrompt = basePrompt + industryAddon + concernsNote

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
          content: fullPrompt
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
