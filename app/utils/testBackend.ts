// utils/testBackend.ts - Test utility for backend connection
export const testBackendConnection = async () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  
  console.log('[TEST] Testing backend connection...')
  console.log('[TEST] Backend URL:', baseURL)
  
  try {
    // Step 1: Test basic connectivity
    const pingResponse = await fetch(baseURL)
    console.log('[TEST] Basic connectivity:', pingResponse.status)
    
    // Step 2: Authenticate
    const authResponse = await fetch(`${baseURL}/api/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    })
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`)
    }
    
    const authData = await authResponse.json()
    const token = authData.id_token
    console.log('[TEST] Authentication successful, token length:', token.length)
    
    // Step 3: Test sheets endpoint
    const sheetsResponse = await fetch(`${baseURL}/api/sheets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!sheetsResponse.ok) {
      throw new Error(`Sheets failed: ${sheetsResponse.status}`)
    }
    
    const sheetsData = await sheetsResponse.json()
    console.log('[TEST] Sheets endpoint successful, count:', sheetsData.length)
    console.log('[TEST] Sample sheet:', sheetsData[0])
    
    return {
      success: true,
      token,
      sheetsCount: sheetsData.length,
      sampleSheet: sheetsData[0]
    }
    
  } catch (error) {
    console.error('[TEST] Backend test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}