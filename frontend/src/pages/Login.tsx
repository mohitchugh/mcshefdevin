import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const { loginWithRedirect, isAuthenticated } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    await loginWithRedirect()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-orange-600">Welcome to McShef</CardTitle>
          <CardDescription className="text-center">Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleLogin}>
            Sign In with Auth0
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
