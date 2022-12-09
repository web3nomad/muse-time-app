import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import cors from '@/lib/api/cors'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api')) {
    let res
    if (req.method === 'OPTIONS') {
      res = new Response(null, { status: 200 })
    } else {
      res = NextResponse.next()
    }
    cors(req, res, {
      // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
    })
    return res
  }
}
