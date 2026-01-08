import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { entityName, entityCountry } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Search for "${entityName}"${entityCountry ? ` in ${entityCountry}` : ''}. Provide: legal name, country of registration, primary industry/business type, and whether publicly traded. Be concise (3-4 sentences max).`
        }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }]
      })
    })

    const data = await response.json()
    const result = data.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n')

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
