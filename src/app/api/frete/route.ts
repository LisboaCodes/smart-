import { NextRequest, NextResponse } from 'next/server'

// Simulated shipping calculation
// In production, integrate with Correios API (https://www.correios.com.br/atendimento/ferramentas/sistemas/arquivos/manual-de-implementacao-do-calculo-remoto-de-precos-e-prazos)

interface ShippingOption {
  id: string
  name: string
  price: number
  days: string
  company: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cepDestino, peso, valor } = body

    // Origin CEP (store location)
    const cepOrigem = '49680000' // Nossa Senhora da Gloria, SE

    // Validate destination CEP
    const cleanCep = cepDestino.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      return NextResponse.json({ error: 'CEP invalido' }, { status: 400 })
    }

    // Calculate base shipping costs based on distance (simplified)
    const region = cleanCep.substring(0, 1)
    let baseMultiplier = 1

    // Regional pricing (simplified)
    switch (region) {
      case '0': // SP region
      case '1': // SP interior
        baseMultiplier = 1.3
        break
      case '2': // RJ, ES
        baseMultiplier = 1.2
        break
      case '3': // MG
        baseMultiplier = 1.1
        break
      case '4': // BA, SE (local)
        baseMultiplier = 1.0
        break
      case '5': // PE, AL, PB, RN
        baseMultiplier = 1.05
        break
      case '6': // CE, PI, MA
        baseMultiplier = 1.15
        break
      case '7': // GO, TO, DF, MT, MS
        baseMultiplier = 1.25
        break
      case '8': // PR, SC
        baseMultiplier = 1.35
        break
      case '9': // RS
        baseMultiplier = 1.4
        break
      default:
        baseMultiplier = 1.2
    }

    // Base prices
    const pacBase = 15.90
    const sedexBase = 29.90

    // Calculate final prices
    const pacPrice = Math.round(pacBase * baseMultiplier * 100) / 100
    const sedexPrice = Math.round(sedexBase * baseMultiplier * 100) / 100

    // Free shipping for orders over R$ 200
    const freeShipping = valor >= 200

    const options: ShippingOption[] = [
      {
        id: 'pac',
        name: 'PAC',
        price: freeShipping ? 0 : pacPrice,
        days: '8 a 12 dias uteis',
        company: 'Correios',
      },
      {
        id: 'sedex',
        name: 'SEDEX',
        price: sedexPrice,
        days: '3 a 5 dias uteis',
        company: 'Correios',
      },
    ]

    // Add express option for nearby regions
    if (['4', '5'].includes(region)) {
      options.push({
        id: 'motoboy',
        name: 'Entrega Expressa',
        price: 19.90,
        days: '1 a 2 dias uteis',
        company: 'Smart+ Entregas',
      })
    }

    return NextResponse.json({
      cepOrigem,
      cepDestino: cleanCep,
      freeShippingThreshold: 200,
      options,
    })
  } catch (error) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 })
  }
}
