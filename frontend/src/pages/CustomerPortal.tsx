import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Home, LogOut, Calendar } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

interface Meal {
  id: string
  chef_id: string
  chef_name: string
  name: string
  description: string
  price: number
  quantity: number
  remaining_quantity: number
  container_size: string
  available_date: string
  image?: string
  created_at: string
}

interface Order {
  id: string
  meal_id: string
  meal_name: string
  chef_name: string
  quantity: number
  total_price: number
  status: string
  created_at: string
}

export default function CustomerPortal() {
  const { user: auth0User, isAuthenticated, logout } = useAuth0()
  const navigate = useNavigate()
  const [meals, setMeals] = useState<Meal[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      loadUserInfo()
    }
  }, [isAuthenticated, auth0User])

  useEffect(() => {
    if (user) {
      loadMeals()
      loadOrders()
    }
  }, [user, selectedDate])

  const loadUserInfo = async () => {
    try {
      const userData = {
        id: auth0User?.sub || '',
        email: auth0User?.email || '',
        name: auth0User?.name || '',
        role: 'customer'
      }
      
      await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadMeals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meals?available_date=${selectedDate}`)
      const data = await response.json()
      setMeals(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading meals:', error)
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders?user_id=${user.id}`)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const handleOrder = async (meal: Meal) => {
    if (!user) return

    const quantity = 1
    
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_id: meal.id,
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          quantity
        })
      })

      if (response.ok) {
        alert('Order placed successfully!')
        loadMeals()
        loadOrders()
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order')
    }
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the customer portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="bg-orange-600 hover:bg-orange-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">McShef - Customer Portal</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {user?.name}!</h2>
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Available Meals</h3>
            {loading ? (
              <p>Loading meals...</p>
            ) : meals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  No meals available for this date. Try selecting a different date.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {meals.map((meal) => (
                  <Card key={meal.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{meal.name}</CardTitle>
                          <CardDescription>by Chef {meal.chef_name}</CardDescription>
                        </div>
                        <Badge variant={meal.remaining_quantity > 0 ? 'default' : 'secondary'}>
                          {meal.remaining_quantity} / {meal.quantity} available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{meal.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Container: {meal.container_size}</p>
                          <p className="text-2xl font-bold text-orange-600">${meal.price.toFixed(2)}</p>
                        </div>
                        <Button
                          onClick={() => handleOrder(meal)}
                          disabled={meal.remaining_quantity === 0}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Order Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h3>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  No orders yet. Start ordering!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{order.meal_name}</CardTitle>
                      <CardDescription>by Chef {order.chef_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      <p className="text-lg font-bold text-orange-600">${order.total_price.toFixed(2)}</p>
                      <Badge className="mt-2">{order.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
