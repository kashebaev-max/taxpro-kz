exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  console.log('API key exists:', !!apiKey)
  console.log('API key prefix:', apiKey ? apiKey.substring(0, 15) : 'NONE')

  try {
    const body = JSON.parse(event.body)
    body.model = 'claude-3-5-sonnet-20241022'
    body.max_tokens = 1000

    console.log('Calling Anthropic API...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body)
    })

    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', JSON.stringify(data).substring(0, 200))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.log('Error:', err.message)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    }
  }
}
