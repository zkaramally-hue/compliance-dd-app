import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { entityName, entityCountry, entityDetails, industry, concerns } = await request.json()

    // Get the proprietary prompt from secure environment variable
    const promptTemplate = process.env.DD_PROMPT_TEMPLATE

    if (!promptTemplate) {
      console.error('DD_PROMPT_TEMPLATE environment variable not set')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Build the full prompt with entity details
    const entityInfo = `Entity: ${entityName}${entityCountry ? ` (${entityCountry})` : ''}${entityDetails ? `. Additional details: ${entityDetails}` : ''}`
    const industryInfo = `Client Industry: ${industry}`
    const concernsInfo = concerns.length > 0 ? `Client Specific Concerns: ${concerns.join(', ')}` : ''

    const fullPrompt = `${entityInfo}\n${industryInfo}\n${concernsInfo}\n\n${promptTemplate}`

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
